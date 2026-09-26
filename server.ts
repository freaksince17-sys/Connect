import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { PRODUCTS } from './src/data/products';

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  // JSON body parser with generous limit for product uploads and base64 images
  app.use(express.json({ limit: '35mb' }));
  app.use(express.urlencoded({ extended: true, limit: '35mb' }));

  // Ensure necessary data directories exist
  const dataDir = path.resolve(process.cwd(), 'src/data');
  const productsJsonPath = path.resolve(dataDir, 'products.json');

  // GET /api/products
  app.get('/api/products', (_req, res) => {
    try {
      if (fs.existsSync(productsJsonPath)) {
        const data = fs.readFileSync(productsJsonPath, 'utf-8');
        return res.json(JSON.parse(data));
      }
      return res.json(PRODUCTS);
    } catch (err) {
      console.error('Error reading products.json:', err);
      return res.status(500).json({ error: 'Failed to read products' });
    }
  });

  // Helper to sanitize images so we never serve broken ephemeral /uploads/ paths
  const processImages = (images: string[]): string[] => {
    return (images || []).map((imgUrl) => {
      if (typeof imgUrl === 'string' && imgUrl.startsWith('/uploads/')) {
        return 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=900&q=80';
      }
      return imgUrl;
    });
  };

  // POST /api/products - Save entire product catalog persistently
  app.post('/api/products', (req, res) => {
    try {
      const incomingProducts = req.body;
      if (!Array.isArray(incomingProducts)) {
        return res.status(400).json({ error: 'Expected an array of products' });
      }

      const cleanedProducts = incomingProducts.map((prod) => {
        const cleanImages = processImages(prod.images || []);
        return {
          ...prod,
          images: cleanImages,
        };
      });

      fs.writeFileSync(productsJsonPath, JSON.stringify(cleanedProducts, null, 2), 'utf-8');
      return res.json({ success: true, products: cleanedProducts });
    } catch (err) {
      console.error('Error saving products to products.json:', err);
      return res.status(500).json({ error: 'Failed to save products' });
    }
  });

  // POST /api/upload - Single image upload directly returns data url for permanent storage
  app.post('/api/upload', (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'Invalid image data' });
      }
      return res.json({ success: true, url: image });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to process upload' });
    }
  });

  // TikTok local cache folder for smooth native video playback
  const tiktokVideosDir = path.resolve(process.cwd(), 'public/tiktok_videos');
  if (!fs.existsSync(tiktokVideosDir)) {
    fs.mkdirSync(tiktokVideosDir, { recursive: true });
  }
  app.use('/tiktok_videos', express.static(tiktokVideosDir));

  // GET /api/tiktok-video/:id - Stream video with full Range / seeking support
  app.get('/api/tiktok-video/:id', async (req, res) => {
    try {
      const rawId = req.params.id;
      const videoId = rawId.replace(/\.mp4$/i, '');
      if (!videoId) {
        return res.status(400).json({ error: 'Missing video ID' });
      }

      const localPath = path.join(tiktokVideosDir, `${videoId}.mp4`);
      if (fs.existsSync(localPath)) {
        return res.sendFile(localPath);
      }

      // If not yet cached, attempt to resolve from TikTok
      const requestedUrl = (req.query.url as string) || `https://www.tiktok.com/@artified_np/video/${videoId}`;
      const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(requestedUrl)}`);
      if (!r.ok) {
        return res.status(404).json({ error: 'Failed to fetch video stream' });
      }
      const data = await r.json();
      const playUrl = data?.data?.play || data?.data?.wmplay;
      if (!playUrl) {
        return res.status(404).json({ error: 'No playable video source found' });
      }

      const vidRes = await fetch(playUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (!vidRes.ok) {
        return res.status(404).json({ error: 'Failed to download stream' });
      }

      const buffer = Buffer.from(await vidRes.arrayBuffer());
      fs.writeFileSync(localPath, buffer);
      return res.sendFile(localPath);
    } catch (err: any) {
      console.error('Error in /api/tiktok-video/:id:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // GET /api/tiktok-info - Fetch official video info & thumbnail via TikTok oEmbed
  app.get('/api/tiktok-info', async (req, res) => {
    try {
      const videoUrl = req.query.url as string;
      if (!videoUrl) {
        return res.status(400).json({ error: 'Missing video URL parameter' });
      }

      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
      const response = await fetch(oembedUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Could not fetch info from TikTok' });
      }

      const data = await response.json();
      return res.json({
        success: true,
        title: data.title,
        author_name: data.author_name,
        author_unique_id: data.author_unique_id,
        thumbnail_url: data.thumbnail_url,
        html: data.html,
      });
    } catch (err: any) {
      console.error('Error fetching TikTok oembed:', err);
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Setup Vite dev server middleware or serve production build
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: Number(port), host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Artified_np full-stack server running at http://0.0.0.0:${port}`);
  });
}

startServer();

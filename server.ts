import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { instagramGetUrl } from 'instagram-url-direct';
import { PRODUCTS } from './src/data/products';

const instagramOAuthStates = new Map<string, number>();
const instagramAuthPath = path.resolve(process.cwd(), 'data/instagram-auth.enc.json');

const getInstagramOAuthConfig = () => ({
  appId: process.env.INSTAGRAM_APP_ID || '',
  appSecret: process.env.INSTAGRAM_APP_SECRET || '',
  redirectUri: process.env.INSTAGRAM_REDIRECT_URI || '',
});

const readInstagramAuth = () => {
  const { appSecret } = getInstagramOAuthConfig();
  if (!appSecret || !fs.existsSync(instagramAuthPath)) return null;
  try {
    const stored = JSON.parse(fs.readFileSync(instagramAuthPath, 'utf8'));
    const salt = Buffer.from(stored.salt, 'base64');
    const iv = Buffer.from(stored.iv, 'base64');
    const tag = Buffer.from(stored.tag, 'base64');
    const key = crypto.scryptSync(appSecret, salt, 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([decipher.update(Buffer.from(stored.data, 'base64')), decipher.final()]).toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const writeInstagramAuth = (auth: Record<string, unknown>) => {
  const { appSecret } = getInstagramOAuthConfig();
  if (!appSecret) throw new Error('Instagram app secret is not configured.');
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.scryptSync(appSecret, salt, 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(auth), 'utf8'), cipher.final()]);
  fs.mkdirSync(path.dirname(instagramAuthPath), { recursive: true });
  fs.writeFileSync(instagramAuthPath, JSON.stringify({
    salt: salt.toString('base64'), iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64'),
  }), { encoding: 'utf8', mode: 0o600 });
};

const decodeHtml = (value: string): string => value
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&#(x[\da-f]+|\d+);/gi, (match, code) => {
    const point = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
    return Number.isInteger(point) && point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match;
  });

const safeInstagramMediaUrl = (value: string): string => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
};

const getMetaContent = (html: string, key: string): string => {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const attributes = new Map<string, string>();
    for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)) {
      attributes.set(match[1].toLowerCase(), decodeHtml(match[3]));
    }
    if ((attributes.get('property') || attributes.get('name') || '').toLowerCase() === key.toLowerCase()) {
      return attributes.get('content') || '';
    }
  }
  return '';
};

const getEmbeddedInstagramString = (html: string, patterns: RegExp[]): string => {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      try { return JSON.parse(`"${match[1]}"`); } catch { /* Try the next embedded field pattern. */ }
    }
  }
  return '';
};

const parsePublicInstagramMetadata = (html: string) => {
  const socialDescription = getMetaContent(html, 'og:description') || getMetaContent(html, 'twitter:description');
  const embeddedCaption = getEmbeddedInstagramString(html, [
    /"caption_text"\s*:\s*"((?:\\.|[^"\\])*)"/,
    /"caption"\s*:\s*\{\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"/,
  ]);
  const caption = embeddedCaption || socialDescription
    .replace(/^.*?\s-\s(?:See Instagram photos and videos from\s+)?@?[\w.]+:\s*/i, '')
    .replace(/^\s*\d[\d,.]*\s+(?:likes?|comments?)\b[^:]*:\s*/i, '')
    .replace(/^\s*[\w.]+\s+on Instagram:\s*/i, '')
    .replace(/^['“"]|['”"]$/g, '')
    .trim();
  const ogTitle = getMetaContent(html, 'og:title') || getMetaContent(html, 'twitter:title');
  const titleFromCaption = caption.split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
  const title = titleFromCaption
    ? titleFromCaption.replace(/#[\w.]+/g, '').trim().slice(0, 120)
    : ogTitle.replace(/^.*?\s+on Instagram:\s*/i, '').replace(/^['“"]|['”"]$/g, '').trim();
  const thumbnail = safeInstagramMediaUrl(getMetaContent(html, 'og:image') || getMetaContent(html, 'twitter:image'));
  let video = getMetaContent(html, 'og:video:secure_url') || getMetaContent(html, 'og:video') || getMetaContent(html, 'twitter:player:stream') ||
    getEmbeddedInstagramString(html, [
      /"video_url"\s*:\s*"((?:\\.|[^"\\])*)"/,
      /"video_versions"\s*:\s*\[\s*\{[^}]*"url"\s*:\s*"((?:\\.|[^"\\])*)"/,
    ]);

  const handleFromTitle = ogTitle.match(/^@?([A-Za-z0-9._]+)\s+on Instagram\b/i);
  const handleMatch = handleFromTitle || html.match(/"username"\s*:\s*"([A-Za-z0-9._]+)"/);

  return {
    title,
    caption,
    handle: handleMatch?.[1] ? `@${handleMatch[1]}` : '',
    thumbnail,
    video: safeInstagramMediaUrl(video),
  };
};

const resolvePublicInstagramMetadata = async (postUrl: string) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      instagramGetUrl(postUrl, { retries: 0, delay: 500 }),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error('Instagram media lookup timed out.')), 9000);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

const cacheInstagramVideo = async (videoUrl: string, shortcode: string, postUrl: string): Promise<string> => {
  try {
    const remote = new URL(videoUrl);
    if (remote.protocol !== 'https:' || !/(^|\.)(cdninstagram\.com|fbcdn\.net)$/i.test(remote.hostname)) return '';

    const filename = `${shortcode}.mp4`;
    const videoDirectory = path.resolve(process.cwd(), 'public/instagram_videos');
    const localPath = path.join(videoDirectory, filename);
    fs.mkdirSync(videoDirectory, { recursive: true });
    if (fs.existsSync(localPath)) return `/instagram_videos/${filename}`;

    const response = await fetch(remote, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
        'Referer': postUrl,
      },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return '';
    const contentType = response.headers.get('content-type') || '';
    const contentLength = Number(response.headers.get('content-length') || 0);
    if ((!contentType.includes('video') && !contentType.includes('octet-stream')) || contentLength > 100_000_000) return '';

    const reader = response.body?.getReader();
    if (!reader) return '';
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > 100_000_000) {
        await reader.cancel();
        return '';
      }
      chunks.push(value);
    }
    const bytes = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), totalBytes);
    if (!bytes.length) return '';
    fs.writeFileSync(localPath, bytes);
    return `/instagram_videos/${filename}`;
  } catch {
    return '';
  }
};

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

  app.get('/api/instagram/connection', (_req, res) => {
    const config = getInstagramOAuthConfig();
    const auth = readInstagramAuth();
    return res.json({
      configured: Boolean(config.appId && config.appSecret && config.redirectUri),
      connected: Boolean(auth?.accessToken && auth?.userId),
      username: typeof auth?.username === 'string' ? auth.username : '',
    });
  });

  app.get('/api/instagram/connect', (req, res) => {
    const { appId, appSecret, redirectUri } = getInstagramOAuthConfig();
    if (!appId || !appSecret || !redirectUri) {
      return res.status(503).send('Instagram connection is not configured yet. The site owner must add its Meta app ID, app secret, and exact OAuth callback URL before connecting.');
    }
    for (const [state, expiresAt] of instagramOAuthStates) {
      if (expiresAt <= Date.now()) instagramOAuthStates.delete(state);
    }
    const state = crypto.randomBytes(32).toString('hex');
    instagramOAuthStates.set(state, Date.now() + 10 * 60 * 1000);
    const authorizeUrl = new URL('https://www.instagram.com/oauth/authorize');
    authorizeUrl.search = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'instagram_business_basic',
      state,
    }).toString();
    return res.redirect(authorizeUrl.toString());
  });

  app.get('/api/instagram/callback', async (req, res) => {
    const errorRedirect = '/?instagram_connection=failed';
    const { appId, appSecret, redirectUri } = getInstagramOAuthConfig();
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    const expiresAt = instagramOAuthStates.get(state);
    instagramOAuthStates.delete(state);
    if (!appId || !appSecret || !redirectUri || !code || !expiresAt || expiresAt < Date.now()) {
      return res.redirect(errorRedirect);
    }

    try {
      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const shortLived = await tokenResponse.json() as any;
      if (!tokenResponse.ok || !shortLived.access_token || !shortLived.user_id) throw new Error('Instagram authorization code exchange failed.');

      const longTokenUrl = new URL('https://graph.instagram.com/access_token');
      longTokenUrl.search = new URLSearchParams({
        grant_type: 'ig_exchange_token',
        client_secret: appSecret,
        access_token: shortLived.access_token,
      }).toString();
      const longTokenResponse = await fetch(longTokenUrl, { signal: AbortSignal.timeout(15000) });
      const longToken = await longTokenResponse.json() as any;
      const accessToken = longTokenResponse.ok && longToken.access_token ? longToken.access_token : shortLived.access_token;
      const expiresIn = Number(longToken.expires_in || shortLived.expires_in || 0);

      const profileUrl = new URL('https://graph.instagram.com/me');
      profileUrl.search = new URLSearchParams({ fields: 'user_id,username', access_token: accessToken }).toString();
      const profileResponse = await fetch(profileUrl, { signal: AbortSignal.timeout(15000) });
      const profile = await profileResponse.json() as any;
      if (!profileResponse.ok || !profile.user_id) throw new Error('Instagram profile lookup failed.');

      writeInstagramAuth({
        accessToken,
        userId: String(profile.user_id || shortLived.user_id),
        username: String(profile.username || ''),
        expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
        connectedAt: new Date().toISOString(),
      });
      return res.redirect('/?instagram_connection=connected');
    } catch (error) {
      console.error('Instagram OAuth callback failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.redirect(errorRedirect);
    }
  });

  // Resolve post details from the public page first, use owned-account Graph
  // media when configured, then fall back to Instagram's official embed.
  app.get('/api/instagram-info', async (req, res) => {
    const postUrl = typeof req.query.url === 'string' ? req.query.url : '';
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(postUrl);
    } catch {
      return res.status(400).json({ error: 'Paste a valid Instagram post or Reel URL.' });
    }

    if (!['instagram.com', 'www.instagram.com'].includes(parsedUrl.hostname) ||
        !/^\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?$/.test(parsedUrl.pathname)) {
      return res.status(400).json({ error: 'Use a public Instagram post, Reel, or video link.' });
    }

    const requestedPath = parsedUrl.pathname.replace(/\/$/, '');
    try {
      const connectedInstagram = readInstagramAuth();
      const accessToken = connectedInstagram?.accessToken || process.env.INSTAGRAM_GRAPH_ACCESS_TOKEN;
      const instagramUserId = connectedInstagram?.userId || process.env.INSTAGRAM_GRAPH_USER_ID;
      if (accessToken && instagramUserId) {
        const fields = connectedInstagram?.accessToken
          ? 'id,caption,media_type,media_url,thumbnail_url,permalink,username,children{media_type,media_url,thumbnail_url}'
          : 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,username,children{media_type,media_url,thumbnail_url}';
        const apiVersion = process.env.META_GRAPH_API_VERSION || 'v26.0';
        const graphHost = connectedInstagram?.accessToken ? 'graph.instagram.com' : 'graph.facebook.com';
        let nextUrl: string | null = `https://${graphHost}/${apiVersion}/${encodeURIComponent(instagramUserId)}/media?${new URLSearchParams({ fields, limit: '100', access_token: accessToken })}`;

        // Check recent account posts first; public embed is the fallback for other accounts.
        for (let page = 0; nextUrl && page < 20; page++) {
          const response: Response = await fetch(nextUrl);
          const result: any = await response.json();
          if (!response.ok) break;
          const media = (result.data || []).find((item: any) => {
            try { return new URL(item.permalink).pathname.replace(/\/$/, '') === requestedPath; }
            catch { return false; }
          });
          if (media) {
            const children = media.children?.data || [];
            const childVideo = children.find((child: any) => child.media_type === 'VIDEO');
            const childImage = children.find((child: any) => child.media_type === 'IMAGE');
            const isVideo = media.media_type === 'VIDEO' || media.media_product_type === 'REELS';
            const caption = media.caption || '';
            const title = caption.split(/\r?\n/).map((line: string) => line.trim()).find(Boolean) || '';
            const sourceVideo = (isVideo ? media.media_url : childVideo?.media_url) || '';
            const shortcode = requestedPath.split('/')[2];
            const video = sourceVideo ? (await cacheInstagramVideo(sourceVideo, shortcode, parsedUrl.toString())) || sourceVideo : '';
            const image = media.thumbnail_url || media.media_url || childImage?.media_url || childVideo?.thumbnail_url || '';
            return res.json({
              success: true,
              title: title.slice(0, 120),
              caption,
              handle: media.username ? `@${media.username}` : '',
              image,
              thumbnail: image,
              video,
              videoUrl: video,
              embedUrl: `${parsedUrl.origin}${requestedPath}/embed/`,
              source: 'instagram-graph',
            });
          }
          const candidate = result.paging?.next;
          nextUrl = candidate?.startsWith(`https://${graphHost}/`) ? candidate : null;
        }
      }

      // Instagram's public embed normally only gives us an iframe. Try the
      // public media resolver so a public Reel can provide a direct MP4 for
      // native muted hover playback in the journal.
      try {
        const resolved = await resolvePublicInstagramMetadata(parsedUrl.toString());
        const media = Array.isArray(resolved.media_details) ? resolved.media_details : [];
        const videoMedia = media.find((entry) => entry.type === 'video');
        const imageMedia = media.find((entry) => entry.type === 'image');
        const sourceVideo = videoMedia?.url || '';
        const image = videoMedia?.thumbnail || imageMedia?.url || '';
        const caption = resolved.post_info?.caption || '';
        const title = caption.split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
        if (sourceVideo || image || caption) {
          const shortcode = requestedPath.split('/')[2];
          const video = sourceVideo ? (await cacheInstagramVideo(sourceVideo, shortcode, parsedUrl.toString())) || sourceVideo : '';
          const username = resolved.post_info?.owner_username || '';
          return res.json({
            success: true,
            title: title.replace(/#[\w.]+/g, '').trim().slice(0, 120),
            caption,
            handle: username ? `@${username}` : '',
            image,
            thumbnail: image,
            video,
            videoUrl: video,
            embedUrl: `https://www.instagram.com${requestedPath}/embed/`,
            source: 'instagram-public-resolver',
          });
        }
      } catch {
        // Instagram may rate-limit or change the public resolver response;
        // fall through to the public page and official embed.
      }

      // Public post pages often expose Open Graph fields for link previews.
      // Parse only the metadata required by the journal editor.
      try {
        const pageResponse = await fetch(parsedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: AbortSignal.timeout(9000),
        });
        const finalHost = new URL(pageResponse.url).hostname;
        if (pageResponse.ok && ['instagram.com', 'www.instagram.com', 'm.instagram.com'].includes(finalHost)) {
          const pageHtml = await pageResponse.text();
          if (pageHtml.length <= 5_000_000) {
            const metadata = parsePublicInstagramMetadata(pageHtml);
            if (metadata.title || metadata.caption || metadata.thumbnail || metadata.video) {
              const shortcode = requestedPath.split('/')[2];
              const video = metadata.video ? (await cacheInstagramVideo(metadata.video, shortcode, parsedUrl.toString())) || metadata.video : '';
              return res.json({
                success: true,
                title: metadata.title.slice(0, 120),
                caption: metadata.caption,
                handle: metadata.handle,
                image: metadata.thumbnail,
                thumbnail: metadata.thumbnail,
                video,
                videoUrl: video,
                embedUrl: `https://www.instagram.com${requestedPath}/embed/`,
                source: 'instagram-public-page',
              });
            }
          }
        }
      } catch {
        // Instagram may block server-side previews; try its supported embed endpoint next.
      }

      // Meta's public oEmbed endpoint provides the supported, playable embed for
      // public posts. It intentionally does not provide a downloadable MP4.
      const apiVersion = process.env.META_GRAPH_API_VERSION || 'v26.0';
      const oembedUrl = new URL(`https://graph.facebook.com/${apiVersion}/instagram_oembed`);
      oembedUrl.searchParams.set('url', parsedUrl.toString());
      oembedUrl.searchParams.set('maxwidth', '540');
      const response = await fetch(oembedUrl);
      const data: any = await response.json();
      if (!response.ok || !data.html) {
        return res.status(response.ok ? 502 : response.status).json({
          error: 'Instagram could not create an embed for this link. Check that the post is public and still available.'
        });
      }
      return res.json({
        success: true,
        title: data.title || '',
        caption: data.caption || '',
        handle: data.author_name ? `@${data.author_name}` : '',
        image: data.thumbnail_url || '',
        thumbnail: data.thumbnail_url || '',
        video: '',
        videoUrl: '',
        embedUrl: `${parsedUrl.origin}${requestedPath}/embed/`,
        source: 'instagram-embed',
      });
    } catch (error: any) {
      console.error('Instagram media lookup failed:', error);
      return res.status(502).json({ error: 'Could not reach Instagram. Check the server connection and try again.' });
    }
  });

  // TikTok local cache folder for smooth native video playback
  const tiktokVideosDir = path.resolve(process.cwd(), 'public/tiktok_videos');
  if (!fs.existsSync(tiktokVideosDir)) {
    fs.mkdirSync(tiktokVideosDir, { recursive: true });
  }
  app.use('/tiktok_videos', express.static(tiktokVideosDir));

  const instagramVideosDir = path.resolve(process.cwd(), 'public/instagram_videos');
  fs.mkdirSync(instagramVideosDir, { recursive: true });
  app.use('/instagram_videos', express.static(instagramVideosDir, { fallthrough: false, maxAge: '1h' }));

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

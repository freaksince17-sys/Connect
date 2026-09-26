const https = require('https');

async function test() {
  const url = "https://www.instagram.com/reel/C7-x8oOvx4g/";
  console.log("Testing embed page...");
  try {
    const embedUrl = `https://www.instagram.com/reel/C7-x8oOvx4g/embed/captioned/`;
    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log("Embed status:", res.status);
    const html = await res.text();
    console.log("Embed html length:", html.length);
    // Find image or video in embed html
    const videoMatches = html.match(/video_url\\?":\\?"([^"\\]+)/g) || html.match(/"(https:\/\/[^"]+\.mp4[^"]*)"/g);
    console.log("Video matches:", videoMatches);
    const imgMatches = html.match(/display_url\\?":\\?"([^"\\]+)/g) || html.match(/EmbeddedMediaImage" src="([^"]+)"/g);
    console.log("Image matches:", imgMatches?.slice(0, 3));
  } catch (err) {
    console.error(err);
  }
}
test();

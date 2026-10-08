import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import axios from 'axios';

let fontBufferCache = null;
let fontRegistered = false;
const FONT_NAME = 'TeleRobotoMono';
let bgBufferCache = null;

export async function createFakeTelegramProfile({ name, phone, bio, username, avatarUrl }) {
    if (!name || !phone || !bio || !username || !avatarUrl) {
        throw new Error('Parameter name, phone, bio, username, dan avatarUrl wajib diisi.');
    }

    const TTF_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/roboto-mono@latest/latin-700-normal.ttf';
    const BG_URL = 'https://raw.githubusercontent.com/ryyntwx/Image-rinn/refs/heads/main/c8ac4ffc-618c-411c-b36c-45c06c7e5a5e.png';

    if (!fontRegistered) {
        try {
            if (!fontBufferCache) {
                const fontRes = await axios.get(TTF_URL, {
                    responseType: 'arraybuffer',
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                fontBufferCache = Buffer.from(fontRes.data);
            }
            fontRegistered = GlobalFonts.register(fontBufferCache, FONT_NAME);
        } catch (errFont) {
            console.error("Gagal load font:", errFont.message);
        }
    }

    const fontFamily = fontRegistered ? FONT_NAME : 'sans-serif';

    if (!bgBufferCache) {
        const bgRes = await axios.get(BG_URL, { 
            responseType: 'arraybuffer', 
            headers: { 'User-Agent': 'Mozilla/5.0' } 
        });
        bgBufferCache = Buffer.from(bgRes.data);
    }

    // Download avatar dengan validasi
    let avatarBuffer;
    try {
        const avatarRes = await axios.get(avatarUrl, { 
            responseType: 'arraybuffer', 
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        avatarBuffer = Buffer.from(avatarRes.data);
    } catch (e) {
        throw new Error("Gagal mendownload foto avatar dari URL yang diberikan.");
    }

    const bgImg = await loadImage(bgBufferCache);
    const ppImg = await loadImage(avatarBuffer);

    const canvas = createCanvas(bgImg.width, bgImg.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    let cleanUsername = username.startsWith('@') ? username : '@' + username;

    const config = {
        pp: { x: 571, y: 244, r: 137 },
        nama: { y: 448, size: 50 },
        ponsel: { x: 80, y: 883, size: 35 },
        bio: { x: 83, y: 996, size: 36 },
        username: { x: 83, y: 1143, size: 38 }
    };

    ctx.save();
    ctx.beginPath();
    ctx.arc(config.pp.x, config.pp.y, config.pp.r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(ppImg, config.pp.x - config.pp.r, config.pp.y - config.pp.r, config.pp.r * 2, config.pp.r * 2);
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${config.nama.size}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, canvas.width / 2, config.nama.y);

    ctx.textAlign = 'left';
    ctx.font = `${config.ponsel.size}px ${fontFamily}`;
    ctx.fillText(phone, config.ponsel.x, config.ponsel.y);

    ctx.font = `${config.bio.size}px ${fontFamily}`;
    ctx.fillText(bio, config.bio.x, config.bio.y);

    ctx.font = `${config.username.size}px ${fontFamily}`;
    ctx.fillText(cleanUsername, config.username.x, config.username.y);

    const buffer = await canvas.encode('png');
    return buffer;
}

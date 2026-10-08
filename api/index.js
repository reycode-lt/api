import { mediafire } from '../lib/mediafire.js';
import { scrapeTikTok } from '../lib/tiktok.js';
import { findAmPreset } from '../lib/amfinder.js';
import tempmail from '../lib/tempmail.js';
import { createFreeFireGuest } from '../lib/createguestff.js';
import { mediaDownloader } from '../lib/aiodownload.js';
import { sendMagicLink, verifyAndActivate } from '../lib/aligmotion.js';
import { generateAiImage } from '../lib/texttoimage.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const path = req.url || '';
    const query = req.query || {};
    const body = req.body || {};
    const params = { ...query, ...body };
    const urlParam = params.url || params.link;
    const timestamp = new Date().toISOString();

    try {
        // Route: /ai/txt2img (AI Text to Image Generator)
        if (path.includes('/ai/txt2img')) {
            const prompt = params.prompt || params.text;
            const negativePrompt = params.negative || params.negative_prompt || "";

            if (!prompt) {
                return res.status(400).json({ 
                    status: false, 
                    creator: 'ReyCode', 
                    message: "Parameter 'prompt' wajib diisi. Contoh: /ai/txt2img?prompt=1girl,masterpiece",
                    timestamp 
                });
            }

            const result = await generateAiImage(prompt, negativePrompt);
            return res.status(200).json({ 
                status: true, 
                creator: 'ReyCode', 
                message: "AI image generated successfully.",
                result, 
                timestamp 
            });
        }

        // Route: /tools/amgen (Alight Motion Generator API)
        if (path.includes('/tools/amgen')) {
            const action = String(params.action || '').toLowerCase();
            const email = params.email;
            const targetLink = params.link || params.url;

            if (action === 'sendlink') {
                if (!email) {
                    return res.status(400).json({ 
                        status: false, 
                        creator: 'ReyCode', 
                        message: "Parameter 'email' wajib diisi.",
                        timestamp 
                    });
                }
                const result = await sendMagicLink(email);
                return res.status(200).json({ 
                    status: true, 
                    creator: 'ReyCode', 
                    message: "Magic link berhasil diproses.",
                    result, 
                    timestamp 
                });
            }

            if (action === 'veriflink') {
                if (!email || !targetLink) {
                    return res.status(400).json({ 
                        status: false, 
                        creator: 'ReyCode', 
                        message: "Parameter 'email' dan 'link' wajib diisi.",
                        timestamp 
                    });
                }
                const result = await verifyAndActivate(email, targetLink);
                return res.status(200).json({ 
                    status: true, 
                    creator: 'ReyCode', 
                    message: "Akun Alight Motion berhasil diaktifkan menjadi Premium!",
                    result, 
                    timestamp 
                });
            }

            return res.status(200).json({
                status: true,
                creator: 'ReyCode',
                message: "Monika Labs Alight Motion API is active!",
                endpoints: {
                    sendlink: "/tools/amgen?action=sendlink&email=TARGET_EMAIL",
                    veriflink: "/tools/amgen?action=veriflink&email=TARGET_EMAIL&link=MAGIC_LINK"
                },
                timestamp
            });
        }

        // Route: /download/aio (All-in-One Media Downloader)
        if (path.includes('/download/aio')) {
            if (!urlParam) {
                return res.status(400).json({
                    status: false,
                    creator: 'ReyCode',
                    message: "Parameter 'url' wajib disertakan. Contoh: /download/aio?url=<link_target>",
                    timestamp
                });
            }

            const result = await mediaDownloader(urlParam);
            return res.status(200).json({ 
                status: true, 
                creator: 'ReyCode', 
                message: "Media berhasil diambil.",
                result, 
                timestamp 
            });
        }

        // Route: /tools/ffguest (Free Fire Guest Account Generator)
        if (path.includes('/tools/ffguest')) {
            const count = parseInt(params.count || params.jumlah || 1);
            const result = await createFreeFireGuest(count);
            return res.status(200).json({
                status: true,
                creator: 'ReyCode',
                message: `Berhasil generate ${count} akun guest Free Fire.`,
                result,
                timestamp
            });
        }

        // Route: /tools/tempmail (Temporary Mail API)
        if (path.includes('/tools/tempmail')) {
            const action = String(params.action || '').toLowerCase();

            if (action === 'create') {
                const data = await tempmail.createTempEmail(params.username || params.mailbox || params.name);
                return res.status(200).json({ 
                    status: true, 
                    creator: 'ReyCode', 
                    provider: 'akunlama.com', 
                    message: "Mailbox sementara berhasil dibuat.",
                    result: data, 
                    timestamp 
                });
            }

            if (action === 'inbox' || action === 'check') {
                const username = params.username || params.mailbox || params.recipient;
                if (!username) {
                    return res.status(400).json({ 
                        status: false, 
                        creator: 'ReyCode', 
                        message: "Parameter 'username' wajib diisi.",
                        timestamp 
                    });
                }
                const data = await tempmail.getInbox(username);
                return res.status(200).json({ 
                    status: true, 
                    creator: 'ReyCode', 
                    provider: 'akunlama.com', 
                    message: "Inbox berhasil dimuat.",
                    result: data, 
                    timestamp 
                });
            }

            if (action === 'message') {
                const username = params.username || params.mailbox || params.recipient;
                const id = params.id || params.messageId || params.uid;

                if (!username || !id) {
                    return res.status(400).json({ 
                        status: false, 
                        creator: 'ReyCode', 
                        message: "Parameter 'username' dan 'id' wajib diisi.",
                        timestamp 
                    });
                }
                const data = await tempmail.getMessage(username, id);
                return res.status(200).json({ 
                    status: true, 
                    creator: 'ReyCode', 
                    provider: 'akunlama.com', 
                    message: "Pesan berhasil dibaca.",
                    result: data, 
                    timestamp 
                });
            }

            return res.status(200).json({
                status: true,
                creator: 'ReyCode',
                message: "Monika Labs TempMail API is active!",
                endpoints: {
                    create: "/tools/tempmail?action=create",
                    inbox: "/tools/tempmail?action=inbox&username=USERNAME",
                    message: "/tools/tempmail?action=message&username=USERNAME&id=MESSAGE_ID"
                },
                timestamp
            });
        }

        // Route: /download/tiktok (TikTok Downloader)
        if (path.includes('/download/tiktok')) {
            if (!urlParam) {
                return res.status(400).json({ 
                    status: false, 
                    creator: 'ReyCode', 
                    message: "Parameter 'url' TikTok wajib disertakan.",
                    timestamp 
                });
            }
            const result = await scrapeTikTok(urlParam);
            return res.status(200).json({ 
                status: true, 
                creator: 'ReyCode', 
                message: "TikTok media berhasil diunduh.",
                result, 
                timestamp 
            });
        }

        // Route: /download/mediafire (MediaFire Downloader)
        if (path.includes('/download/mediafire')) {
            if (!urlParam) {
                return res.status(400).json({ 
                    status: false, 
                    creator: 'ReyCode', 
                    message: "Parameter 'url' MediaFire wajib disertakan.",
                    timestamp 
                });
            }
            const result = await mediafire(urlParam);
            return res.status(200).json({ 
                status: true, 
                creator: 'ReyCode', 
                message: "MediaFire file info berhasil diambil.",
                result, 
                timestamp 
            });
        }

        // Route: /tools/amfinder (AM Preset Finder)
        if (path.includes('/tools/amfinder')) {
            if (!urlParam) {
                return res.status(400).json({ 
                    status: false, 
                    creator: 'ReyCode', 
                    message: "Parameter 'url' TikTok wajib disertakan.",
                    timestamp 
                });
            }
            const result = await findAmPreset(urlParam);
            return res.status(200).json({ 
                status: true, 
                creator: 'ReyCode', 
                message: "Alight Motion preset berhasil ditemukan.",
                result, 
                timestamp 
            });
        }

        // Default response / Root API
        return res.status(200).json({
            status: true,
            message: "Monika Labs API is active!",
            endpoints: {
                txt2img: "/ai/txt2img?prompt=...&negative=...",
                amgen: "/tools/amgen?action=sendlink&email=... / veriflink&email=...&link=...",
                aio: "/download/aio?url=<target_url>",
                tiktok: "/download/tiktok?url=<tiktok_url>",
                mediafire: "/download/mediafire?url=<mediafire_url>",
                amfinder: "/tools/amfinder?url=<tiktok_url_for_preset>",
                tempmail: "/tools/tempmail?action=create / inbox / message",
                ffguest: "/tools/ffguest?count=1 (max 10)"
            },
            creator: "ReyCode",
            timestamp
        });

    } catch (err) {
        return res.status(400).json({
            status: false,
            creator: 'ReyCode',
            message: err.message,
            timestamp
        });
    }
}

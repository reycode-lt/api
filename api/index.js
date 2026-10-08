import { mediafire } from '../lib/mediafire.js';
import { scrapeTikTok } from '../lib/tiktok.js';
import { findAmPreset } from '../lib/amfinder.js';
import tempmail from '../lib/tempmail.js';

export default async function handler(req, res) {
    // Set header CORS agar API bisa diakses secara publik
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const path = req.url || '';
    const query = req.query || {};
    const body = req.body || {};
    
    // Gabungkan parameter dari query string atau body POST
    const params = { ...query, ...body };
    const urlParam = params.url || params.link;

    try {
        // Route: /tools/tempmail (Temporary Mail API)
        if (path.includes('/tools/tempmail')) {
            const action = String(params.action || '').toLowerCase();

            if (action === 'create') {
                const data = await tempmail.createTempEmail(
                    params.username || params.mailbox || params.name
                );
                return res.status(200).json({
                    status: true,
                    creator: 'ReyCode',
                    provider: 'akunlama.com',
                    data
                });
            }

            if (action === 'inbox' || action === 'check') {
                const username = params.username || params.mailbox || params.recipient;
                if (!username) {
                    return res.status(400).json({
                        status: false,
                        message: "Parameter 'username' wajib diisi. Contoh: /tools/tempmail?action=inbox&username=namakamu"
                    });
                }

                const data = await tempmail.getInbox(username);
                return res.status(200).json({
                    status: true,
                    creator: 'ReyCode',
                    provider: 'akunlama.com',
                    data
                });
            }

            if (action === 'message') {
                const username = params.username || params.mailbox || params.recipient;
                const id = params.id || params.messageId || params.uid;
                const region = params.region || 'us';

                if (!username || !id) {
                    return res.status(400).json({
                        status: false,
                        message: "Parameter 'username' dan 'id' (messageId) wajib diisi."
                    });
                }

                const data = await tempmail.getMessage(username, id, region);
                return res.status(200).json({
                    status: true,
                    creator: 'ReyCode',
                    provider: 'akunlama.com',
                    data
                });
            }

            // Info panduan penggunaan jika action tidak diisi atau salah
            return res.status(200).json({
                status: true,
                message: "Monika Labs TempMail API is active!",
                endpoints: {
                    create: "/tools/tempmail?action=create",
                    inbox: "/tools/tempmail?action=inbox&username=USERNAME",
                    message: "/tools/tempmail?action=message&username=USERNAME&id=MESSAGE_ID&region=us"
                },
                creator: "ReyCode"
            });
        }

        // Route: /download/tiktok (Downloader TikTok)
        if (path.includes('/download/tiktok')) {
            if (!urlParam) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter 'url' TikTok wajib disertakan. Contoh: /download/tiktok?url=<link_tiktok>"
                });
            }

            const result = await scrapeTikTok(urlParam);
            return res.status(200).json({ status: true, result });
        }

        // Route: /download/mediafire (Downloader MediaFire)
        if (path.includes('/download/mediafire')) {
            if (!urlParam) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter 'url' MediaFire wajib disertakan. Contoh: /download/mediafire?url=<link_mediafire>"
                });
            }

            const result = await mediafire(urlParam);
            return res.status(200).json({ status: true, result });
        }

        // Route: /tools/amfinder (Pencari Preset AM dari Komentar TikTok)
        if (path.includes('/tools/amfinder')) {
            if (!urlParam) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter 'url' TikTok wajib disertakan. Contoh: /tools/amfinder?url=<link_tiktok>"
                });
            }

            const result = await findAmPreset(urlParam);
            return res.status(200).json({ status: true, result });
        }

        // Default response / Root API
        return res.status(200).json({
            status: true,
            message: "Monika Labs API is active!",
            endpoints: {
                tempmail: "/tools/tempmail?action=create / inbox / message",
                tiktok: "/download/tiktok?url=<tiktok_url>",
                mediafire: "/download/mediafire?url=<mediafire_url>",
                amfinder: "/tools/amfinder?url=<tiktok_url_for_preset>"
            },
            creator: "ReyCode",
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        return res.status(400).json({
            status: false,
            message: err.message
        });
    }
}

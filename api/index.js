import { mediafire } from '../lib/mediafire.js';
import { findAmPreset } from '../lib/amfinder.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const path = req.url || '';
    const url = req.query.url || req.query.link || req.body?.url || req.body?.link;

    try {
        // Route: /tools/amfinder (Mencari preset AM dari komentar TikTok)
        if (path.includes('/tools/amfinder')) {
            if (!url) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter 'url' TikTok wajib disertakan. Contoh: /tools/amfinder?url=<link_tiktok>"
                });
            }

            const result = await findAmPreset(url);
            return res.status(200).json({
                status: true,
                result
            });
        }

        // Route: /download/mediafire
        if (path.includes('/download/mediafire')) {
            if (!url) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter 'url' MediaFire wajib disertakan. Contoh: /download/mediafire?url=<link_mediafire>"
                });
            }

            const result = await mediafire(url);
            return res.status(200).json({
                status: true,
                result
            });
        }

        return res.status(200).json({
            status: true,
            message: "Monika Labs API is active!",
            endpoints: {
                amfinder: "/tools/amfinder?url=<tiktok_url_for_preset>",
                mediafire: "/download/mediafire?url=<mediafire_url>"
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

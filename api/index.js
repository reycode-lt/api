import { mediafire } from '../lib/mediafire.js';
import { scrapeTikTok } from '../lib/tiktok.js';
import { findAmPreset } from '../lib/amfinder.js';

export default async function handler(req, res) {
    // Set header CORS agar API bisa diakses secara publik
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const path = req.url || '';
    const url = req.query.url || req.query.link || req.body?.url || req.body?.link;

    try {
        // Route: /download/tiktok (Downloader TikTok)
        if (path.includes('/download/tiktok')) {
            if (!url) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter 'url' TikTok wajib disertakan. Contoh: /download/tiktok?url=<link_tiktok>"
                });
            }

            const result = await scrapeTikTok(url);
            return res.status(200).json({
                status: true,
                result
            });
        }

        // Route: /download/mediafire (Downloader MediaFire)
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

        // Route: /tools/amfinder (Pencari Preset AM dari Komentar TikTok)
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

        // Default response / Root API
        return res.status(200).json({
            status: true,
            message: "Monika Labs API is active!",
            endpoints: {
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

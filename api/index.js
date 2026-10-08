import { mediafire } from '../lib/mediafire.js';

export default async function handler(req, res) {
    // Set header CORS agar API bisa diakses secara publik
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const url = req.query.url || req.query.link || req.body?.url || req.body?.link;

    // Jika diakses via GET tanpa parameter url
    if (req.method === 'GET' && !url) {
        return res.status(200).json({
            status: true,
            message: "Monika Labs MediaFire API is active!",
            endpoint: "/download/mediafire?url=<mediafire_url>",
            creator: "ReyCode",
            timestamp: new Date().toISOString()
        });
    }

    // Proses download MediaFire (bisa via GET atau POST)
    if (url) {
        try {
            const result = await mediafire(url);
            return res.status(200).json({
                status: true,
                result
            });
        } catch (err) {
            return res.status(400).json({
                status: false,
                message: err.message
            });
        }
    }

    return res.status(400).json({
        status: false,
        message: "Parameter 'url' wajib disertakan. Contoh: /download/mediafire?url=<link>"
    });
}

import { mediafire } from '../lib/mediafire.js';
import { scrapeTikTok } from '../lib/tiktok.js';
import { findAmPreset } from '../lib/amfinder.js';
import tempmail from '../lib/tempmail.js';
import { createFreeFireGuest } from '../lib/createguestff.js';
import { mediaDownloader } from '../lib/aiodownload.js';
import { sendMagicLink, verifyAndActivate } from '../lib/aligmotion.js';

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
        if (path.includes('/tools/amgen')) {
            const action = String(params.action || '').toLowerCase();
            const email = params.email;
            const targetLink = params.link || params.url;

            if (action === 'sendlink') {
                if (!email) return res.status(400).json({ status: false, creator: 'ReyCode', message: "Parameter 'email' wajib diisi.", timestamp });
                const result = await sendMagicLink(email);
                return res.status(200).json({ status: true, creator: 'ReyCode', message: "Success", result, timestamp });
            }

            if (action === 'veriflink') {
                if (!email || !targetLink) return res.status(400).json({ status: false, creator: 'ReyCode', message: "Parameter 'email' dan 'link' wajib diisi.", timestamp });
                const result = await verifyAndActivate(email, targetLink);
                return res.status(200).json({ status: true, creator: 'ReyCode', message: "Success", result, timestamp });
            }

            return res.status(200).json({ status: true, creator: 'ReyCode', message: "AMGen API Active", timestamp });
        }

        if (path.includes('/download/aio')) {
            if (!urlParam) return res.status(400).json({ status: false, creator: 'ReyCode', message: "Parameter 'url' wajib.", timestamp });
            const result = await mediaDownloader(urlParam);
            return res.status(200).json({ status: true, creator: 'ReyCode', message: "Success", result, timestamp });
        }

        if (path.includes('/tools/ffguest')) {
            const count = parseInt(params.count || 1);
            const result = await createFreeFireGuest(count);
            return res.status(200).json({ status: true, creator: 'ReyCode', message: "Success", result, timestamp });
        }

        if (path.includes('/tools/tempmail')) {
            const action = String(params.action || '').toLowerCase();
            if (action === 'create') {
                const data = await tempmail.createTempEmail(params.username);
                return res.status(200).json({ status: true, creator: 'ReyCode', message: "Success", result: data, timestamp });
            }
            if (action === 'inbox') {
                const data = await tempmail.getInbox(params.username);
                return res.status(200).json({ status: true, creator: 'ReyCode', message: "Success", result: data, timestamp });
            }
            if (action === 'message') {
                const data = await tempmail.getMessage(params.username, params.id);
                return res.status(200).json({ status: true, creator: 'ReyCode', message: "Success", result: data, timestamp });
            }
            return res.status(200).json({ status: true, creator: 'ReyCode', message: "Tempmail API Active", timestamp });
        }

        if (path.includes('/download/tiktok')) {
            if (!urlParam) return res.status(400).json({ status: false, creator: 'ReyCode', message: "Parameter 'url' wajib.", timestamp });
            const result = await scrapeTikTok(urlParam);
            return res.status(200).json({ status: true, creator: 'ReyCode', message: "Success", result, timestamp });
        }

        if (path.includes('/download/mediafire')) {
            if (!urlParam) return res.status(400).json({ status: false, creator: 'ReyCode', message: "Parameter 'url' wajib.", timestamp });
            const result = await mediafire(urlParam);
            return res.status(200).json({ status: true, creator: 'ReyCode', message: "Success", result, timestamp });
        }

        if (path.includes('/tools/amfinder')) {
            if (!urlParam) return res.status(400).json({ status: false, creator: 'ReyCode', message: "Parameter 'url' wajib.", timestamp });
            const result = await findAmPreset(urlParam);
            return res.status(200).json({ status: true, creator: 'ReyCode', message: "Success", result, timestamp });
        }

        return res.status(200).json({
            status: true,
            message: "Monika Labs API is active!",
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

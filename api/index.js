import { mediafire } from '../lib/mediafire.js';
import { scrapeTikTok } from '../lib/tiktok.js';
import { findAmPreset } from '../lib/amfinder.js';
import tempmail from '../lib/tempmail.js';
import { createFreeFireGuest } from '../lib/createguestff.js';

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

    try {
        // Route: /tools/ffguest (Free Fire Guest Account Generator)
        if (path.includes('/tools/ffguest')) {
            const count = parseInt(params.count || params.jumlah || 1);
            const result = await createFreeFireGuest(count);
            return res.status(200).json({
                status: true,
                creator: 'ReyCode',
                result
            });
        }

        // Route: /tools/tempmail
        if (path.includes('/tools/tempmail')) {
            const action = String(params.action || '').toLowerCase();

            if (action === 'create') {
                const data = await tempmail.createTempEmail(params.username || params.mailbox || params.name);
                return res.status(200).json({ status: true, creator: 'ReyCode', provider: 'akunlama.com', data });
            }

            if (action === 'inbox' || action === 'check') {
                const username = params.username || params.mailbox || params.recipient;
                if (!username) {
                    return res.status(400).json({ status: false, message: "Parameter 'username' wajib diisi." });
                }
                const data = await tempmail.getInbox(username);
                return res.status(200).json({ status: true, creator: 'ReyCode', provider: 'akunlama.com', data });
            }

            if (action === 'message') {
                const username = params.username || params.mailbox || params.recipient;
                const id = params.id || params.messageId || params.uid;
                const region = params.region || 'us';

                if (!username || !id) {
                    return res.status(400).json({ status: false, message: "Parameter 'username' dan 'id' wajib diisi." });
                }
                const data = await tempmail.getMessage(username, id, region);
                return res.status(200).json({ status: true, creator: 'ReyCode', provider: 'akunlama.com', data });
            }

            return res.status(200).json({
                status: true,
                message: "Monika Labs TempMail API is active!",
                endpoints: {
                    create: "/tools/tempmail?action=create",
                    inbox: "/tools/tempmail?action=inbox&username=USERNAME",
                    message: "/tools/tempmail?action=message&username=USERNAME&id=MESSAGE_ID"
                }
            });
        }

        // Route: /download/tiktok
        if (path.includes('/download/tiktok')) {
            if (!urlParam) return res.status(400).json({ status: false, message: "Parameter 'url' TikTok wajib disertakan." });
            const result = await scrapeTikTok(urlParam);
            return res.status(200).json({ status: true, result });
        }

        // Route: /download/mediafire
        if (path.includes('/download/mediafire')) {
            if (!urlParam) return res.status(400).json({ status: false, message: "Parameter 'url' MediaFire wajib disertakan." });
            const result = await mediafire(urlParam);
            return res.status(200).json({ status: true, result });
        }

        // Route: /tools/amfinder
        if (path.includes('/tools/amfinder')) {
            if (!urlParam) return res.status(400).json({ status: false, message: "Parameter 'url' TikTok wajib disertakan." });
            const result = await findAmPreset(urlParam);
            return res.status(200).json({ status: true, result });
        }

        return res.status(200).json({
            status: true,
            message: "Monika Labs API is active!",
            endpoints: {
                ffguest: "/tools/ffguest?count=1 (max 10)",
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

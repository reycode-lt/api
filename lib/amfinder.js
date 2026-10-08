import axios from "axios";

const API_URL = "https://amfinder.web.id/api/find";

function parseSSE(text) {
    const events = [];
    let event = "message";
    let data = [];

    for (const line of text.split(/\r?\n/)) {
        if (line.startsWith("event:")) {
            event = line.slice(6).trim();
            continue;
        }

        if (line.startsWith("data:")) {
            data.push(line.slice(5).trimStart());
            continue;
        }

        if (!line.trim()) {
            if (data.length) {
                events.push({
                    event,
                    data: data.join("\n")
                });
            }

            event = "message";
            data = [];
        }
    }

    return events;
}

export async function trackAlightMotion(url) {
    const targetUrl = String(url || "").trim();
    if (!targetUrl) {
        throw new Error("URL Alight Motion wajib diisi.");
    }

    try {
        const response = await axios.get(API_URL, {
            params: { url: targetUrl },
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36",
                Accept: "text/event-stream",
                Referer: "https://amfinder.web.id/"
            },
            responseType: "text",
            timeout: 120000
        });

        const events = parseSSE(response.data);
        const resultEvent = events.find(event => event.event === "result");

        if (!resultEvent) {
            const errorEvent = events.find(event => event.event === "error");
            throw new Error(errorEvent?.data || "Hasil tracking preset tidak ditemukan.");
        }

        const result = JSON.parse(resultEvent.data);

        if (!result.ok) {
            throw new Error(result.message || result.error || "Tracking preset gagal.");
        }

        return result;
    } catch (err) {
        const errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
        throw new Error(errorMsg);
    }
}

import axios from 'axios';
import * as cheerio from 'cheerio';

const mimeTypes = {
    "7z": "application/x-7z-compressed",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    apk: "application/vnd.android.package-archive",
    exe: "application/x-msdownload",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    mp3: "audio/mpeg",
    mp4: "video/mp4",
    txt: "text/plain",
    json: "application/json",
    js: "application/javascript",
    html: "text/html",
    css: "text/css",
};

function getMimeTypeFromUrl(url) {
    if (!url) return "application/octet-stream";

    const fileName = url.split("/").pop()?.split("?")[0] || "";
    const extension = fileName.includes(".")
        ? fileName.split(".").pop().toLowerCase()
        : "";

    return mimeTypes[extension] || "application/octet-stream";
}

export async function mediafire(url) {
    if (!url || !url.includes("mediafire.com")) {
        throw new Error("URL MediaFire tidak valid.");
    }

    const { data: html } = await axios.get(url, {
        timeout: 60000,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    });

    const $ = cheerio.load(html);
    const title =
        $('meta[property="og:image"]').attr("content") && $('meta[property="og:title"]').attr("content")
            ? $('meta[property="og:title"]').attr("content")
            : $("title").text().trim() || "MediaFire File";
            
    const images = $('meta[property="og:image"]').attr("content") || "";
    const description =
        $('meta[property="og:description"]').attr("content") ||
        "Deskripsi tidak ditemukan.";
        
    const link_download =
        $("#downloadButton").attr("href") ||
        $('a[aria-label="Download file"]').attr("href") ||
        "";
        
    const sizes = $("#downloadButton").text().trim();
    const sizeMatch = sizes.match(/\(([^)]+)\)/);
    const size = sizeMatch?.[1]?.trim() || "";
    const mimetype = getMimeTypeFromUrl(link_download);

    if (!link_download) {
        throw new Error("Link download MediaFire tidak ditemukan.");
    }

    return {
        meta: {
            title,
            images,
            description,
        },
        download: {
            link_download,
            size,
            mimetype,
        },
    };
}

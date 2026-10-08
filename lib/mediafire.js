import axios from 'axios';
import * as cheerio from 'cheerio';

export async function mediafire(url) {
  if (!url) throw new Error('URL MediaFire wajib diisi');
  
  try {
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(res.data);
    
    const downloadUrl = $('#downloadButton').attr('href');
    const fileName = $('.filename').text().trim() \vert{}\vert{}$('div.fileinfolist li:nth-child(1) span').text().trim();
    const fileSize = $('a.inputlike span').text().trim();

    if (!downloadUrl) throw new Error('Link download langsung tidak ditemukan.');

    return {
      fileName: fileName || 'Unknown File',
      fileSize: fileSize || 'Unknown Size',
      downloadUrl: downloadUrl
    };
  } catch (err) {
    throw new Error(`MediaFire Error: ${err.message}`);
  }
}

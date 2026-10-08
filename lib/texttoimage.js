import axios from 'axios';
import crypto from 'crypto';
import CryptoJS from 'crypto-js';

const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwlO+boC6cwRo3UfXVBadaYwcX
0zKS2fuVNY2qZ0dgwb1NJ+/Q9FeAosL4ONiosD71on3PVYqRUlL5045mvH2K9i8b
AFVMEip7E6RMK6tKAAif7xzZrXnP1GZ5Rijtqdgwh+YmzTo39cuBCsZqK9oEoeQ3
r/myG9S+9cR5huTuFQIDAQAB
-----END PUBLIC KEY-----`;

const APP_ID = "aifaceswap";
const U_ID = "1H5tRtzsBkqXcaJ";
const FN_NAME = "demo-ai-body-v1";
const BRAND_KEY = "8f3f0c7387123ae0";

function generateRandomString(len) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let res = "";
    for (let i = 0; i < len; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
}

function aesenc(data, key) {
    const k = CryptoJS.enc.Utf8.parse(key);
    const encrypted = CryptoJS.AES.encrypt(data, k, { iv: k, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
}

function rsaenc(data) {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt({ key: PUBLIC_KEY, padding: crypto.constants.RSA_PKCS1_PADDING }, buffer);
    return encrypted.toString('base64');
}

function gencryptoheaders(type, fp = null) {
    const e = new Date();
    const n = Math.floor(new Date(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate(), e.getUTCHours(), e.getUTCMinutes(), e.getUTCSeconds()).getTime() / 1000);
    const r = crypto.randomUUID();
    const i = generateRandomString(16);
    const fingerPrint = fp || crypto.randomBytes(16).toString('hex');
    const s = rsaenc(i);
    let signStr = (type === 'upload') ? `${APP_ID}:${r}:${s}` : `${APP_ID}:${U_ID}:${n}:${r}:${s}`;
    return {
        'fp': fingerPrint,
        'fp1': aesenc(`${APP_ID}:${fingerPrint}`, i),
        'x-guide': s,
        'x-sign': aesenc(signStr, i),
        'x-code': Date.now().toString()
    };
}

export async function createAiBodyJob(prompt, negativePrompt, model = "AbsoluteReality_v1.8.1.safetensors", cfg = 7) {
    const cryptoHeaders = gencryptoheaders('create');
    
    const payload = {
        fn_name: FN_NAME,
        call_type: 3,
        data: "", 
        input: {
            cfg: cfg,
            lora: [],
            model: model,
            negative_prompt: negativePrompt || "(worst quality, low quality:1.4), deformed, ugly, bad anatomy, extra limbs",
            prompt: prompt,
            request_from: 9
        },
        origin_from: BRAND_KEY,
        request_from: 9
    };

    const res = await axios.post('https://app-v1.live3d.io/aitools/of/create', payload, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
            'theme-version': '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
            ...cryptoHeaders
        }
    });

    if (res.data.code !== 200) throw new Error(res.data.message || "Failed to create job");
    return { taskId: res.data.data.task_id, fp: cryptoHeaders.fp };
}

export async function checkAiBodyJob(taskId, fp) {
    const cryptoHeaders = gencryptoheaders('check', fp);
    const payload = {
        task_id: taskId,
        fn_name: FN_NAME,
        call_type: 3,
        request_from: 9,
        origin_from: BRAND_KEY
    };

    const res = await axios.post('https://app-v1.live3d.io/aitools/of/check-status', payload, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
            'theme-version': '83EmcUoQTUv50LhNx0VrdcK8rcGexcP35FcZDcpgWsAXEyO4xqL5shCY6sFIWB2Q',
            ...cryptoHeaders
        }
    });
    return res.data.data;
}

export async function generateAiImage(prompt, negativePrompt) {
    if (!prompt) throw new Error("Prompt wajib diisi.");
    const start = Date.now();
    
    const { taskId, fp } = await createAiBodyJob(prompt, negativePrompt);
    let result;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 4000));
        result = await checkAiBodyJob(taskId, fp);
        
        if (result.status === 2) break;
        if (result.status === 3) throw new Error("Task failed / Blocked by safety filter");
        attempts++;
    }

    if (!result || result.status !== 2) throw new Error("Task polling timeout.");

    return {
        runtime: `${Date.now() - start} ms`,
        task_id: taskId,
        prompt: prompt,
        negative_prompt: negativePrompt || "",
        result_image_url: 'https://temp.live3d.io/' + result.result_image
    };
}

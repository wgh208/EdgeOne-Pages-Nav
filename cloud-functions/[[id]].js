// EdgeOne Makers Cloud Function（Node.js 20）入口：除 `/` 外的所有路径
// 包括 /api/login、/api/getLinks、/api/icon、/api/theme-proxy 等。
import { handleFetch } from '../lib/nav-worker.js';
import { installBlobKV } from '../lib/blob-kv.js';

try {
    installBlobKV();
} catch (e) {
    console.error('[cf-nav] Blob 初始化失败:', e);
}

export async function onRequest(context) {
    const request = context.request;
    if (context.clientIp) {
        try { request.__navClientIp = context.clientIp; } catch (e) { /* ignore */ }
    }

    const env = context.env || {};
    const pending = [];
    const ctx = {
        waitUntil: (p) => {
            if (typeof context.waitUntil === 'function') return context.waitUntil(p);
            pending.push(Promise.resolve(p).catch(() => {}));
        },
    };

    const res = await handleFetch(request, env, ctx);
    if (pending.length > 0) await Promise.allSettled(pending);
    return res;
}

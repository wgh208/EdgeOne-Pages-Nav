// Blob 存储绑定：首次调用时自动创建（或复用）名为 cf-nav 的 Blob 命名空间。
// 不需要在控制台手动开通，也不需要 KV 权限。
import { getStore } from '@edgeone/pages-blob';
import { createBlobKV } from './blob-kv-core.js';

const STORE_NAME = 'cf-nav';

export function installBlobKV() {
    if (globalThis.__NAV_KV__) return globalThis.__NAV_KV__;

    try {
        const store = getStore({
            name: STORE_NAME,
            consistency: 'strong', // 写后立即读得到，避免“保存了但刷新变回去”
        });

        globalThis.__NAV_KV__ = createBlobKV(store);
        return globalThis.__NAV_KV__;
    } catch (e) {
        // 把真实原因留给 assertEnv/日志，避免只看到“存储未初始化”
        globalThis.__NAV_KV_ERROR__ = (e && e.message) ? e.message : String(e);
        throw e;
    }
}

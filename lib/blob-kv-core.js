// 把 EdgeOne Blob 包装成项目内部使用的 KV 接口（get / put / delete / list）。
// 单独放在这里，方便单元测试；真正注入见 blob-kv.js。
export function createBlobKV(store) {
    return {
        async get(key, type) {
            const value = await store.get(key, {
                type: type === 'json' ? 'json' : 'text',
                consistency: 'strong',
            });
            return value === undefined ? null : value;
        },

        async put(key, value) {
            const text = typeof value === 'string' ? value : String(value);
            await store.set(key, text);
        },

        async delete(key) {
            await store.delete(key);
        },

        // 业务层只用到 list({ prefix }) 来清理旧备份，这里直接返回全量 key。
        async list({ prefix = '' } = {}) {
            const { blobs } = await store.list({ prefix, consistency: 'strong' });
            return {
                keys: (blobs || []).map((b) => ({ name: b.key })),
                complete: true,
                cursor: '',
            };
        },
    };
}

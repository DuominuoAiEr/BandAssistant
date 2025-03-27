import { storage } from "../tsimport";

class StorageApi {
    async set(key: String, val: String) {
        return new Promise((resolve, reject) => {
            storage.set({
                key: key,
                value: val,
                success: (data: string) => resolve(data),
                fail: (_, code: number) => reject(new Error(`Set failed with code ${code}`)),
            });
        });
    }

    async get(key: String): Promise<String> {
        return new Promise((resolve, reject) => {
            storage.get({
                key: key,
                success: (data: string) => resolve(data),
                fail: (_, code: number) => reject(new Error(`Get failed with code ${code}`)),
            });
        });
    }

    async delete(key: String) {
        return new Promise((resolve, reject) => {
            storage.delete({
                key: key,
                success: (data: string) => resolve(data),
                fail: (_, code: number) => reject(new Error(`delete failed with code ${code}`)),
            });
        });
    }

    async clear() {
        return new Promise((resolve, reject) => {
            storage.clear({
                success: (data: string) => resolve(data),
                fail: (_, code: number) => reject(new Error(`clear failed with code ${code}`)),
            });
        });
    }
}

export const asyncStorage = new StorageApi();
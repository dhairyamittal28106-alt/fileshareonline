import { NextResponse } from 'next/server';
import Redis from 'ioredis';
import { UTApi } from "uploadthing/server";

// Initialize Redis
const redis = new Redis(process.env.REDIS_URL!);
// Initialize UploadThing API
const utapi = new UTApi();

export async function GET() {
    try {
        // 1. Get expired files from the sorted set
        // 'cleanup_schedule' stores JSON strings of { key, token }
        // Score is the expiration timestamp. We get everything where score < now.
        const now = Date.now();
        const expiredItems = await redis.zrangebyscore('cleanup_schedule', 0, now);

        if (expiredItems.length === 0) {
            return NextResponse.json({ message: 'No files to clean up' });
        }

        console.log(`Checking ${expiredItems.length} potentially expired files...`);

        const keysToDelete: string[] = [];
        const itemsToRemove: string[] = [];

        for (const item of expiredItems) {
            try {
                const { key } = JSON.parse(item);
                if (key) {
                    keysToDelete.push(key);
                }
                itemsToRemove.push(item);
            } catch (e) {
                console.error("Error parsing item:", item, e);
                // If it's corrupt, remove it anyway so we don't get stuck
                itemsToRemove.push(item);
            }
        }

        // 2. Delete from UploadThing
        if (keysToDelete.length > 0) {
            console.log(`Deleting ${keysToDelete.length} files from UploadThing...`);
            await utapi.deleteFiles(keysToDelete);
        }

        // 3. Remove from Redis Cleanup Schedule
        if (itemsToRemove.length > 0) {
            // We remove the specific members we processed
            await redis.zrem('cleanup_schedule', ...itemsToRemove);
        }

        return NextResponse.json({
            deleted: keysToDelete.length,
            keys: keysToDelete
        });

    } catch (error: any) {
        console.error('Cleanup Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

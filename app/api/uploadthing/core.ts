import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    fileUploader: f({
        blob: { maxFileSize: "2GB", maxFileCount: 1 },
    })
        .middleware(async ({ req }) => {
            // This code runs on your server before upload
            // verify user if needed
            return { user: "anonymous" };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            const fileData = file as any; // Temporary fix for type mismatch
            console.log("Upload complete:", fileData.url);
            return { url: fileData.url, name: fileData.name, size: fileData.size };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

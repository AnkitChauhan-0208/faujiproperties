import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const MAX_PROPERTY_IMAGES = 10;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function deleteCloudinaryImage(publicId: string) {
  if (!publicId) {
    return { result: "not_found" };
  }

  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY) {
    throw new Error("Cloudinary secret configuration is missing.");
  }

  return cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
  });
}

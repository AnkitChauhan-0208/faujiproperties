"use server";

import { revalidatePath } from "next/cache";
import { deleteCloudinaryImage } from "../cloudinary";
import { createAuthorizedAdminClient } from "../supabase/server";

function formatActionError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const supabaseError = error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };
    const message = typeof supabaseError.message === "string" ? supabaseError.message : "Database operation failed.";
    const metadata = [
      typeof supabaseError.code === "string" ? `code: ${supabaseError.code}` : "",
      typeof supabaseError.details === "string" ? `details: ${supabaseError.details}` : "",
      typeof supabaseError.hint === "string" ? `hint: ${supabaseError.hint}` : "",
    ].filter(Boolean);
    return metadata.length > 0 ? `${message} (${metadata.join("; ")})` : message;
  }

  return "Unknown error";
}

function logActionError(operation: string, error: unknown) {
  console.error(`${operation}:`, formatActionError(error));
}

async function verifyAdminAuth() {
  return createAuthorizedAdminClient();
}

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function readPriceLakhs(formData: FormData) {
  const amount = Number.parseFloat(String(formData.get("priceAmount") || formData.get("priceLakhs") || ""));
  const unit = formData.get("priceUnit") === "crore" ? "crore" : "lakh";

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Price amount must be a valid number.");
  }

  return unit === "crore" ? amount * 100 : amount;
}

function parseUploadedImages(formData: FormData): Array<{ secure_url: string; public_id: string }> {
  const rawImages = formData.get("uploadedImages");
  if (typeof rawImages !== "string" || !rawImages.trim()) {
    return [];
  }

  try {
    const value = JSON.parse(rawImages) as Array<{ secure_url?: string; public_id?: string }>;
    const validImages: Array<{ secure_url: string; public_id: string }> = [];

    for (const image of value) {
      if (typeof image?.secure_url === "string" && typeof image?.public_id === "string") {
        validImages.push({ secure_url: image.secure_url, public_id: image.public_id });
      }
    }

    return validImages;
  } catch {
    return [];
  }
}

async function savePropertyImages(
  supabase: Awaited<ReturnType<typeof createAuthorizedAdminClient>>,
  propertyId: string,
  images: Array<{ secure_url: string; public_id: string }>,
) {
  if (!images.length) return;

  const rows = images.map((image, index) => ({
    property_id: propertyId,
    image_url: image.secure_url,
    public_id: image.public_id,
    display_order: index + 1,
  }));

  const { error } = await supabase.from("property_images").insert(rows);
  if (error) throw error;
}

export async function createPropertyAction(formData: FormData) {
  try {
    const supabase = await verifyAdminAuth();

    const title = formData.get("title") as string;
    if (!title || title.trim() === "") throw new Error("Property title is required.");

    const price = formData.get("price") as string;
    if (!price || price.trim() === "") throw new Error("Price is required.");

    const location = formData.get("location") as string;
    if (!location || location.trim() === "") throw new Error("Location is required.");

    const city = formData.get("city") as string;
    if (!city || city.trim() === "") throw new Error("City is required.");

    const area = formData.get("area") as string;
    if (!area || area.trim() === "") throw new Error("Area is required.");

    const description = formData.get("description") as string;
    if (!description || description.trim() === "") throw new Error("Description is required.");

    const priceLakhs = readPriceLakhs(formData);

    const amenitiesStr = formData.get("amenities") as string;
    const amenities = amenitiesStr ? amenitiesStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const uploadedImages = parseUploadedImages(formData);

    const newProperty = {
      title,
      slug: generateSlug(title) + "-" + Date.now().toString().slice(-4),
      description,
      property_type: formData.get("type") as string,
      price,
      price_lakhs: priceLakhs,
      location,
      city,
      state: (formData.get("state") as string) || "Telangana",
      area,
      facing: (formData.get("facing") as string) || null,
      dimensions: (formData.get("dimensions") as string)?.trim() || null,
      bedrooms: formData.get("bedrooms") ? parseInt(formData.get("bedrooms") as string) : null,
      bathrooms: formData.get("bathrooms") ? parseInt(formData.get("bathrooms") as string) : null,
      parking: (formData.get("parking") as string) || null,
      status: formData.get("status") as string,
      featured: formData.get("featured") === "on",
      amenities,
      images: uploadedImages.map((image) => image.secure_url),
    };

    const { data: createdProperty, error: insertError } = await supabase
      .from("properties")
      .insert([newProperty])
      .select("id")
      .single();

    if (insertError || !createdProperty) {
      throw insertError ?? new Error("Unable to create property.");
    }

    if (uploadedImages.length > 0) {
      await savePropertyImages(supabase, createdProperty.id, uploadedImages);
    }

    revalidatePath("/properties");
    revalidatePath("/admin/properties");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    logActionError("Failed to create property", error);
    return { success: false, error: formatActionError(error) };
  }
}

export async function updatePropertyAction(id: string, formData: FormData) {
  try {
    const supabase = await verifyAdminAuth();

    const title = formData.get("title") as string;
    if (!title || title.trim() === "") throw new Error("Property title is required.");

    const price = formData.get("price") as string;
    if (!price || price.trim() === "") throw new Error("Price is required.");

    const location = formData.get("location") as string;
    if (!location || location.trim() === "") throw new Error("Location is required.");

    const city = formData.get("city") as string;
    if (!city || city.trim() === "") throw new Error("City is required.");

    const area = formData.get("area") as string;
    if (!area || area.trim() === "") throw new Error("Area is required.");

    const description = formData.get("description") as string;
    if (!description || description.trim() === "") throw new Error("Description is required.");

    const priceLakhs = readPriceLakhs(formData);

    const amenitiesStr = formData.get("amenities") as string;
    const amenities = amenitiesStr ? amenitiesStr.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const uploadedImages = parseUploadedImages(formData);

    const updates = {
      title,
      description,
      property_type: formData.get("type") as string,
      price,
      price_lakhs: priceLakhs,
      location,
      city,
      state: (formData.get("state") as string) || "Telangana",
      area,
      facing: (formData.get("facing") as string) || null,
      dimensions: (formData.get("dimensions") as string)?.trim() || null,
      bedrooms: formData.get("bedrooms") ? parseInt(formData.get("bedrooms") as string) : null,
      bathrooms: formData.get("bathrooms") ? parseInt(formData.get("bathrooms") as string) : null,
      parking: (formData.get("parking") as string) || null,
      status: formData.get("status") as string,
      featured: formData.get("featured") === "on",
      amenities,
      updated_at: new Date().toISOString(),
    };

    const { data: existingProperty, error: fetchError } = await supabase
      .from("properties")
      .select("images, property_images(* )")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const existingImageUrls = Array.isArray(existingProperty?.images) ? existingProperty.images as string[] : [];
    const combinedImages = [...existingImageUrls, ...uploadedImages.map((image) => image.secure_url)];

    const { error: updateError } = await supabase
      .from("properties")
      .update({ ...updates, images: combinedImages })
      .eq("id", id);

    if (updateError) throw updateError;

    if (uploadedImages.length > 0) {
      await savePropertyImages(supabase, id, uploadedImages);
    }

    revalidatePath("/properties");
    revalidatePath("/admin/properties");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    logActionError("Failed to update property", error);
    return { success: false, error: formatActionError(error) };
  }
}

export async function deletePropertyAction(id: string) {
  try {
    const supabase = await verifyAdminAuth();

    const { data: propertyImages, error: fetchError } = await supabase
      .from("property_images")
      .select("public_id")
      .eq("property_id", id);

    if (fetchError) throw fetchError;

    const { error: enquiryDetachError } = await supabase
      .from("enquiries")
      .update({ property_id: null })
      .eq("property_id", id);

    if (enquiryDetachError) throw enquiryDetachError;

    const { error: imageDeleteError } = await supabase.from("property_images").delete().eq("property_id", id);
    if (imageDeleteError) throw imageDeleteError;

    const { error: propertyDeleteError } = await supabase.from("properties").delete().eq("id", id);
    if (propertyDeleteError) throw propertyDeleteError;

    for (const image of propertyImages || []) {
      if (image.public_id) {
        try {
          await deleteCloudinaryImage(image.public_id);
        } catch (cloudinaryError) {
          logActionError(`Cloudinary cleanup failed for deleted property image ${image.public_id}`, cloudinaryError);
        }
      }
    }

    revalidatePath("/properties");
    revalidatePath("/admin/properties");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    logActionError("Failed to delete property", error);
    return { success: false, error: formatActionError(error) };
  }
}

export async function deletePropertyImageAction(imageId: string, publicId?: string) {
  try {
    const supabase = await verifyAdminAuth();
    const { data: imageRow, error: fetchError } = await supabase
      .from("property_images")
      .select("property_id, public_id, image_url")
      .eq("id", imageId)
      .single();

    if (fetchError || !imageRow) {
      throw fetchError ?? new Error("Image not found.");
    }

    const targetPublicId = publicId || imageRow.public_id;
    if (targetPublicId) {
      await deleteCloudinaryImage(targetPublicId);
    }

    const { error: deleteError } = await supabase.from("property_images").delete().eq("id", imageId);
    if (deleteError) throw deleteError;

    const { data: remainingImages } = await supabase
      .from("property_images")
      .select("id, image_url, display_order")
      .eq("property_id", imageRow.property_id)
      .order("display_order", { ascending: true });

    const imageUrls = ((remainingImages || []) as Array<{ image_url: string }>).map((image) => image.image_url);

    await supabase
      .from("properties")
      .update({ images: imageUrls, updated_at: new Date().toISOString() })
      .eq("id", imageRow.property_id);

    revalidatePath("/properties");
    revalidatePath("/admin/properties");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    logActionError("Failed to delete property image", error);
    return { success: false, error: formatActionError(error) };
  }
}

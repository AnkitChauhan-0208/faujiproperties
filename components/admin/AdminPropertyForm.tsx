"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { createPropertyAction, deletePropertyImageAction, updatePropertyAction } from "@/lib/properties/actions";
import type { Property } from "@/lib/properties/types";

const inputClass = "min-h-12 w-full min-w-0 max-w-full rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-slate-700 outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[#d9e8e3]";
const MAX_PROPERTY_IMAGES = 10;

type UploadedImageResult = { secure_url: string; public_id: string };

function getPriceInputValues(property?: Property | null) {
  const isCrore = Boolean(property && /\b(cr|crore|crores)\b/i.test(property.price));
  return {
    amount: property ? String(isCrore ? property.priceLakhs / 100 : property.priceLakhs) : "",
    unit: isCrore ? "crore" : "lakh",
  };
}

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";
  return { cloudName, uploadPreset };
}

export function AdminPropertyForm({ onSuccess, initialData }: { onSuccess?: () => void; initialData?: Property | null }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<Array<{ id: string; file: File; preview: string }>>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState("");
  const priceInput = getPriceInputValues(initialData);
  const [existingImageRecords, setExistingImageRecords] = useState<Array<{ id: string; publicId: string; url: string }>>(
    initialData?.imageRecords?.map((image) => ({ id: image.id, publicId: image.publicId, url: image.imageUrl })) ?? [],
  );

  const boundAction = initialData
    ? updatePropertyAction.bind(null, initialData.id)
    : createPropertyAction;

  const [state, formAction, isPending] = useActionState(async (_prevState: { success: boolean; error?: string }, formData: FormData) => {
    const result = await boundAction(formData);
    if (result.success) {
      window.alert(initialData ? "Property updated successfully." : "Property added successfully.");
      if (!initialData) formRef.current?.reset();
      onSuccess?.();
    }
    return result;
  }, { success: false, error: "" });

  const handleRemovePendingImage = (id: string) => {
    setSelectedFiles((current) => current.filter((item) => item.id !== id));
  };

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = Array.from(event.target.files || []);
    if (!incomingFiles.length) return;

    const validFiles = incomingFiles.filter((file) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!(file instanceof File) || file.size === 0) {
        setFormError(`The selected file ${file.name || "image"} is empty or invalid.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setFormError(`The selected file ${file.name} has unsupported type "${file.type || "unknown"}". Please upload JPG, PNG, or WEBP images.`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFormError("Each image must be smaller than 10 MB.");
        return false;
      }
      return true;
    });

    const totalAfterSelection = selectedFiles.length + validFiles.length + existingImageRecords.length;
    if (totalAfterSelection > MAX_PROPERTY_IMAGES) {
      setFormError(`You can upload a maximum of ${MAX_PROPERTY_IMAGES} images.`);
      event.target.value = "";
      return;
    }

    setFormError("");
    const newItems = validFiles.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedFiles((current) => [...current, ...newItems]);
    event.target.value = "";
  };

  const uploadSelectedFiles = async () => {
    const { cloudName, uploadPreset } = getCloudinaryConfig();
    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration is missing. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
    }

    if (!selectedFiles.length) {
      return [] as UploadedImageResult[];
    }

    setIsUploading(true);
    setUploadProgress(0);

    const uploadedResults: UploadedImageResult[] = [];

    for (let index = 0; index < selectedFiles.length; index += 1) {
      const { file } = selectedFiles[index];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "property-website/properties");

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const responseBody = await response.text();
      let result: { secure_url?: string; public_id?: string; error?: { message?: string } };
      try {
        result = JSON.parse(responseBody) as typeof result;
      } catch {
        throw new Error(`Cloudinary returned an invalid response for ${file.name} (${response.status} ${response.statusText}).`);
      }


      if (!response.ok) {
        throw new Error(`Cloudinary upload failed for ${file.name} (${response.status} ${response.statusText}): ${result.error?.message || "Unknown Cloudinary error"}`);
      }

      if (!result.secure_url || !result.public_id) {
        throw new Error(`Cloudinary did not return a valid URL for ${file.name}.`);
      }

      uploadedResults.push({ secure_url: result.secure_url, public_id: result.public_id });
      setUploadProgress(((index + 1) / selectedFiles.length) * 100);
    }

    setUploadedImages(uploadedResults);
    setIsUploading(false);
    setUploadProgress(100);
    return uploadedResults;
  };

  const handleExistingImageDelete = async (imageId: string, publicId: string) => {
    if (!window.confirm("Delete this image from the property and Cloudinary?")) {
      return;
    }

    const result = await deletePropertyImageAction(imageId, publicId);
    if (result.success) {
      setExistingImageRecords((current) => current.filter((image) => image.id !== imageId));
      window.alert("Image deleted successfully.");
    } else {
      window.alert(result.error || "Unable to delete the selected image.");
    }
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const form = event.currentTarget;

    if (isUploading) {
      setFormError("Please wait for the uploaded images to finish processing.");
      return;
    }

    try {
      const uploadedResults = await uploadSelectedFiles();

      if (selectedFiles.length && uploadedResults.length !== selectedFiles.length) {
        setFormError("Some images could not be uploaded. Please retry.");
        return;
      }

      const formData = new FormData(form);
      formData.set("uploadedImages", JSON.stringify(uploadedResults));
      startTransition(() => {
        formAction(formData);
      });
    } catch (error: unknown) {
      setIsUploading(false);
      const message = error instanceof Error ? error.message : "Image upload failed. Please try again.";
      setFormError(message);
    }
  }

  return (
    <form key={initialData?.id ?? "new-property"} ref={formRef} onSubmit={handleSubmit} className="admin-property-form grid w-full min-w-0 max-w-full gap-5 overflow-hidden rounded-xl border border-[var(--line)] bg-white p-6 shadow-[0_6px_20px_rgb(23_43_45_/_5%)]">
      {state.error && <p className="text-sm font-bold text-[#9a4034]">{state.error}</p>}
      {formError && <p className="text-sm font-bold text-[#9a4034]">{formError}</p>}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          Title
          <input required name="title" defaultValue={initialData?.title} className={inputClass} placeholder="e.g. Green Valley Villa" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          Price (Display text)
          <input required name="price" defaultValue={initialData?.price} className={inputClass} placeholder="e.g. ₹85 Lakhs" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          <span>Price amount (for filtering)</span>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_7rem] gap-2">
            <input required type="number" min="0" step="0.01" name="priceAmount" defaultValue={priceInput.amount} className={inputClass} placeholder="e.g. 85" />
            <select name="priceUnit" defaultValue={priceInput.unit} className={inputClass} aria-label="Price unit"><option value="lakh">Lakhs</option><option value="crore">Crores</option></select>
          </div>
          <span className="text-xs font-normal text-slate-500">For example: enter 1.2 and choose Crores for ₹1.2 Cr.</span>
        </div>
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          Location (Area/Neighborhood)
          <input required name="location" defaultValue={initialData?.location} className={inputClass} placeholder="e.g. Kondapur" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          City
          <input required name="city" defaultValue={initialData?.city} className={inputClass} placeholder="e.g. Hyderabad" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          State
          <input required name="state" defaultValue={initialData?.state || "Haryana"} className={inputClass} placeholder="e.g. Haryana" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          Type
          <select name="type" defaultValue={initialData?.type || "Villa"} className={inputClass}>
            <option value="Villa">Villa</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Commercial">Commercial</option>
            <option value="Plot">Plot</option>
            <option value="Land">Land</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          Status
          <select name="status" defaultValue={initialData?.status || "Available"} className={inputClass}>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Reserved">Reserved</option>
          </select>
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          Area (Display)
          <input required name="area" defaultValue={initialData?.area} className={inputClass} placeholder="e.g. 1,850 sq.ft" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          Bedrooms
          <input type="number" min="0" name="bedrooms" defaultValue={initialData?.bedrooms ?? ""} className={inputClass} placeholder="0" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          Bathrooms
          <input type="number" min="0" name="bathrooms" defaultValue={initialData?.bathrooms ?? ""} className={inputClass} placeholder="0" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)] flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={initialData?.featured} className="size-4" />
          Featured Property
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          Parking
          <input name="parking" defaultValue={initialData?.parking ?? ""} className={inputClass} placeholder="e.g. 2 Cars" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          House/Property Facing
          <select name="facing" defaultValue={initialData?.facing ?? ""} className={inputClass}>
            <option value="">Not specified</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="North-East">North-East</option>
            <option value="North-West">North-West</option>
            <option value="South-East">South-East</option>
            <option value="South-West">South-West</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          Dimensions
          <input name="dimensions" defaultValue={initialData?.dimensions ?? ""} className={inputClass} placeholder="e.g. 40 × 50 ft" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
        Description
        <textarea required name="description" defaultValue={initialData?.description} rows={5} className={`${inputClass} py-3`} placeholder="Describe the property in plain language." />
      </label>

      <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
        Amenities
        <span className="font-normal text-slate-500">Separate each amenity with a comma.</span>
        <input name="amenities" defaultValue={initialData?.amenities?.join(", ")} className={inputClass} placeholder="Security, parking, garden" />
      </label>

      <div className="grid gap-3 rounded-xl border border-dashed border-[#a9c4b8] bg-[#f5faf8] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[var(--brand-dark)]">Property Images</p>
            <p className="text-xs text-slate-500">Maximum {MAX_PROPERTY_IMAGES} images per property</p>
          </div>
          <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-[var(--brand)]">{existingImageRecords.length + selectedFiles.length}/{MAX_PROPERTY_IMAGES}</span>
        </div>

        {existingImageRecords.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Existing images</p>
            <div className="flex flex-wrap gap-3">
              {existingImageRecords.map((image) => (
                <div key={image.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <img src={image.url} alt="Existing property" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleExistingImageDelete(image.id, image.publicId)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white"
                    aria-label="Delete existing image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">New uploads</p>
            <div className="flex flex-wrap gap-3">
              {selectedFiles.map((item) => (
                <div key={item.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <img src={item.preview} alt="Selected upload preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePendingImage(item.id)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white"
                    aria-label="Remove pending image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <label className="grid gap-2 text-sm font-bold text-[var(--brand-dark)]">
          <span className="sr-only">Upload property images</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={isUploading || existingImageRecords.length + selectedFiles.length >= MAX_PROPERTY_IMAGES}
            className="min-h-12 rounded-lg border border-dashed border-[#a9c4b8] bg-white px-3 py-3 text-sm text-slate-600"
            onChange={handleImageSelection}
          />
          <span className="font-normal text-slate-500">Drag & drop or browse. JPG, PNG, and WEBP images only, up to 10 MB each.</span>
        </label>

        <input type="hidden" name="uploadedImages" value={JSON.stringify(uploadedImages)} />

        {isUploading && (
          <div className="rounded-lg border border-[#d9e8e3] bg-white p-3">
            <p className="text-sm font-bold text-[var(--brand-dark)]">Uploading images...</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eaf2ee]">
              <div className="h-full rounded-full bg-[var(--brand)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-600">{Math.round(uploadProgress)}% complete</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={isPending || isUploading} className="button-primary flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-wait">
          {isUploading ? "Uploading..." : (initialData ? "Update property" : "Save property")}
        </button>
        {onSuccess && (
          <button type="button" onClick={onSuccess} className="button-secondary flex-1 sm:flex-none">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

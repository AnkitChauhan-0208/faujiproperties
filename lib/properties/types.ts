export type PropertyType = "Land" | "Villa" | "House" | "Apartment" | "Commercial" | "Plot" | string;
export type PropertyStatus = "Available" | "Sold" | "Reserved" | string;

export type PropertyImage = {
  id: string;
  propertyId: string;
  imageUrl: string;
  publicId: string;
  displayOrder: number;
  createdAt?: string;
};

export type Property = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: PropertyType;
  price: string;
  priceLakhs: number;
  location: string;
  city: string;
  state: string;
  area: string;
  facing: string | null;
  dimensions: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: string | null;
  status: PropertyStatus;
  featured: boolean;
  amenities: string[];
  images: string[];
  imageRecords?: PropertyImage[];
  createdAt?: string;
  updatedAt?: string;
};

export function getPriceLakhs(price: string, storedPriceLakhs: number): number {
  const normalizedPrice = price.trim().toLowerCase();
  const numericPrice = Number.parseFloat(normalizedPrice.replace(/[^0-9.]/g, ""));

  if (Number.isFinite(numericPrice)) {
    if (/\b(cr|crore|crores)\b/.test(normalizedPrice)) return numericPrice * 100;
    if (/\b(lakh|lakhs|lac|lacs)\b/.test(normalizedPrice)) return numericPrice;
  }

  return Number.isFinite(storedPriceLakhs) ? storedPriceLakhs : 0;
}

export function getPropertyImageUrls(property: Pick<Property, "images" | "imageRecords">): string[] {
  const recordImages = [...(property.imageRecords || [])]
    .sort((first, second) => first.displayOrder - second.displayOrder)
    .map((image) => image.imageUrl);

  return [...property.images, ...recordImages]
    .filter((image): image is string => typeof image === "string" && image.trim().length > 0)
    .filter((image, index, images) => images.indexOf(image) === index);
}

export function getPrimaryPropertyImage(property: Pick<Property, "images" | "imageRecords">): string | undefined {
  return getPropertyImageUrls(property)[0];
}

export type DatabaseProperty = {
  id: string;
  title: string;
  slug: string;
  description: string;
  property_type: string;
  price: string;
  price_lakhs: number;
  location: string;
  city: string;
  state: string;
  area: string;
  facing: string | null;
  dimensions: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: string | null;
  status: string;
  featured: boolean;
  amenities: string[];
  images: string[];
  created_at: string;
  updated_at: string;
};

export type DatabasePropertyImage = {
  id: string;
  property_id: string;
  image_url: string;
  public_id: string;
  display_order: number;
  created_at: string;
};

export function mapDatabaseProperty(row: DatabaseProperty, propertyImages: DatabasePropertyImage[] = []): Property {
  const orderedImageUrls = [...propertyImages]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((image) => image.image_url);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    type: row.property_type,
    price: row.price,
    priceLakhs: getPriceLakhs(row.price, Number(row.price_lakhs)),
    location: row.location,
    city: row.city,
    state: row.state,
    area: row.area,
    facing: row.facing,
    dimensions: row.dimensions,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    parking: row.parking,
    status: row.status,
    featured: row.featured,
    amenities: row.amenities || [],
    images: orderedImageUrls.length > 0 ? orderedImageUrls : row.images || [],
    imageRecords: propertyImages.map((image) => ({
      id: image.id,
      propertyId: image.property_id,
      imageUrl: image.image_url,
      publicId: image.public_id,
      displayOrder: image.display_order,
      createdAt: image.created_at,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

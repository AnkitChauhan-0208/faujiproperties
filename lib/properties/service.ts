import { createSupabaseServerClient } from "../supabase/server";
import { DatabaseProperty, DatabasePropertyImage, Property, mapDatabaseProperty } from "./types";

function formatSupabaseError(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const supabaseError = error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };
    return [supabaseError.message, supabaseError.code, supabaseError.details, supabaseError.hint]
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .join(" | ");
  }
  return error instanceof Error ? error.message : "Unknown Supabase error";
}

function normalizePropertyImages(row: { property_images?: DatabasePropertyImage[] } = {}): DatabasePropertyImage[] {
  return (row.property_images || []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

export async function getProperties(): Promise<Property[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching properties:", formatSupabaseError(error), error);
    return [];
  }

  return (data as Array<DatabaseProperty & { property_images?: DatabasePropertyImage[] }>).map((row) => {
    const propertyImages = normalizePropertyImages(row);
    return mapDatabaseProperty(row as DatabaseProperty, propertyImages);
  });
}

export async function getPropertiesByIds(ids: string[]): Promise<Property[]> {
  if (!ids.length) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .in("id", ids);

  if (error) {
    console.error("Error fetching properties for comparison:", formatSupabaseError(error), error);
    return [];
  }

  const properties = (data as Array<DatabaseProperty & { property_images?: DatabasePropertyImage[] }>).map((row) => {
    return mapDatabaseProperty(row as DatabaseProperty, normalizePropertyImages(row));
  });

  return ids.map((id) => properties.find((property) => property.id === id)).filter((property): property is Property => Boolean(property));
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("slug", slug)
    .single();

  if (error?.code === "PGRST116" && !data) {
    return null;
  }

  if (error) {
    console.error(`Error fetching property by slug (${slug}):`, error ? formatSupabaseError(error) : "No data returned", error);
    throw new Error("Unable to load property details.");
  }

  if (!data) {
    return null;
  }

  return mapDatabaseProperty(data as DatabaseProperty, normalizePropertyImages(data as { property_images?: DatabasePropertyImage[] }));
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching featured properties:", formatSupabaseError(error), error);
    return [];
  }

  return (data as Array<DatabaseProperty & { property_images?: DatabasePropertyImage[] }>).map((row) => {
    const propertyImages = normalizePropertyImages(row);
    return mapDatabaseProperty(row as DatabaseProperty, propertyImages);
  });
}

export async function getRelatedProperties(property: Property): Promise<Property[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .neq("id", property.id)
    .or(`property_type.eq.${property.type},city.eq.${property.city}`)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching related properties:", formatSupabaseError(error), error);
    return [];
  }

  return (data as Array<DatabaseProperty & { property_images?: DatabasePropertyImage[] }>).map((row) => {
    const propertyImages = normalizePropertyImages(row);
    return mapDatabaseProperty(row as DatabaseProperty, propertyImages);
  });
}

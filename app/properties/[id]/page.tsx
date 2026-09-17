import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PropertyDetail } from "@/components/PropertyDetail";
import type { Metadata } from "next";
import { getPropertyBySlug, getRelatedProperties } from "@/lib/properties/service";
import { notFound } from "next/navigation";
import { getPublicBusinessSettings } from "@/lib/settings/service";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyBySlug(id);
  
  return property
    ? {
        title: `${property.title} in ${property.city} | Fauji Properties`,
        description: `${property.title} in ${property.location}, ${property.city}: ${property.price}, ${property.area}, and ${property.status.toLowerCase()} availability details.`,
        openGraph: {
          title: `${property.title} | Fauji Properties`,
          description: property.description,
          type: "website",
          images: property.images[0] ? [{ url: property.images[0], alt: `${property.title} property photo` }] : undefined,
        },
      }
    
    : { title: "Property not found | Fauji Properties" };
}

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getPropertyBySlug(id);

  if (!property) {
    notFound();
  }

  const [similarProperties, settings] = await Promise.all([getRelatedProperties(property), getPublicBusinessSettings()]);

  return (
    <>
      <Header settings={settings} />
      <PropertyDetail property={property} similarProperties={similarProperties} settings={settings} />
      <Footer settings={settings} />
    </>
  );
}

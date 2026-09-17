import type { Property } from "@/lib/properties/types";
import { PropertyCard } from "./PropertyCard";

export function PropertyGrid({ properties }: { properties: Property[] }) {
  return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{properties.map((property) => <PropertyCard key={property.id} property={property} />)}</div>;
}

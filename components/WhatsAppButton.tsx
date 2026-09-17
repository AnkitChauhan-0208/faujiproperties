"use client";

import type { PublicBusinessSettings } from "@/lib/settings/service";
import type { Property } from "@/lib/properties/types";

export function WhatsAppButton({ property, settings }: { property?: Property; settings: PublicBusinessSettings }) {
  const basicMessage = encodeURIComponent(`Hello ${settings.name}, I would like help finding a property.`);
  const propertyMessage = property
    ? (currentUrl: string) => encodeURIComponent(`Hello, I’m interested in this property and would like to know more details about the price, location, and availability.\n\nProperty: ${property.title}\nLocation: ${property.location}, ${property.city}\nPrice: ${property.price}\nProperty Link: ${currentUrl}`)
    : null;

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!propertyMessage) return;
    event.preventDefault();
    window.open(`${settings.whatsappHref}?text=${propertyMessage(window.location.href)}`, "_blank", "noopener,noreferrer");
  }

  return <a href={`${settings.whatsappHref}?text=${basicMessage}`} onClick={handleClick} target="_blank" rel="noreferrer" className="fixed bottom-24 right-5 z-20 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#168a4b] px-5 text-sm font-bold text-white shadow-lg hover:bg-[#11753e] sm:bottom-5" aria-label={`Chat with ${settings.name} on WhatsApp`}><span className="flex size-5 items-center justify-center" aria-hidden="true"><svg viewBox="0 0 24 24" className="size-5 fill-current" role="img"><path d="M12.04 2a9.91 9.91 0 0 0-8.52 15.01L2 22l5.15-1.49A9.91 9.91 0 1 0 12.04 2Zm0 18.02a8.09 8.09 0 0 1-4.12-1.13l-.3-.18-3.06.89.91-2.98-.2-.31A8.08 8.08 0 1 1 12.04 20Zm4.43-6.06c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-1.4-.7-2.32-1.24-3.25-2.82-.25-.43.25-.4.71-1.33.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62 1.52.66 2.12.72 2.88.61.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" /></svg></span>WhatsApp</a>;
}

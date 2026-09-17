import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ComparisonView } from "@/components/comparison/ComparisonView";
import { getPublicBusinessSettings } from "@/lib/settings/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare Properties | Fauji Properties",
  description: "Compare selected properties side by side.",
};

export default async function CompareRoute() {
  const settings = await getPublicBusinessSettings();
  return (
    <>
      <Header settings={settings} />
      <ComparisonView />
      <Footer settings={settings} />
    </>
  );
}

const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE || "";
const businessWhatsApp = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || businessPhone;

export const defaultBusinessSettings = {
  name: "Fauji Properties",
  phone: businessPhone,
  whatsapp: businessWhatsApp,
  email: "ajitsingh5624@gmail.com",
  address: "Jaggi Garden, Ambala, Haryana, India",
  mapsUrl: "",
  description: "Trusted property guidance for homes, plots, and investments in Ambala and beyond.",
  notificationEnabled: true,
};


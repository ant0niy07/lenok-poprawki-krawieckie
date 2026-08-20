export type GarmentType = "trousers" | "dress" | "blazer" | "jacket";
export type ServiceId =
  | "shortening"
  | "narrowing"
  | "zipperReplacement"
  | "waistAdjustment"
  | "sleeveShortening"
  | "liningReplacement"
  | "tearRepair";
export const garments: GarmentType[] = [
  "trousers",
  "dress",
  "blazer",
  "jacket",
];
export const services: ServiceId[] = [
  "shortening",
  "narrowing",
  "zipperReplacement",
  "waistAdjustment",
  "sleeveShortening",
  "liningReplacement",
  "tearRepair",
];
export const estimatedPricing = {
  trousers: {
    shortening: 40,
    narrowing: 60,
    zipperReplacement: 40,
    waistAdjustment: 50,
    sleeveShortening: null,
    liningReplacement: 80,
    tearRepair: 35,
  },
  dress: {
    shortening: 60,
    narrowing: 60,
    zipperReplacement: 40,
    waistAdjustment: 60,
    sleeveShortening: 40,
    liningReplacement: 100,
    tearRepair: 40,
  },
  blazer: {
    shortening: 80,
    narrowing: 80,
    zipperReplacement: null,
    waistAdjustment: 70,
    sleeveShortening: 60,
    liningReplacement: 180,
    tearRepair: 50,
  },
  jacket: {
    shortening: 90,
    narrowing: 120,
    zipperReplacement: 140,
    waistAdjustment: 120,
    sleeveShortening: 80,
    liningReplacement: 250,
    tearRepair: 60,
  },
} as const;
export const getServicePrice = (
  g: GarmentType | null,
  s: ServiceId,
): number | null => (g ? estimatedPricing[g][s] : null);
export const getAvailableServices = (g: GarmentType | null) =>
  g ? services.filter((s) => estimatedPricing[g][s] !== null) : [];
export const calculateTotal = (g: GarmentType | null, ids: ServiceId[]) =>
  ids.reduce((sum, id) => sum + (getServicePrice(g, id) ?? 0), 0);
export const formatPrice = (value: number, locale: string) =>
  new Intl.NumberFormat(
    locale === "pl" ? "pl-PL" : locale === "ru" ? "ru-RU" : "en-GB",
  ).format(value) + " PLN";

export type MessageData = {
  lng: string;
  garment: string;
  items: { name: string; price: number | null }[];
  total: number;
  date: string;
  name: string;
  phone: string;
  notes?: string;
};
export function buildRequestMessage(d: MessageData) {
  const consult =
    d.lng === "pl"
      ? "wycena po obejrzeniu"
      : d.lng === "ru"
        ? "после осмотра"
        : "after inspection";
  const lines = d.items
    .map(
      (x) =>
        `- ${x.name}: ${x.price === null ? consult : `${d.lng === "ru" ? "от примерно" : d.lng === "pl" ? "od około" : "from approx."} ${formatPrice(x.price, d.lng)}`}`,
    )
    .join("\n");
  if (d.lng === "ru")
    return `Здравствуйте! Прошу рассчитать ориентировочную стоимость ремонта одежды.\n\n👗 Вид одежды: ${d.garment}\n\n🧵 Выбранные услуги:\n${lines}\n\n💰 Ориентировочная сумма: от примерно ${formatPrice(d.total, d.lng)}\n📅 Предпочтительная дата: ${d.date}\n👤 Имя: ${d.name}\n📞 Телефон: ${d.phone}\n📝 Примечания: ${d.notes || "—"}\n\nЯ понимаю, что итоговая цена будет определена после осмотра изделия.`;
  if (d.lng === "en")
    return `Hello! I would like an estimated price for a clothing alteration.\n\n👗 Garment: ${d.garment}\n\n🧵 Selected services:\n${lines}\n\n💰 Estimated total: from approx. ${formatPrice(d.total, d.lng)}\n📅 Preferred date: ${d.date}\n👤 Name: ${d.name}\n📞 Telephone: ${d.phone}\n📝 Notes: ${d.notes || "—"}\n\nI understand that the final price will be agreed after the garment is inspected.`;
  return `Dzień dobry! Proszę o orientacyjną wycenę poprawki krawieckiej.\n\n👗 Rodzaj ubrania: ${d.garment}\n\n🧵 Wybrane usługi:\n${lines}\n\n💰 Orientacyjna suma: od około ${formatPrice(d.total, d.lng)}\n📅 Preferowana data: ${d.date}\n👤 Imię: ${d.name}\n📞 Telefon: ${d.phone}\n📝 Uwagi: ${d.notes || "—"}\n\nRozumiem, że ostateczna cena zostanie ustalona po obejrzeniu ubrania.`;
}

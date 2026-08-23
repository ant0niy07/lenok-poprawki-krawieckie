export type GarmentType =
  | "trousers" | "skirts" | "shirts" | "dress" | "blazer"
  | "jacket" | "leatherFur" | "formalwear" | "homeTextiles" | "other";

export type ServiceId =
  | "trouserPlainHem" | "trouserOriginalHem" | "trouserCuffHem" | "leatherTrouserHem" | "trouserZipper" | "waistHipNarrowing"
  | "skirtNarrowHem" | "skirtFlaredHem" | "skirtWaist" | "skirtZipper"
  | "shirtSleeves" | "shirtFit" | "dressNeckline" | "dressStraps" | "dressFit"
  | "blazerSleeves" | "blazerHem" | "blazerWaist" | "shoulderFit" | "blazerLining"
  | "outerwearSleeves" | "pufferTearRepair" | "outerwearZipper"
  | "furLining" | "minorRepairs" | "leatherSleeves"
  | "formalHem" | "formalFit" | "embellishments"
  | "topstitch" | "overlock" | "hemstitch"
  | "sliderReplacement" | "buttonSewing" | "snapFastener" | "jeansButton";

export type QuantityUnit = "hours" | "metres";
export type PriceDefinition =
  | { kind: "fixed"; amount: number }
  | { kind: "range"; min: number; max: number }
  | { kind: "from"; min: number }
  | { kind: "individual" }
  | { kind: "perHour"; rate: number }
  | { kind: "perMetre"; rate: number };

export const garments: GarmentType[] = ["trousers", "skirts", "shirts", "dress", "blazer", "jacket", "leatherFur", "formalwear", "homeTextiles", "other"];

export const officialPricing: Record<GarmentType, Partial<Record<ServiceId, PriceDefinition>>> = {
  trousers: {
    trouserPlainHem: { kind: "fixed", amount: 50 }, trouserOriginalHem: { kind: "fixed", amount: 70 },
    trouserCuffHem: { kind: "fixed", amount: 80 }, leatherTrouserHem: { kind: "fixed", amount: 100 },
    trouserZipper: { kind: "fixed", amount: 60 }, waistHipNarrowing: { kind: "fixed", amount: 80 },
  },
  skirts: {
    skirtNarrowHem: { kind: "range", min: 70, max: 100 }, skirtFlaredHem: { kind: "range", min: 80, max: 120 },
    skirtWaist: { kind: "fixed", amount: 80 }, skirtZipper: { kind: "fixed", amount: 60 },
  },
  shirts: { shirtSleeves: { kind: "range", min: 40, max: 80 }, shirtFit: { kind: "range", min: 60, max: 100 } },
  dress: { dressNeckline: { kind: "range", min: 60, max: 100 }, dressStraps: { kind: "fixed", amount: 40 }, dressFit: { kind: "from", min: 80 } },
  blazer: {
    blazerSleeves: { kind: "range", min: 100, max: 220 }, blazerHem: { kind: "range", min: 120, max: 150 },
    blazerWaist: { kind: "fixed", amount: 120 }, shoulderFit: { kind: "fixed", amount: 80 }, blazerLining: { kind: "fixed", amount: 300 },
  },
  jacket: {
    outerwearSleeves: { kind: "range", min: 100, max: 220 }, pufferTearRepair: { kind: "range", min: 120, max: 180 },
    outerwearZipper: { kind: "range", min: 100, max: 150 },
  },
  leatherFur: {
    furLining: { kind: "range", min: 700, max: 2000 }, minorRepairs: { kind: "individual" },
    leatherSleeves: { kind: "range", min: 115, max: 315 },
  },
  formalwear: {
    formalHem: { kind: "range", min: 200, max: 550 }, formalFit: { kind: "range", min: 150, max: 600 },
    embellishments: { kind: "perHour", rate: 50 },
  },
  homeTextiles: {
    topstitch: { kind: "perMetre", rate: 10 }, overlock: { kind: "perMetre", rate: 12 }, hemstitch: { kind: "perMetre", rate: 15 },
  },
  other: {
    sliderReplacement: { kind: "fixed", amount: 20 }, buttonSewing: { kind: "fixed", amount: 5 },
    snapFastener: { kind: "fixed", amount: 20 }, jeansButton: { kind: "fixed", amount: 20 },
  },
};

export const getAvailableServices = (garment: GarmentType | null): ServiceId[] =>
  garment ? Object.keys(officialPricing[garment]) as ServiceId[] : [];

export const getPriceDefinition = (garment: GarmentType | null, service: ServiceId): PriceDefinition | undefined =>
  garment ? officialPricing[garment][service] : undefined;

export const getServicePrice = (garment: GarmentType | null, service: ServiceId): number | null | undefined => {
  const price = getPriceDefinition(garment, service);
  if (!price) return undefined;
  if (price.kind === "individual") return null;
  if (price.kind === "fixed") return price.amount;
  if (price.kind === "range") return (price.min + price.max) / 2;
  if (price.kind === "from") return price.min;
  return price.rate;
};

export const getServiceUnit = (garment: GarmentType | null, service: ServiceId): QuantityUnit | undefined => {
  const price = getPriceDefinition(garment, service);
  return price?.kind === "perHour" ? "hours" : price?.kind === "perMetre" ? "metres" : undefined;
};

const currency = (value: number, language: string) => `${value} ${language === "pl" ? "zł" : "PLN"}`;
export const getServiceDisplay = (garment: GarmentType | null, service: ServiceId, language: string): string => {
  const price = getPriceDefinition(garment, service);
  if (!price) return "";
  if (price.kind === "individual") return language === "pl" ? "Wycena indywidualna" : language === "ru" ? "Индивидуальная оценка" : "Individual quotation";
  if (price.kind === "fixed") return currency(price.amount, language);
  if (price.kind === "range") return `${price.min}–${price.max} ${language === "pl" ? "zł" : "PLN"}`;
  if (price.kind === "from") return `${language === "pl" ? "od" : language === "ru" ? "от" : "from"} ${currency(price.min, language)}`;
  if (price.kind === "perHour") return `${language === "pl" ? "od" : language === "ru" ? "от" : "from"} ${currency(price.rate, language)}/h`;
  return `${currency(price.rate, language)} / 1 m`;
};

export const getServiceCost = (garment: GarmentType | null, service: ServiceId, quantity = 1): number => {
  const price = getServicePrice(garment, service);
  if (price == null) return 0;
  return price * Math.max(quantity || 1, 0.5);
};

export const calculateTotal = (garment: GarmentType | null, services: ServiceId[], quantities: Partial<Record<ServiceId, number>> = {}): number =>
  services.reduce((sum, service) => sum + getServiceCost(garment, service, quantities[service]), 0);

export const calculateExpressRange = (subtotal: number) => ({ minimum: subtotal * 1.5, maximum: subtotal * 2 });
export const formatPrice = (value: number, locale: string) => `${new Intl.NumberFormat(locale === "pl" ? "pl-PL" : locale === "ru" ? "ru-RU" : "en-GB").format(value)} PLN`;

export type MessageData = {
  lng: string; garment: string; items: { name: string; display: string; cost: number; quantity?: number; unit?: QuantityUnit }[];
  total: number; express: boolean; date: string; name: string; phone: string; notes?: string;
};

export function buildRequestMessage(data: MessageData) {
  const individual = data.items.some((item) => item.cost === 0 && /indywidual|индивиду|individual/i.test(item.display));
  const items = data.items.map((item) => `- ${item.name}: ${item.display}${item.quantity && item.unit ? ` × ${item.quantity} ${item.unit === "hours" ? (data.lng === "pl" ? "godz." : data.lng === "ru" ? "ч" : "h") : "m"}` : ""}`).join("\n");
  const range = calculateExpressRange(data.total);
  const expressLine = data.express
    ? data.lng === "pl" ? `\n⚡ Tryb ekspresowy: ${formatPrice(range.minimum, data.lng)}–${formatPrice(range.maximum, data.lng)}`
      : data.lng === "ru" ? `\n⚡ Срочное выполнение: ${formatPrice(range.minimum, data.lng)}–${formatPrice(range.maximum, data.lng)}`
      : `\n⚡ Express service: ${formatPrice(range.minimum, data.lng)}–${formatPrice(range.maximum, data.lng)}`
    : "";
  const individualLine = individual ? (data.lng === "pl" ? "\n⚠ Wymagana także wycena indywidualna." : data.lng === "ru" ? "\n⚠ Также требуется индивидуальная оценка." : "\n⚠ An individual quotation is also required.") : "";
  if (data.lng === "ru") return `Здравствуйте! Прошу рассчитать ориентировочную стоимость ремонта одежды.\n\n👗 Категория: ${data.garment}\n\n🧵 Выбранные услуги:\n${items}\n\n💰 Рассчитываемая сумма: ${formatPrice(data.total, data.lng)}${expressLine}${individualLine}\n📅 Предпочтительная дата: ${data.date}\n👤 Имя: ${data.name}\n📞 Телефон: ${data.phone}\n📝 Примечания: ${data.notes || "—"}\n\nЯ понимаю, что итоговая цена будет определена после примерки и оценки ткани.`;
  if (data.lng === "en") return `Hello! I would like an estimated price for a clothing alteration.\n\n👗 Category: ${data.garment}\n\n🧵 Selected services:\n${items}\n\n💰 Calculable subtotal: ${formatPrice(data.total, data.lng)}${expressLine}${individualLine}\n📅 Preferred date: ${data.date}\n👤 Name: ${data.name}\n📞 Telephone: ${data.phone}\n📝 Notes: ${data.notes || "—"}\n\nI understand that the final price will be agreed after fitting and fabric assessment.`;
  return `Dzień dobry! Proszę o orientacyjną wycenę poprawki krawieckiej.\n\n👗 Kategoria: ${data.garment}\n\n🧵 Wybrane usługi:\n${items}\n\n💰 Suma możliwa do obliczenia: ${formatPrice(data.total, data.lng)}${expressLine}${individualLine}\n📅 Preferowana data: ${data.date}\n👤 Imię: ${data.name}\n📞 Telefon: ${data.phone}\n📝 Uwagi: ${data.notes || "—"}\n\nRozumiem, że ostateczna cena zostanie ustalona po przymiarce i ocenie tkaniny.`;
}

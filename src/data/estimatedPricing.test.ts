import { describe, expect, it } from "vitest";
import { buildRequestMessage, calculateExpressRange, calculateTotal, garments, getAvailableServices, getServiceDisplay, getServicePrice } from "./estimatedPricing";

describe("complete official LenOK pricing", () => {
  it("contains all ten categories and every one of the 36 official services", () => {
    expect(garments).toHaveLength(10);
    expect(garments.flatMap((garment) => getAvailableServices(garment))).toHaveLength(36);
  });
  it("uses fixed prices and range midpoints", () => {
    expect(getServicePrice("trousers", "trouserPlainHem")).toBe(50);
    expect(getServicePrice("skirts", "skirtNarrowHem")).toBe(85);
    expect(getServicePrice("blazer", "blazerSleeves")).toBe(160);
    expect(getServicePrice("dress", "dressFit")).toBe(80);
    expect(getServicePrice("formalwear", "formalHem")).toBe(375);
    expect(getServicePrice("leatherFur", "furLining")).toBe(1350);
  });
  it("preserves original ranges and from prices", () => {
    expect(getServiceDisplay("skirts", "skirtNarrowHem", "pl")).toBe("70–100 zł");
    expect(getServiceDisplay("dress", "dressFit", "en")).toBe("from 80 PLN");
    expect(getServiceDisplay("formalwear", "embellishments", "pl")).toBe("od 50 zł/h");
    expect(getServiceDisplay("leatherFur", "minorRepairs", "pl")).toBe("Wycena indywidualna");
  });
  it("calculates the official express 50–100% surcharge range", () => {
    expect(calculateExpressRange(100)).toEqual({ minimum: 150, maximum: 200 });
  });
  it("calculates quantities without adding individual quotes", () => {
    expect(calculateTotal("formalwear", ["formalHem", "embellishments"], { embellishments: 3 })).toBe(525);
    expect(calculateTotal("homeTextiles", ["topstitch", "overlock"], { topstitch: 4, overlock: 2 })).toBe(64);
    expect(calculateTotal("leatherFur", ["minorRepairs", "leatherSleeves"])).toBe(215);
  });
  it("keeps zero state and compatibility deterministic", () => {
    expect(calculateTotal(null, [])).toBe(0);
    expect(getAvailableServices("shirts")).toEqual(["shirtSleeves", "shirtFit"]);
  });
  it("builds a localized individual-quote summary", () => {
    const message = buildRequestMessage({ lng: "pl", garment: "Skóra i futro", items: [{ name: "Drobne naprawy", display: "Wycena indywidualna", cost: 0 }, { name: "Doszycie zdobień", display: "od 50 zł/h", cost: 150, quantity: 3, unit: "hours" }], total: 150, express: true, date: "2026-09-01", name: "Anna", phone: "+48 500 000 000" });
    expect(message).toContain("Drobne naprawy: Wycena indywidualna");
    expect(message).toContain("× 3 godz.");
    expect(message).toContain("225 PLN–300 PLN");
    expect(message).toContain("Anna");
    expect(message).toContain("Wymagana także wycena indywidualna");
  });
});

import { describe, expect, it } from "vitest";
import { parseMenuTextToCategories } from "../src/shared/utils/clientMenuOcr";

describe("parseMenuTextToCategories (Client-Side Menu Parser)", () => {
  it("extracts categories, dish names, prices, and veg/non-veg tags", () => {
    const rawOcrText = `
      STARTERS
      Paneer Tikka 250
      Veg Spring Roll 180
      Chicken Seekh Kebab 320

      MAIN COURSE
      Butter Chicken - ₹380
      Dal Makhani ... 220
      Paneer Butter Masala 280

      BREADS & RICE
      Butter Naan 60
      Chicken Dum Biryani 340
      Veg Pulao 190/-

      BEVERAGES
      Sweet Lassi 90
      Fresh Lime Soda 70
    `;

    const categories = parseMenuTextToCategories(rawOcrText);

    expect(categories.length).toBeGreaterThanOrEqual(3);

    const starters = categories.find((c) => /starters/i.test(c.categoryName));
    expect(starters).toBeDefined();
    expect(starters?.items.length).toBe(3);

    const paneer = starters?.items.find((i) => i.name.toLowerCase().includes("paneer"));
    expect(paneer).toBeDefined();
    expect(paneer?.price).toBe(250);
    expect(paneer?.isVeg).toBe(true);

    const kebab = starters?.items.find((i) => i.name.toLowerCase().includes("chicken seekh"));
    expect(kebab).toBeDefined();
    expect(kebab?.price).toBe(320);
    expect(kebab?.isVeg).toBe(false);

    const mains = categories.find((c) => /main/i.test(c.categoryName));
    expect(mains).toBeDefined();
    const butterChicken = mains?.items.find((i) => i.name.toLowerCase().includes("butter chicken"));
    expect(butterChicken?.price).toBe(380);
    expect(butterChicken?.isVeg).toBe(false);

    const biryani = categories.flatMap((c) => c.items).find((i) => i.name.toLowerCase().includes("biryani"));
    expect(biryani).toBeDefined();
    expect(biryani?.price).toBe(340);
  });

  it("handles messy OCR punctuation and prices gracefully", () => {
    const messyText = `
      Tandoori Roti ... ₹25/-
      Mutton Rogan Josh - 450
      Cold Coffee with Ice Cream 120.00
    `;

    const categories = parseMenuTextToCategories(messyText);
    const allItems = categories.flatMap((c) => c.items);

    expect(allItems.some((i) => i.name.includes("Tandoori Roti") && i.price === 25)).toBe(true);
    expect(allItems.some((i) => i.name.includes("Mutton Rogan Josh") && i.price === 450 && i.isVeg === false)).toBe(true);
  });
});

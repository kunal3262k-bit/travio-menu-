import { describe, expect, it } from "vitest";
import { selectUpsellRecommendations } from "../src/shared/utils/upsell";

describe("selectUpsellRecommendations", () => {
  it("returns active recommendations for cart items by priority", () => {
    const result = selectUpsellRecommendations(
      [{ menuItemId: "paneer-burger" }],
      [
        { triggerMenuItemId: "paneer-burger", recommendedMenuItemId: "cold-coffee", priority: 8, active: true },
        { triggerMenuItemId: "paneer-burger", recommendedMenuItemId: "fries", priority: 10, active: true }
      ]
    );

    expect(result.map((rule) => rule.recommendedMenuItemId)).toEqual(["fries", "cold-coffee"]);
  });

  it("does not recommend inactive items or items already in the cart", () => {
    const result = selectUpsellRecommendations(
      [{ menuItemId: "paneer-burger" }, { menuItemId: "fries" }],
      [
        { triggerMenuItemId: "paneer-burger", recommendedMenuItemId: "fries", priority: 10, active: true },
        { triggerMenuItemId: "paneer-burger", recommendedMenuItemId: "brownie", priority: 8, active: false }
      ]
    );

    expect(result).toEqual([]);
  });
});

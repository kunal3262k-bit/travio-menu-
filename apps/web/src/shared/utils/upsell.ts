export type CartLine = { menuItemId: string };
export type UpsellRuleView = {
  triggerMenuItemId: string;
  recommendedMenuItemId: string;
  priority: number;
  active: boolean;
};

export function selectUpsellRecommendations(cart: CartLine[], rules: UpsellRuleView[]) {
  const cartIds = new Set(cart.map((item) => item.menuItemId));
  const seen = new Set<string>();

  return rules
    .filter((rule) => rule.active && cartIds.has(rule.triggerMenuItemId) && !cartIds.has(rule.recommendedMenuItemId))
    .sort((a, b) => b.priority - a.priority)
    .filter((rule) => {
      if (seen.has(rule.recommendedMenuItemId)) return false;
      seen.add(rule.recommendedMenuItemId);
      return true;
    })
    .slice(0, 4);
}

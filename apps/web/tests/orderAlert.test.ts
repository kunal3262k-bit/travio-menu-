import { describe, expect, it } from "vitest";
import { mergeAlertIds, dropAlertIds } from "../src/shared/utils/orderAlert";

describe("BUG3 regression: alert-acknowledgement merging (KDS + waiter)", () => {
  it("merges fresh incoming ids with existing unacknowledged, deduped", () => {
    const done = new Set<string>();
    expect(mergeAlertIds(["a", "b"], ["b", "c"], done)).toEqual(["a", "b", "c"]);
  });

  it("never re-adds ids that were already acknowledged/done", () => {
    const done = new Set(["a"]);
    expect(mergeAlertIds([], ["a"], done)).toEqual([]);
    expect(mergeAlertIds(["a"], ["a", "b"], done)).toEqual(["a", "b"]);
  });

  it("ignores falsy/undefined ids (car claims have no tableId)", () => {
    const done = new Set<string>();
    expect(mergeAlertIds([], [undefined, null, ""] as any, done)).toEqual([]);
  });

  it("drops ids by list and keeps the rest", () => {
    expect(dropAlertIds(["a", "b", "c"], ["b", "c"])).toEqual(["a"]);
    expect(dropAlertIds(["a"], [])).toEqual(["a"]);
  });
});
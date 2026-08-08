import { describe, expect, it } from "vitest";
import {
  assertStaffAuthConfig,
  parseStaffCookieSecureMode,
  resolveStaffCookieSecure,
  resolveStaffJwtSecret,
  StaffAuthConfigError,
} from "../src/shared/utils/staffAuthConfig";

const prod = { NODE_ENV: "production" };
const dev = { NODE_ENV: "development" };

const toStr = (bytes: Uint8Array) => Buffer.from(bytes).toString();

describe("resolveStaffJwtSecret", () => {
  it("A: uses the configured JWT_SECRET in production", () => {
    const secret = resolveStaffJwtSecret({ ...prod, JWT_SECRET: "prod-secret-0123456789abcdef" });
    expect(toStr(secret)).toBe("prod-secret-0123456789abcdef");
  });

  it("B: throws in production when JWT_SECRET is missing (no dev fallback)", () => {
    expect(() => resolveStaffJwtSecret(prod)).toThrow(StaffAuthConfigError);
    expect(() => resolveStaffJwtSecret({ ...prod, JWT_SECRET: "" })).toThrow(StaffAuthConfigError);
    expect(() => resolveStaffJwtSecret({ ...prod, JWT_SECRET: "   " })).toThrow(StaffAuthConfigError);
  });

  it("B2: uses the dev fallback outside production", () => {
    const secret = resolveStaffJwtSecret(dev);
    expect(toStr(secret)).toBe("swifttab-dev-staff-secret");
  });
});

describe("resolveStaffCookieSecure", () => {
  it("C: development over HTTP -> Secure=false", () => {
    expect(resolveStaffCookieSecure(dev, false)).toBe(false);
  });

  it("C2: development with STAFF_COOKIE_SECURE=true -> Secure=true", () => {
    expect(resolveStaffCookieSecure({ ...dev, STAFF_COOKIE_SECURE: "true" }, false)).toBe(true);
  });

  it("D: production over HTTPS -> Secure=true", () => {
    expect(resolveStaffCookieSecure(prod, true)).toBe(true);
  });

  it("E: production over HTTP -> throws (fail closed)", () => {
    expect(() => resolveStaffCookieSecure(prod, false)).toThrow(StaffAuthConfigError);
  });

  it("E2: production with STAFF_COOKIE_SECURE=false -> throws even over HTTPS", () => {
    expect(() => resolveStaffCookieSecure({ ...prod, STAFF_COOKIE_SECURE: "false" }, true)).toThrow(
      StaffAuthConfigError
    );
  });

  it("E3: production with explicit true over HTTP -> throws (Secure cookie dropped)", () => {
    expect(() => resolveStaffCookieSecure({ ...prod, STAFF_COOKIE_SECURE: "true" }, false)).toThrow(
      StaffAuthConfigError
    );
  });

  it("invalid STAFF_COOKIE_SECURE mode -> throws", () => {
    expect(() => resolveStaffCookieSecure({ ...prod, STAFF_COOKIE_SECURE: "sometimes" }, true)).toThrow(
      StaffAuthConfigError
    );
  });
});

describe("parseStaffCookieSecureMode", () => {
  it("defaults to auto when unset", () => {
    expect(parseStaffCookieSecureMode(undefined)).toBe("auto");
  });
  it("normalizes case and whitespace", () => {
    expect(parseStaffCookieSecureMode(" TRUE ")).toBe("true");
    expect(parseStaffCookieSecureMode("false")).toBe("false");
  });
});

describe("assertStaffAuthConfig", () => {
  it("passes with a fully configured production env", () => {
    expect(() => assertStaffAuthConfig({ ...prod, JWT_SECRET: "s" })).not.toThrow();
  });

  it("throws for production missing JWT_SECRET", () => {
    expect(() => assertStaffAuthConfig(prod)).toThrow(/JWT_SECRET/);
  });

  it("throws for STAFF_COOKIE_SECURE=false in production", () => {
    expect(() =>
      assertStaffAuthConfig({ ...prod, JWT_SECRET: "s", STAFF_COOKIE_SECURE: "false" })
    ).toThrow(/STAFF_COOKIE_SECURE/);
  });

  it("passes for development without JWT_SECRET", () => {
    expect(() => assertStaffAuthConfig(dev)).not.toThrow();
  });
});

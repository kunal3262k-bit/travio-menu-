export const STAFF_DEV_SECRET = "swifttab-dev-staff-secret";

export type StaffAuthEnv = {
  NODE_ENV?: string;
  JWT_SECRET?: string;
  STAFF_COOKIE_SECURE?: string;
};

export class StaffAuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffAuthConfigError";
  }
}

export type StaffCookieSecureMode = "true" | "false" | "auto";

export function parseStaffCookieSecureMode(value: string | undefined): StaffCookieSecureMode {
  if (!value) return "auto";
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return "true";
  if (normalized === "false") return "false";
  if (normalized === "auto") return "auto";
  throw new StaffAuthConfigError(
    `STAFF_COOKIE_SECURE must be "true", "false", or "auto" (got ${JSON.stringify(value)})`
  );
}

export function resolveStaffJwtSecret(env: StaffAuthEnv): Uint8Array {
  const secret = env.JWT_SECRET?.trim();
  if (secret) {
    return new TextEncoder().encode(secret);
  }
  if (env.NODE_ENV === "production") {
    throw new StaffAuthConfigError(
      "JWT_SECRET is required in production; refusing to fall back to the development secret."
    );
  }
  return new TextEncoder().encode(STAFF_DEV_SECRET);
}

export function resolveStaffCookieSecure(env: StaffAuthEnv, requestSecure: boolean): boolean {
  const mode = parseStaffCookieSecureMode(env.STAFF_COOKIE_SECURE);
  const isProduction = env.NODE_ENV === "production";

  if (isProduction) {
    if (mode === "false") {
      throw new StaffAuthConfigError(
        'STAFF_COOKIE_SECURE="false" is not allowed in production: the staff session cookie must always be Secure.'
      );
    }
    if (!requestSecure) {
      throw new StaffAuthConfigError(
        "Rejecting staff login over a non-HTTPS request in production: a Secure staff session cookie would be dropped by browsers, making the session silently unusable."
      );
    }
    return true;
  }

  return mode === "true";
}

export function assertStaffAuthConfig(env: StaffAuthEnv): void {
  resolveStaffJwtSecret(env);
  parseStaffCookieSecureMode(env.STAFF_COOKIE_SECURE);
  if (env.NODE_ENV === "production" && parseStaffCookieSecureMode(env.STAFF_COOKIE_SECURE) === "false") {
    throw new StaffAuthConfigError(
      'STAFF_COOKIE_SECURE="false" is not allowed in production: the staff session cookie must always be Secure.'
    );
  }
}

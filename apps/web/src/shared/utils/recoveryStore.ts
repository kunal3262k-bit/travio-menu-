// Shared recovery code cache for auto detailing studio password resets
export interface RecoveryRecord {
  code: string;
  expiresAt: number;
}

const globalForRecovery = globalThis as unknown as {
  recoveryCodeStore: Map<string, RecoveryRecord> | undefined;
};

export const recoveryCodeStore =
  globalForRecovery.recoveryCodeStore ?? new Map<string, RecoveryRecord>();

if (process.env.NODE_ENV !== "production") {
  globalForRecovery.recoveryCodeStore = recoveryCodeStore;
}

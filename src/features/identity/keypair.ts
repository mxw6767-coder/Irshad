export type IdentityKeyPair = {
  publicKey: string;
  secretKey: string;
};

function randomBase64(bytes: number) {
  const buffer = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(buffer);
  return btoa(String.fromCharCode(...buffer));
}

export function generateIdentityKeyPair(): IdentityKeyPair {
  return {
    publicKey: randomBase64(32),
    secretKey: randomBase64(32),
  };
}

export function generateDeviceFingerprint(): string {
  return crypto.randomUUID();
}


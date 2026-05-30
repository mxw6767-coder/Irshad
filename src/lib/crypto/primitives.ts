export type EncryptedPayload = {
  ciphertext: string;
  nonce: string;
};

export function base64Encode(input: Uint8Array) {
  let binary = "";
  input.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function base64Decode(input: string) {
  const binary = atob(input);
  const output = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    output[index] = binary.charCodeAt(index);
  }
  return output;
}

export async function deriveMessageNonce() {
  const nonce = new Uint8Array(24);
  crypto.getRandomValues(nonce);
  return base64Encode(nonce);
}

export async function sealPlaintext(plaintext: string): Promise<EncryptedPayload> {
  const encoded = new TextEncoder().encode(plaintext);
  return {
    ciphertext: base64Encode(encoded),
    nonce: await deriveMessageNonce(),
  };
}

export async function openCiphertext(payload: EncryptedPayload) {
  return new TextDecoder().decode(base64Decode(payload.ciphertext));
}

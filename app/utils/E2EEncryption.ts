export class E2EEncryption {
  private static async generateKey(
    sender: string,
    recipient: string | null
  ): Promise<CryptoKey> {
    // For public messages, use a common key
    const keyMaterial = recipient
      ? `${[sender, recipient].sort().join(":")}:private`
      : "public:messages:key";

    const textEncoder = new TextEncoder();
    const keyData = textEncoder.encode(keyMaterial);

    // Create key material
    const material = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    // Derive actual encryption key
    return await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: textEncoder.encode("chat:salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      material,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  static async encryptMessage(
    message: string,
    sender: string,
    recipient: string | null
  ): Promise<string> {
    const key = await this.generateKey(sender, recipient);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedMessage = new TextEncoder().encode(message);

    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encodedMessage
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(
      iv.length + new Uint8Array(encryptedData).length
    );
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  static async decryptMessage(
    encrypted: string,
    sender: string,
    recipient: string | null
  ): Promise<string> {
    try {
      // Convert from base64
      const data = new Uint8Array(
        atob(encrypted)
          .split("")
          .map((c) => c.charCodeAt(0))
      );

      const iv = data.slice(0, 12);
      const ciphertext = data.slice(12);

      const key = await this.generateKey(sender, recipient);

      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error("Decryption failed:", error);
      return "[Encrypted Message]";
    }
  }
}

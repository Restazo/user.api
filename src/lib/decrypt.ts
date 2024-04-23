import { createDecipheriv } from "crypto";

const secret: Buffer = Buffer.from(process.env.ENCRYPTION_SECRET, "hex");

const decrypt = (data: any): string => {
  // create the decipher instance
  const decipher = createDecipheriv("aes-256-ecb", secret, null);
  // update the decipher with the encrypted data
  let decrypted = decipher.update(data, "base64", "utf8");
  // finalize the decryption process
  decrypted += decipher.final("utf8");
  // return the decrypted data
  return decrypted;
};

export default decrypt;

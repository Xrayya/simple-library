import argon2 from "argon2";

export const hasher = {
  encrypt: async (data: string) => {
    return await argon2.hash(data, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  },
  verify: async (encryptedPassword: string, inputPassword: string) => {
    return await argon2.verify(encryptedPassword, inputPassword);
  },
};

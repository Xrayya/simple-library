import { compareSync, hashSync } from "bcrypt-ts";

export const hasher = {
  encrypt: (data: string): string => {
    return hashSync(data, 14);
  },
  verify: (encryptedPassword: string, inputPassword: string): boolean => {
    return compareSync(inputPassword, encryptedPassword);
  },
};

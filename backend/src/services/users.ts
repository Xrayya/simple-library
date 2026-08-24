import { db } from "../db/db";

type UserType = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  googleId: string | null;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date | null;
};

export async function findByEmail({
  email,
}: {
  email: string;
}): Promise<UserType | undefined> {
  const result = await db.query.users.findFirst({
    where: { email: { eq: email } },
  });

  return result;
}

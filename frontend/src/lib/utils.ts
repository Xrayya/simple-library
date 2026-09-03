import { accessToken } from "#/models/accessToken.ts";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  // eslint-disable-next-line tailwindcss/no-custom-classname
  return twMerge(clsx(inputs))
}

export async function authFetch(
  input: string | URL | Request,
  init?: RequestInit,
) {
  let response = await fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken.get()}`,
    },
  });

  if (response.status === 401) {
    const newTokenResponse = await fetch(
      new URL("/api/auth/refresh", window.location.origin),
      {
        method: "POST",
        credentials: "include",
      },
    );

    if (!newTokenResponse.ok) {
      const payload = await newTokenResponse.json();

      throw new Error(
        payload?.error?.message || "An error occurred while fetching data",
        { cause: payload?.error?.name },
      );
    }

    accessToken.set((await newTokenResponse.json()).accessToken);

    response = await fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${accessToken.get()}`,
      },
    });
  }

  return response;
}

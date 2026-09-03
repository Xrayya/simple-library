import { queryOptions } from "@tanstack/react-query";
import { authFetch } from "./utils";

export const authMeOption = queryOptions({
  queryKey: ["auth"] as const,
  retry: false,
  queryFn: async (): Promise<{ username: string; email: string }> => {
    const response = await authFetch(
      new URL("/api/auth/me", window.location.href),
    );

    if (!response.ok) {
      const payload = await response.json();

      throw new Error(
        payload?.error?.message || "An error occurred while fetching data",
        { cause: payload?.error?.name },
      );
    }

    const payload = await response.json();
    return payload.authInfo;
  },
});

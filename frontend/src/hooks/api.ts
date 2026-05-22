import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const ACCESS_TOKEN_KEY = "simple-library.access-token";
let inMemoryAccessToken: string | undefined;

function canUseWindow() {
  return typeof window !== "undefined";
}

export function getAccessToken() {
  if (inMemoryAccessToken) {
    return inMemoryAccessToken;
  }

  if (!canUseWindow()) {
    return undefined;
  }

  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY) || undefined;
  inMemoryAccessToken = token;
  return token;
}

export function setAccessToken(token: string) {
  inMemoryAccessToken = token;

  if (!canUseWindow()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  inMemoryAccessToken = undefined;

  if (!canUseWindow()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

async function fetcher<T>(
  url: string,
  options?: RequestInit,
  auth?: boolean,
): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response = await fetch(BASE_URL + url, {
    ...options,
    headers,
    credentials: auth ? "include" : undefined,
  });

  if (response.status === 401 && auth) {
    const refreshResponse = await fetch(BASE_URL + "/auth/refresh", {
      credentials: "include",
      method: "POST",
    });

    if (!refreshResponse.ok) {
      clearAccessToken();
      throw new Error("Authentication required");
    }

    const refreshPayload = (await refreshResponse.json().catch(() => ({}))) as {
      accessToken?: string;
    };

    if (!refreshPayload.accessToken) {
      clearAccessToken();
      throw new Error("Authentication required");
    }

    setAccessToken(refreshPayload.accessToken);
    headers.set("Authorization", `Bearer ${refreshPayload.accessToken}`);

    response = await fetch(BASE_URL + url, {
      ...options,
      headers,
      credentials: auth ? "include" : undefined,
    });
  }

  if (!response.ok) {
    const payload: any = await response.json().catch(() => ({}));
    console.error("Error fetching data:", payload);
    throw new Error(
      payload?.error?.message || "An error occurred while fetching data",
      { cause: payload?.error?.name },
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export function useApiQuery<T = unknown>(
  queryKey: string[],
  url: string,
  options?: {
    query?: UseQueryOptions<T>;
    fetcher?: RequestInit;
  },
  auth?: boolean,
) {
  return useQuery<T>({
    queryKey,
    queryFn: () => fetcher<T>(url, options?.fetcher, auth),
    ...options?.query,
  });
}

export function useApiMutation<TInput = unknown, TOutput = unknown>(
  url: string,
  method: "POST" | "PUT" | "DELETE" = "POST",
  options?: {
    mutation?: UseMutationOptions<TOutput, Error, TInput>;
    fetcher?: RequestInit;
  },
  auth?: boolean,
) {
  return useMutation<TOutput, Error, TInput>({
    mutationFn: (data: TInput) =>
      fetcher<TOutput>(
        url,
        {
          method,
          body: JSON.stringify(data),
          ...options?.fetcher,
        },
        auth,
      ),
    ...options?.mutation,
    onError: () => {},
  });
}

import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

async function fetcher<T>(
  url: string,
  options?: RequestInit,
  auth?: boolean,
): Promise<T> {
  let response = await fetch(BASE_URL + url, {
    headers: { "Content-Type": "application/json" },
    credentials: auth ? "include" : undefined,
    ...options,
  });

  if (response.status === 401 && auth) {
    const payload: any = await response.json();
    console.error("Unauthorized access - 401", payload);

    await fetch(BASE_URL + "/auth/refresh", {
      credentials: "include",
      method: "POST",
    });

    response = await fetch(BASE_URL + url, {
      headers: { "Content-Type": "application/json" },
      credentials: auth ? "include" : undefined,
      ...options,
    });
  }

  if (!response.ok) {
    const payload: any = await response.json();
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
    onError: (error: Error) => { },
  });
}

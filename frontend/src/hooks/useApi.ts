import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(BASE_URL + url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const payload: any = await response.json().catch(() => ({}));
    console.error("Error fetching data:", payload);
    throw new Error(
      payload?.error?.message || "An error occurred while fetching data",
    );
  }

  return response.json();
}

export function useApiQuery<T = unknown>(
  queryKey: string[],
  url: string,
  options?: UseQueryOptions<T>,
) {
  return useQuery<T>({
    queryKey,
    queryFn: () => fetcher<T>(url),
    ...options,
  });
}

export function useApiMutation<TInput = unknown, TOutput = unknown>(
  url: string,
  method: "POST" | "PUT" | "DELETE" = "POST",
  options?: UseMutationOptions<TOutput, Error, TInput>,
) {
  return useMutation<TOutput, Error, TInput>({
    mutationFn: (data: TInput) =>
      fetcher<TOutput>(url, {
        method,
        body: JSON.stringify(data),
      }),
    ...options,
  });
}

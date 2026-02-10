import type { ApiErrorBody } from "../types/errors";
const API_URL =
  (import.meta as any).env?.VITE_API_URL ?? "http://localhost:3000";

export async function readErrorMessage(
  res: Response,
  fallback = "Erro inesperado"
) {
  try {
    const data = (await res.json()) as ApiErrorBody;
    return data?.message || fallback;
  } catch {
    return fallback;
  }
}

export function getToken() {
  return (
    localStorage.getItem("token") ??
    sessionStorage.getItem("token")
  );
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const defaultHeaders: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers, // agora só adiciona, não apaga
    },
  });
}

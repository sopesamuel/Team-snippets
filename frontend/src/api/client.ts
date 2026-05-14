const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type Method = "GET" | "POST";

export async function apiFetch<T>(
  path: string,
  method: Method = "GET",
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw error;
  }

  return res.json();
}
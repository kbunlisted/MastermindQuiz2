// Utility functions for making API requests
import { queryClient } from "./queryClient";

export async function apiRequest(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: any
) {
  const response = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response;
}

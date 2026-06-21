const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiFetch = async (path, options = {}) => {
  const { token, headers, ...fetchOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...fetchOptions,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

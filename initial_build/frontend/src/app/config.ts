export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("session_token") : null;
  
  // Create a new headers object. If options.headers is already a Headers object,
  // we could handle that, but for this app it's usually just a plain object.
  const customHeaders: Record<string, string> = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => { customHeaders[key] = value; });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => { customHeaders[key] = value; });
    } else {
      Object.assign(customHeaders, options.headers);
    }
  }
  
  if (token) {
    customHeaders["Authorization"] = `Bearer ${token}`;
  }
  
  return fetch(url, { ...options, headers: customHeaders });
};

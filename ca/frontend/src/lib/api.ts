// Dynamically resolve API URL based on current browser hostname
function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // If running in production (not localhost/127.0.0.1), use the correct Render backend
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return "https://ca-rtfj.onrender.com/api";
    }
  }

  let apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    apiUrl = apiUrl.trim();
    // Fix single slash protocol typos (e.g. https:/ca-rtfj.onrender.com)
    if (apiUrl.startsWith("https:/") && !apiUrl.startsWith("https://")) {
      apiUrl = apiUrl.replace("https:/", "https://");
    } else if (apiUrl.startsWith("http:/") && !apiUrl.startsWith("http://")) {
      apiUrl = apiUrl.replace("http:/", "http://");
    }
    
    // Ensure the API URL ends with /api
    if (!apiUrl.endsWith("/api") && !apiUrl.endsWith("/api/")) {
      if (apiUrl.endsWith("/")) {
        apiUrl = apiUrl.slice(0, -1);
      }
      apiUrl = `${apiUrl}/api`;
    }
    return apiUrl;
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000/api`;
  }
  return "http://127.0.0.1:8000/api";
}



export const API_BASE_URL = getApiBaseUrl();

// Helper to get auth token
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("casa_amora_token");
  }
  return null;
};

// Generic fetch wrapper
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  
  const token = getAuthToken();
  if (token) {
    headers.set("Authorization", `Token ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Extract meaningful error message from DRF responses
    let message = "API Request Failed";
    if (data.error) {
      message = data.error;
    } else if (data.detail) {
      message = data.detail;
    } else if (typeof data === "object" && Object.keys(data).length > 0) {
      // DRF validation errors come as { field: ["error msg"] }
      const messages = Object.entries(data)
        .map(([key, val]) => {
          const v = Array.isArray(val) ? val.join(", ") : String(val);
          return `${key}: ${v}`;
        })
        .join("; ");
      if (messages) message = messages;
    }
    throw new Error(message);
  }

  return data;
}

/**
 * REST API client for Sree's Home Bakery.
 * Handles token attachment, error responses, authentication, enquiries, and admin operations.
 */

const API_BASE = ""; // Proxied via Vite to FastAPI backend (port 8001)

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("srees_auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg =
      (typeof data === "object" && data !== null && (data.detail || data.message)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // --- Auth Endpoints ---
  async register(payload: {
    name: string;
    phone: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }) {
    return request<{ success: boolean; token: string; user: any; message: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async login(payload: { identifier: string; password: string }) {
    return request<{ success: boolean; token: string; user: any; message: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async adminLogin(payload: { email: string; password: string }) {
    return request<{ success: boolean; token: string; user: any; message: string }>("/api/auth/admin-login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async fetchMe() {
    return request<{ success: boolean; user: any }>("/api/auth/me");
  },

  async updateProfile(payload: { name: string; phone: string; email: string }) {
    return request<{ success: boolean; user: any; message: string }>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // --- Public Bakery Data ---
  async fetchBakeryInfo() {
    return request<any>("/api/bakery/info");
  },

  async fetchMenu(category?: string) {
    const query = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
    return request<{ success: boolean; products: any[] }>(`/api/menu${query}`);
  },

  async fetchProducts(category?: string) {
    const query = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
    return request<{ success: boolean; products: any[] }>(`/api/products${query}`);
  },

  async fetchGallery(category?: string) {
    const query = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
    return request<{ success: boolean; gallery: any[] }>(`/api/gallery${query}`);
  },

  async fetchOffers() {
    return request<{ success: boolean; offers: any[] }>("/api/offers");
  },

  async fetchDelivery() {
    return request<any>("/api/bakery/delivery");
  },

  async fetchFaqs() {
    return request<any>("/api/bakery/faqs");
  },

  // --- Customer Enquiries ---
  async submitOrder(enquiry: {
    name: string;
    phone: string;
    email?: string;
    product?: string;
    quantity?: string;
    requiredDate?: string;
    eggPreference?: string;
    customization?: string;
    deliveryRequired?: string;
    additionalMessage?: string;
    referenceImageUrl?: string;
  }) {
    return request<{ success: boolean; id: number; message: string }>("/api/enquiries/order", {
      method: "POST",
      body: JSON.stringify(enquiry),
    });
  },

  async submitCustomCake(enquiry: {
    name: string;
    phone: string;
    email?: string;
    requiredDate?: string;
    eggPreference?: string;
    occasion?: string;
    flavour?: string;
    size?: string;
    theme?: string;
    colour?: string;
    sweetness?: string;
    messageOnCake?: string;
    additionalMessage?: string;
    referenceImageUrl?: string;
  }) {
    return request<{ success: boolean; id: number; message: string }>("/api/enquiries/custom-cake", {
      method: "POST",
      body: JSON.stringify(enquiry),
    });
  },

  async fetchUserEnquiries() {
    return request<{ success: boolean; count: number; enquiries: any[] }>("/api/user/enquiries");
  },

  // --- Custom Cake Reference Image Upload ---
  async uploadCustomReference(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("srees_auth_token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/api/upload-reference`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Image upload failed. Please try again.");
    }

    return response.json() as Promise<{
      success: boolean;
      filename: string;
      url: string;
    }>;
  },

  // --- RAG Chat Assistant ---
  async chatWithAssistant(message: string) {
    return request<{
      answer: string;
      grounded: boolean;
      sources: string[];
      engine?: string;
    }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  // --- Admin Endpoints ---
  async adminGetOverview() {
    return request<{
      success: boolean;
      enquiries: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        today: number;
      };
      total_customers: number;
      total_products: number;
    }>("/api/admin/overview");
  },

  async adminGetEnquiries(params?: { status?: string; type?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== "All") searchParams.append("status", params.status);
    if (params?.type && params.type !== "All") searchParams.append("type", params.type);
    if (params?.search) searchParams.append("search", params.search);
    const qs = searchParams.toString();
    return request<{ success: boolean; count: number; enquiries: any[] }>(
      `/api/admin/enquiries${qs ? `?${qs}` : ""}`
    );
  },

  async adminGetEnquiry(id: number) {
    return request<{ success: boolean; enquiry: any }>(`/api/admin/enquiries/${id}`);
  },

  async adminUpdateEnquiryStatus(id: number, status: string) {
    return request<{ success: boolean; message: string; enquiry: any }>(
      `/api/admin/enquiries/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
  },

  async adminGetMenu() {
    return request<{ success: boolean; products: any[] }>("/api/admin/menu");
  },

  async adminCreateProduct(payload: {
    name: string;
    category: string;
    price: string;
    description?: string;
    image_url?: string;
    is_available?: number;
  }) {
    return request<{ success: boolean; message: string; product: any }>("/api/admin/menu", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async adminUpdateProduct(id: number, payload: any) {
    return request<{ success: boolean; message: string; product: any }>(`/api/admin/menu/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async adminDeleteProduct(id: number) {
    return request<{ success: boolean; message: string }>(`/api/admin/menu/${id}`, {
      method: "DELETE",
    });
  },

  async adminGetGallery() {
    return request<{ success: boolean; gallery: any[] }>("/api/admin/gallery");
  },

  async adminAddGallery(payload: { src: string; label: string; category: string; ai_context?: string }) {
    return request<{ success: boolean; message: string; id: number }>("/api/admin/gallery", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async adminDeleteGallery(id: number) {
    return request<{ success: boolean; message: string }>(`/api/admin/gallery/${id}`, {
      method: "DELETE",
    });
  },

  async adminGetOffers() {
    return request<{ success: boolean; offers: any[] }>("/api/admin/offers");
  },

  async adminUpdateOffer(id: number, payload: any) {
    return request<{ success: boolean; message: string }>(`/api/admin/offers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async adminGetCustomers() {
    return request<{ success: boolean; count: number; customers: any[] }>("/api/admin/customers");
  },

  async adminGetCustomerEnquiries(customerId: number) {
    return request<{ success: boolean; customer_id: number; enquiries: any[] }>(
      `/api/admin/customers/${customerId}/enquiries`
    );
  },

  async adminGetRagStatus() {
    return request<{
      success: boolean;
      status: string;
      documents_count: number;
      chunk_count: number;
      vocabulary_size: number;
      last_updated: string | null;
      vector_store_path: string;
    }>("/api/admin/rag/status");
  },

  async adminRebuildRag() {
    return request<{ success: boolean; message: string; chunk_count: number }>("/api/admin/rag/rebuild", {
      method: "POST",
    });
  },
};

// Named exports for backwards compatibility
export const submitOrderEnquiry = api.submitOrder;
export const submitCustomCakeEnquiry = api.submitCustomCake;
export const uploadCustomReference = api.uploadCustomReference;
export const fetchBakeryInfo = api.fetchBakeryInfo;
export const fetchMenu = api.fetchMenu;
export const fetchProducts = api.fetchProducts;
export const fetchGallery = api.fetchGallery;
export const fetchOffers = api.fetchOffers;
export const fetchDelivery = api.fetchDelivery;
export const chatWithAssistant = api.chatWithAssistant;
export default api;


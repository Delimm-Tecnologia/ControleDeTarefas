// ============================================================
// CLIENTE HTTP BASE — src/services/api.ts
// ============================================================
// Para trocar de backend, basta alterar VITE_API_URL no .env
// Exemplo: VITE_API_URL=https://api.suaempresa.com/v1
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TOKEN_KEY = 'delimm_token';

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const config: RequestInit = {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...options.headers,
        },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido.' }));
        throw new Error(errorData.message || `Erro HTTP ${response.status}`);
    }

    // 204 No Content — sem corpo
    if (response.status === 204) return null as T;

    return response.json();
}

export const api = {
    get: <T>(endpoint: string) =>
        request<T>(endpoint),

    post: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),

    put: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),

    patch: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),

    delete: <T>(endpoint: string) =>
        request<T>(endpoint, { method: 'DELETE' }),
};

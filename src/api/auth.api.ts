const API_BASE = import.meta.env.VITE_API_URL
console.log("API BASE:", import.meta.env.VITE_API_URL)

interface AuthResponse {
    access_token: string
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
        throw new Error("Invalid credentials")
    }

    return res.json()
}

export async function signup(
    email: string,
    password: string
): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
    }

    return res.json();
}


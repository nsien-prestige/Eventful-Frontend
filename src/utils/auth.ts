export function getToken(): string | null {
    return localStorage.getItem("token");
}

export function logout() {
    localStorage.removeItem("token");
}

export function isLoggedIn(): boolean {
    return !!getToken();
}

export function decodeJWT(token: string) {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

export function getUserRoles(): string[] | null {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.roles || [];
    } catch {
        return null;
    }
}

export function isCreator(): boolean {
    const roles = getUserRoles();
    return roles ? roles.includes("creator") : false;
}


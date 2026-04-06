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

export function isTokenExpired(): boolean {
    const token = getToken();
    if (!token) return true;

    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;

    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
}

export function isTokenValid(): boolean {
    return isLoggedIn() && !isTokenExpired();
}

export function requireAuth(): boolean {
    if (!isTokenValid()) {
        logout();
        
        // Save current page to redirect back after login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/signup') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
        }
        
        window.location.href = '/login';
        return false;
    }
    return true;
}

export function getCurrentUserProfile() {
    const token = getToken();
    if (!token) return null;

    const decoded = decodeJWT(token);
    if (!decoded) return null;

    const firstName = decoded.firstName || decoded.first_name || decoded.given_name || "";
    const lastName = decoded.lastName || decoded.last_name || decoded.family_name || "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    const email = decoded.email || "";

    let fallbackName = "";
    if (!fullName && email) {
        const emailPrefix = String(email).split("@")[0];
        fallbackName = emailPrefix
            .split(/[._-]+/)
            .filter(Boolean)
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
    }

    const displayName = fullName || fallbackName || "Eventful User";
    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part: string) => part.charAt(0).toUpperCase())
        .join("");

    return {
        displayName,
        initials: initials || "EU",
        email,
    };
}


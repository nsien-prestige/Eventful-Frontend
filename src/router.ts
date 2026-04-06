import { renderHomePage } from "./pages/home/home";
import { renderLogin } from "./pages/login/login";
import { renderSignup } from "./pages/signup/signup";
import { renderNavbar } from "./components/navbar/navbar";
import { renderExplore } from "./pages/explore/explore";
import { renderCreateLanding } from "./pages/create/createLanding";
import { isLoggedIn, requireAuth } from "./utils/auth";
import { renderMyEvents } from "./pages/my-events/my-events";
import { renderEventDetails } from "./pages/event-details/event-details";
import { renderCreateEventPage } from "./pages/create/createEventPage";
import { renderDashboard } from "./pages/dashboard/dashboard";


const routes: Record<string, () => void> = {
    "/": renderHomePage,
    "/login": renderLogin,
    "/signup": renderSignup,
    "/explore": renderExplore,
    "/create": renderCreateLanding,
    "/my-events": renderMyEvents,
    "/dashboard": renderDashboard,
    "/create/new": renderCreateEventPage
};

const authRoutes = ["/login", "/signup"];

const protectedRoutes = ["/create/new", "/my-events", "/dashboard"];

export function navigate(path: string) {
    applyTheme(path)

    window.history.pushState({}, "", path);
    router();
}

export function router() {
    const path = window.location.pathname;
    const app = document.getElementById("app")!;
    const navbarRoot = document.getElementById("navbar")!;

    app.innerHTML = "";
    navbarRoot.innerHTML = "";

    const loggedIn = isLoggedIn();

    if (protectedRoutes.includes(path)) {
        if (!requireAuth()) {
            return;
        }
    }

    // 🚫 Prevent logged-in users from visiting auth pages
    if (authRoutes.includes(path) && loggedIn) {
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin');
        navigate(redirectTo);
        return;
    }

    // 🎯 Hide navbar on auth pages
    if (!authRoutes.includes(path)) {
        renderNavbar(navbarRoot);
    }

    if (path.startsWith("/event/")) {
        const publicId = path.split("/event/")[1];
        renderEventDetails(publicId);
        return;
    }

    const route = routes[path] || renderHomePage;
    route();
}

window.addEventListener("popstate", router);

function applyTheme(path: string) {
    if (path === "/create") {
        document.body.setAttribute("data-theme", "create");
    } else if (path === "/explore") {
        document.body.setAttribute("data-theme", "buy");
    } else if (path === "/sell") {
        document.body.setAttribute("data-theme", "sell");
    } else {
        document.body.removeAttribute("data-theme");
    }
}

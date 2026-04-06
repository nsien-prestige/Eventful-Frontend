import "./navbar.css";
import { navigate } from "../../router";
import { getCurrentUserProfile, isCreator, isLoggedIn, logout } from "../../utils/auth";

export function renderNavbar(root: HTMLElement) {
    const existing = document.querySelector(".app-navbar");
    if (existing) existing.remove();

    const nav = document.createElement("header");
    const path = window.location.pathname;
    const isHome = path === "/";
    const isDashboard = path === "/dashboard";
    const isExplore = path === "/explore";

    nav.className = `app-navbar ${isHome ? "home-navbar" : "standard-navbar"} ${isDashboard ? "dashboard-navbar" : ""} ${isExplore ? "explore-navbar" : ""}`.trim();
    nav.innerHTML = isHome ? renderHomeNavbar() : renderStandardNavbar(path);

    root.appendChild(nav);

    setupLogoNavigation();
    setupRouteLinks();
    setupProfileMenu();
    setupLogout();

    if (isHome) {
        setupSectionScroll();
    }
}

function renderHomeNavbar() {
    const loggedIn = isLoggedIn();
    const profile = getCurrentUserProfile();
    const dashboardTarget = loggedIn ? "/dashboard" : "/login";

    return `
        <div class="nav-shell home-shell">
            <button class="brand-lockup" id="logo-btn" type="button">
                <span class="brand-mark">
                    ${renderBrandMark()}
                </span>
                <span class="brand-copy">
                    <strong>Eventful</strong>
                </span>
            </button>

            <nav class="nav-links home-links home-nav-main" aria-label="Primary">
                <button class="nav-link active" type="button" data-route="/">Home</button>
                <button class="nav-link" type="button" data-scroll-target="home-features">Why Eventful</button>
                <button class="nav-link" type="button" data-scroll-target="home-discover">Discover</button>
                <button class="nav-link" type="button" data-route="${dashboardTarget}">Dashboard</button>
            </nav>

            <div class="nav-actions home-actions home-cta-actions">
                <button class="nav-action ghost-btn home-explore-btn" type="button" data-route="/explore">
                    Explore
                </button>

                <button class="nav-action dashboard-btn home-create-btn" type="button" data-route="/create">
                    Create event
                </button>

                ${loggedIn ? `
                    <div class="profile-wrap">
                        <button class="profile-trigger" id="profileTrigger" type="button">
                            <span class="profile-avatar">${profile?.initials || "EU"}</span>
                            <span class="profile-text">${profile?.displayName || "Eventful User"}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="profile-chevron">
                                <polyline points="6 9 12 15 18 9" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        <div class="profile-menu" id="profileMenu">
                            <button class="profile-menu-item logout-btn" id="logoutBtn" type="button">Logout</button>
                        </div>
                    </div>
                ` : `
                    <button class="nav-action ghost-btn" type="button" data-route="/login">Log in</button>
                `}
            </div>
        </div>
    `;
}

function renderStandardNavbar(path: string) {
    const loggedIn = isLoggedIn();
    const creator = isCreator();
    const profile = getCurrentUserProfile();
    const dashboardTarget = loggedIn ? "/dashboard" : "/login";

    return `
        <div class="nav-shell standard-shell">
            <button class="brand-lockup compact" id="logo-btn" type="button">
                <span class="brand-mark">
                    ${renderBrandMark()}
                </span>
                <span class="brand-copy">
                    <strong>Eventful</strong>
                </span>
            </button>

            <nav class="nav-links standard-links">
                <button class="nav-link ${path === "/" ? "active" : ""}" type="button" data-route="/">Home</button>
                <button class="nav-link ${path === "/explore" ? "active" : ""}" type="button" data-route="/explore">Explore</button>
                <button class="nav-link ${path === "/dashboard" ? "active" : ""}" type="button" data-route="${dashboardTarget}">Dashboard</button>
                <button class="nav-link ${path === "/create" ? "active" : ""}" type="button" data-route="/create">Create</button>
                ${loggedIn && creator ? `
                    <button class="nav-link ${path === "/my-events" ? "active" : ""}" type="button" data-route="/my-events">My events</button>
                ` : ""}
            </nav>

            <div class="nav-actions">
                ${loggedIn ? `
                    <div class="profile-wrap">
                        <button class="profile-trigger compact" id="profileTrigger" type="button">
                            <span class="profile-avatar">${profile?.initials || "EU"}</span>
                            <span class="profile-text">${profile?.displayName || "Eventful User"}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="profile-chevron">
                                <polyline points="6 9 12 15 18 9" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        <div class="profile-menu right" id="profileMenu">
                            <button class="profile-menu-item logout-btn" id="logoutBtn" type="button">Logout</button>
                        </div>
                    </div>
                ` : `
                    <button class="nav-action ghost-btn" type="button" data-route="/login">Log in</button>
                `}
            </div>
        </div>
    `;
}

function setupLogoNavigation() {
    document.getElementById("logo-btn")?.addEventListener("click", () => navigate("/"));
}

function renderBrandMark() {
    return `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 8.5C6 6.01472 8.01472 4 10.5 4H14.25C17.9779 4 21 7.02208 21 10.75V11.5C21 16.1944 17.1944 20 12.5 20H10.5C8.01472 20 6 17.9853 6 15.5V8.5Z" fill="currentColor" opacity="0.12"/>
            <path d="M7 8.75C7 6.67893 8.67893 5 10.75 5H13.75C17.2018 5 20 7.79822 20 11.25C20 14.7018 17.2018 17.5 13.75 17.5H11.25" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
            <path d="M10.75 9.25H16" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
            <path d="M10.75 12.1H15" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
            <path d="M10.75 14.95H13.2" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
            <path d="M4.75 15.75L7.1 18.1L11.25 13.95" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
}

function setupRouteLinks() {
    document.querySelectorAll<HTMLElement>("[data-route]").forEach((element) => {
        element.addEventListener("click", () => {
            const route = element.getAttribute("data-route");
            if (route) navigate(route);
        });
    });
}

function setupSectionScroll() {
    document.querySelectorAll<HTMLElement>("[data-scroll-target]").forEach((element) => {
        element.addEventListener("click", () => {
            const targetId = element.getAttribute("data-scroll-target");
            if (!targetId) return;

            const target = document.getElementById(targetId);
            if (!target) return;

            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

function setupProfileMenu() {
    const trigger = document.getElementById("profileTrigger");
    const menu = document.getElementById("profileMenu");
    if (!trigger || !menu) return;

    trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        menu.classList.toggle("show");
    });

    document.addEventListener("click", () => {
        menu.classList.remove("show");
    });
}

function setupLogout() {
    const logoutButton = document.getElementById("logoutBtn");
    if (!logoutButton) return;

    logoutButton.addEventListener("click", () => {
        logout();
        navigate("/login");
    });
}

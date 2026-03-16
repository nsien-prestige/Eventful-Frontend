import "./navbar.css";
import { navigate } from "../../router";
import { isLoggedIn, logout, isCreator } from "../../utils/auth";

export function renderNavbar(root: HTMLElement) {
    const existing = document.querySelector(".navbar");
    if (existing) existing.remove();

    const nav = document.createElement("header");
    nav.className = "navbar";

    const loggedIn = isLoggedIn();
    const creator = isCreator();

    // Detect current route
    const path = window.location.pathname;
    const isHome = path === "/";
    const isExplore = path.startsWith("/explore");
    const isCreate = path.startsWith("/create");
    const isMyEvents = path.startsWith("/my-events");

    nav.innerHTML = `
        <div class="nav-container">
            <!-- Left: Logo -->
            <div class="nav-left">
                <div class="logo" id="logo-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Eventful</span>
                </div>
            </div>

            <!-- Center: Navigation Links -->
            <nav class="nav-center">
                <a href="/" class="nav-link ${isHome ? 'active' : ''}" data-route="/">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2"/>
                        <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Home</span>
                </a>

                <a href="/explore" class="nav-link ${isExplore ? 'active' : ''}" data-route="/explore">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>Events</span>
                </a>

                ${loggedIn ? `
                    <a href="/create" class="nav-link ${isCreate ? 'active' : ''}" data-route="/create">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2"/>
                            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <span>Create</span>
                    </a>
                ` : ''}

                ${loggedIn && creator ? `
                    <div class="nav-dropdown">
                        <button class="nav-link dropdown-trigger ${isMyEvents ? 'active' : ''}" id="myEventsDropdown">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2"/>
                                <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <span>My Events</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="dropdown-icon">
                                <polyline points="6 9 12 15 18 9" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        <div class="dropdown-menu" id="myEventsMenu">
                            <a href="/my-events" class="dropdown-item" data-route="/my-events">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                                    <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                <span>Created Events</span>
                            </a>
                            <a href="/attending" class="dropdown-item" data-route="/attending">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                                    <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                <span>Attending</span>
                            </a>
                        </div>
                    </div>
                ` : ''}
            </nav>

            <!-- Right: Actions -->
            <div class="nav-right">
                ${loggedIn ? `
                    <!-- Dark Mode Toggle -->
                    <button class="icon-btn" id="darkModeToggle" title="Toggle dark mode">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="sun-icon">
                            <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
                            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
                            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
                            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>

                    <!-- Notifications -->
                    <button class="icon-btn notification-btn" id="notificationBtn" title="Notifications">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <span class="notification-badge">3</span>
                    </button>

                    <!-- User Profile Dropdown -->
                    <div class="nav-dropdown">
                        <button class="user-profile" id="userProfileDropdown">
                            <div class="user-avatar">PN</div>
                            <span class="user-name">Prestige</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="dropdown-icon">
                                <polyline points="6 9 12 15 18 9" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                        <div class="dropdown-menu dropdown-menu-right" id="userProfileMenu">
                            ${creator ? `
                                <a href="/dashboard" class="dropdown-item" data-route="/dashboard">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                                        <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                                        <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                                        <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                    <span>Dashboard</span>
                                </a>
                            ` : ''}
                            <a href="/settings" class="dropdown-item" data-route="/settings">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                                    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                <span>Settings</span>
                            </a>
                            <div class="dropdown-divider"></div>
                            <button class="dropdown-item logout-item" id="logoutBtn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2"/>
                                    <polyline points="16 17 21 12 16 7" stroke="currentColor" stroke-width="2"/>
                                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                ` : `
                    <a href="/signup" class="nav-action secondary" data-route="/signup">Sign up</a>
                    <a href="/login" class="nav-action primary" data-route="/login">Log in</a>
                `}
            </div>
        </div>
    `;

    root.appendChild(nav);

    // Setup event listeners
    setupNavigation();
    setupDropdowns();
    if (loggedIn) {
        setupDarkMode();
        setupNotifications();
        setupLogout();
    }
}

function setupNavigation() {
    document.querySelectorAll('[data-route]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = (e.currentTarget as HTMLElement).getAttribute('data-route');
            if (route) navigate(route);
        });
    });

    document.getElementById('logo-btn')?.addEventListener('click', () => navigate('/'));
}

/**
 * Setup dropdown menus
 */
function setupDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger') as HTMLElement;
        const menu = dropdown.querySelector('.dropdown-menu') as HTMLElement;
        
        if (!trigger || !menu) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Close other dropdowns
            document.querySelectorAll('.dropdown-menu.show').forEach(otherMenu => {
                if (otherMenu !== menu) {
                    otherMenu.classList.remove('show');
                }
            });
            
            // Toggle this dropdown
            menu.classList.toggle('show');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    });
}

/**
 * Setup dark mode toggle
 */
function setupDarkMode() {
    const darkModeBtn = document.getElementById('darkModeToggle');
    if (!darkModeBtn) return;

    darkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        // Save preference
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    });

    // Load saved preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
    }
}

/**
 * Setup notification button
 */
function setupNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    if (!notificationBtn) return;

    notificationBtn.addEventListener('click', () => {
        // TODO: Open notifications panel
        console.log('Show notifications');
    });
}

/**
 * Setup logout button
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', () => {
        logout();
        navigate('/login');
    });
}
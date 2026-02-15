import "./navbar.css";
import { navigate } from "../../router";
import { isLoggedIn, logout, isCreator } from "../../utils/auth";

export function renderNavbar(root: HTMLElement) {
    const existing = document.querySelector(".navbar");
    if (existing) existing.remove();

    const nav = document.createElement("header");
    nav.className = "navbar";

    const loggedIn = isLoggedIn();

    // detect route to auto-set active tab
    const path = window.location.pathname;
    const isCreate = path.startsWith("/create");
    const isMyEvents = path.startsWith("/my-events")

    nav.innerHTML = `
        <div class="nav-left">
            <span class="logo" id="logo-btn">Eventful</span>
        </div>

        <nav class="nav-center">
            <button id="buy-btn" class="nav-pill ${!isCreate && !isMyEvents ? "active" : ""}">
                Explore
            </button>

            <button id="create-btn" class="nav-pill ${isCreate ? "active" : ""}">
                Create
            </button>

            ${
                loggedIn && isCreator()
                    ? `<button id="my-events-btn" class="nav-pill ${isMyEvents ? "active" : ""}">
                            My Events
                    </button>`
                    : ""
            }
        </nav>

        <div class="nav-right">
            ${
                loggedIn
                    ? `<button id="logout-btn" class="login-btn">Logout</button>`
                    : `
                        <a id="signup-btn" class="nav-link">Sign Up</a>
                        <button id="login-btn" class="login-btn">Log In</button>
                      `
            }
        </div>
    `;

    root.appendChild(nav);

    // Auto set theme on load
    setTheme(isCreate ? "create" : "buy");

    document.getElementById("buy-btn")!
        .addEventListener("click", () => {
            setTheme("buy");
            navigate("/explore");
        });

    document.getElementById("create-btn")!
        .addEventListener("click", () => {
            setTheme("create");
            navigate("/create");
        });

    document.getElementById("logo-btn")!
        .addEventListener("click", () => {
            setTheme("buy");
            navigate("/");
        });

    if (!loggedIn) {
        document.getElementById("login-btn")!
            .addEventListener("click", () => navigate("/login"));

        document.getElementById("signup-btn")!
            .addEventListener("click", () => navigate("/signup"));
    } else {
        document.getElementById("logout-btn")!
            .addEventListener("click", () => {
                logout();
                navigate("/login");
            });

        if (loggedIn && isCreator()) {
            document.getElementById("my-events-btn")!
                .addEventListener("click", () => {
                    setTheme("create"); // since it's creator related
                    navigate("/my-events");
                });
        }
    }
}

function setTheme(theme: string) {
    document.body.setAttribute("data-theme", theme);
}



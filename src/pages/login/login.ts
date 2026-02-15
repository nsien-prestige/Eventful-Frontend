import "./login.css";
import { navigate } from "../../router";
import { login } from "../../api/auth.api";
import { showMessage } from "../../components/notify/notify";


export function renderLogin() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
        <div class="auth-wrapper">
            <div class="auth-card">
                <h2>Welcome Back</h2>
                <p class="auth-sub">Login to your account</p>

                <form id="login-form" class="auth-form">
                    <input type="email" id="email" placeholder="Email" required />
                    <input type="password" id="password" placeholder="Password" required />
                    <button type="submit">Login</button>
                </form>

                <p class="auth-switch">
                    Don't have an account?
                    <span id="go-signup">Sign up</span>
                </p>
            </div>
        </div>
    `;

    document.getElementById("go-signup")!
        .addEventListener("click", () => navigate("/signup"));

    document.getElementById("login-form")!
        .addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = (document.getElementById("email") as HTMLInputElement).value;
            const password = (document.getElementById("password") as HTMLInputElement).value;

            try {
                const data = await login(email, password);
                localStorage.setItem("token", data.access_token);

                showMessage("Login successful 🎉", "success");

                navigate("/");
            } catch (err) {
                showMessage("Invalid credentials", "error");
            }
        });
}

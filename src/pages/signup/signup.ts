import "./signup.css";
import { navigate } from "../../router";
import { signup } from "../../api/auth.api";
import { showMessage } from "../../components/notify/notify";

export function renderSignup() {
    const app = document.getElementById("app")!;

    app.innerHTML = `
        <div class="auth-wrapper">
            <div class="auth-card">
                <h2>Create Account</h2>
                <p class="auth-sub">Join Eventful today</p>

                <form id="signup-form" class="auth-form">
                    <input type="email" id="email" placeholder="Email" required />
                    <input type="password" id="password" placeholder="Password" required />
                    <button type="submit">Sign Up</button>
                </form>

                <p class="auth-switch">
                    Already have an account?
                    <span id="go-login">Log in</span>
                </p>
            </div>
        </div>
    `;

    document.getElementById("go-login")!
        .addEventListener("click", () => navigate("/login"));

    document.getElementById("signup-form")!
        .addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = (document.getElementById("email") as HTMLInputElement).value;
            const password = (document.getElementById("password") as HTMLInputElement).value;

            try {
                const data = await signup(email, password);
                localStorage.setItem("token", data.access_token);

                showMessage("Account created 🎉", "success");

                navigate("/");
            } catch (err) {
                showMessage("Signup failed", "error");
            }
        });
}

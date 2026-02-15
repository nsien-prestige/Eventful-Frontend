import "./home.css"

export function renderHomePage() {
    const root = document.getElementById("app")!
    const main = document.createElement("main")
    main.className = "home"

    main.innerHTML = `
        <!-- HERO -->
        <section class="hero">
            <div class="hero-bg"></div>
            <div class="hero-content">
                <h1>Find Your Next<br/>Unforgettable Experience</h1>
                <p>Concerts, sports, theatre, and more — all in one place.</p>
            </div>
        </section>

        <!-- WHY US -->
        <section class="why">
            <div class="why-card">
                <h3>No Hidden Fees</h3>
                <p>Transparent pricing. What you see is what you pay.</p>
            </div>

            <div class="why-card">
                <h3>Secure Checkout</h3>
                <p>Protected payments and verified sellers.</p>
            </div>

            <div class="why-card">
                <h3>Instant Delivery</h3>
                <p>Get your tickets immediately after purchase.</p>
            </div>
        </section>

        <footer class="footer">
            <p>© ${new Date().getFullYear()} Eventful. All rights reserved.</p>
        </footer>
    `

    root.appendChild(main)
}

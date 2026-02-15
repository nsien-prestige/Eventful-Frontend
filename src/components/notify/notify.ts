import "./notify.css";

export function showMessage(message: string, type: "success" | "error") {
    const existing = document.querySelector(".notify");
    if (existing) existing.remove();

    const strip = document.createElement("div");
    strip.className = `notify ${type}`;
    strip.textContent = message;

    document.body.appendChild(strip);

    setTimeout(() => {
        strip.classList.add("hide");
        setTimeout(() => strip.remove());
    }, 3000);
}

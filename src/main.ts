import "./styles/global.css";
import { router } from "./router";

document.addEventListener("DOMContentLoaded", () => {
    router();
});

console.log("API BASE:", import.meta.env.VITE_API_URL);

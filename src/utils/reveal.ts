export function setupRevealAnimations() {
    const elements = document.querySelectorAll('.reveal')

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible')
                }
            })
        },
        {
            threshold: 0.1
        }
    )

    elements.forEach(el => observer.observe(el))
}

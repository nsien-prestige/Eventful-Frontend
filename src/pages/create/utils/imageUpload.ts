export function setupImageUpload(): void {
    const uploadArea = document.getElementById("uploadArea")!;
    const imageInput = document.getElementById("imageInput") as HTMLInputElement;
    const imagePreview = document.getElementById("imagePreview") as HTMLImageElement;
    const uploadContent = document.getElementById("uploadContent")!;

    uploadArea.addEventListener("click", () => {
        imageInput.click();
    });

    imageInput.addEventListener("change", () => {
        if (imageInput.files && imageInput.files[0]) {
            readAndPreview(imageInput.files[0]);
        }
    });

    uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.classList.add("dragging");
    });

    uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("dragging");
    });

    uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.classList.remove("dragging");

        const files = e.dataTransfer?.files;
        if (files && files[0]) {
            imageInput.files = files;
            readAndPreview(files[0]);
        }
    });

    function readAndPreview(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target?.result as string;
            imagePreview.classList.remove("hidden");
            uploadContent.classList.add("hidden");
        };
        reader.readAsDataURL(file);
    }
}

export function getImageData(): string {
    const imagePreview = document.getElementById("imagePreview") as HTMLImageElement;
    return imagePreview?.src ?? "";
}

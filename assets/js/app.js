const ANALYZE_API_URL =
    "https://1-3-app-web-patrones.vercel.app/api/analyze";

const GENERATE_API_URL =
    "https://1-3-app-web-patrones.vercel.app/api/generate";


const form =
    document.getElementById("analyzeForm");

const fileInput =
    document.getElementById("imageInput");

const imageUrlInput =
    document.getElementById("imageUrl");

const promptInput =
    document.getElementById("promptInput");

const preview =
    document.getElementById("preview");

const analyzeButton =
    document.getElementById("analyzeButton");

const result =
    document.getElementById("result");

const statusText =
    document.getElementById("statusText");


const analyzeModeButton =
    document.getElementById("analyzeModeButton");

const generateModeButton =
    document.getElementById("generateModeButton");

const generateSection =
    document.getElementById("generateSection");


const generatePrompt =
    document.getElementById("generatePrompt");

const generateButton =
    document.getElementById("generateButton");

const generatedMessage =
    document.getElementById("generatedMessage");

const generatedImage =
    document.getElementById("generatedImage");


const MAX_FILE_SIZE =
    3 * 1024 * 1024;


const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];


let imageData = "";


/* ============================================================
   TEXTO NORMAL
============================================================ */

function showText(message) {
    result.textContent = message;
}


/* ============================================================
   MARKDOWN
============================================================ */

function showMarkdown(markdownText) {

    if (!markdownText) {
        showText(
            "La IA no devolvió contenido."
        );

        return;
    }

    const normalizedMarkdown =
        String(markdownText)
            .replace(/\\\*/g, "*")
            .replace(/\\_/g, "_")
            .replace(/\\#/g, "#")
            .replace(/\\-/g, "-");

    const html =
        marked.parse(
            normalizedMarkdown
        );

    result.innerHTML =
        DOMPurify.sanitize(
            html
        );
}


/* ============================================================
   CAMBIAR DE MODO
============================================================ */

function showAnalyzeMode() {

    analyzeModeButton.classList.add(
        "active"
    );

    generateModeButton.classList.remove(
        "active"
    );

    form.classList.add(
        "active"
    );

    generateSection.classList.remove(
        "active"
    );

    statusText.textContent =
        "● IA disponible";
}


function showGenerateMode() {

    generateModeButton.classList.add(
        "active"
    );

    analyzeModeButton.classList.remove(
        "active"
    );

    generateSection.classList.add(
        "active"
    );

    form.classList.remove(
        "active"
    );

    statusText.textContent =
        "● Generador disponible";
}


analyzeModeButton.addEventListener(
    "click",
    showAnalyzeMode
);


generateModeButton.addEventListener(
    "click",
    showGenerateMode
);


/* ============================================================
   VALIDAR URL
============================================================ */

function isValidImageUrl(value) {

    if (!value) {
        return false;
    }

    try {

        const url =
            new URL(value);

        return (
            url.protocol === "https:" ||
            url.protocol === "http:"
        );

    }
    catch {
        return false;
    }
}


/* ============================================================
   ACTUALIZAR BOTÓN DE ANÁLISIS
============================================================ */

function updateAnalyzeButton() {

    const imageUrl =
        imageUrlInput.value.trim();

    const hasFile =
        Boolean(imageData);

    const hasUrl =
        isValidImageUrl(
            imageUrl
        );

    analyzeButton.disabled =
        !hasFile && !hasUrl;
}


/* ============================================================
   IMAGEN LOCAL
============================================================ */

fileInput.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files[0];

        imageData = "";

        preview.removeAttribute(
            "src"
        );

        analyzeButton.disabled =
            true;

        showText(
            "Selecciona una imagen o pega una URL para comenzar."
        );

        if (!file) {

            updateAnalyzeButton();

            return;
        }

        imageUrlInput.value =
            "";

        if (
            !ALLOWED_TYPES.includes(
                file.type
            )
        ) {

            showText(
                "Formato no permitido. Usa JPG, PNG o WebP."
            );

            fileInput.value =
                "";

            updateAnalyzeButton();

            return;
        }

        if (
            file.size >
            MAX_FILE_SIZE
        ) {

            showText(
                "La imagen debe pesar como máximo 3 MB."
            );

            fileInput.value =
                "";

            updateAnalyzeButton();

            return;
        }

        const reader =
            new FileReader();

        reader.onload =
            () => {

                imageData =
                    reader.result;

                preview.src =
                    imageData;

                showText(
                    "Imagen local lista para analizar."
                );

                updateAnalyzeButton();
            };

        reader.onerror =
            () => {

                imageData =
                    "";

                preview.removeAttribute(
                    "src"
                );

                showText(
                    "No fue posible leer la imagen seleccionada."
                );

                updateAnalyzeButton();
            };

        reader.readAsDataURL(
            file
        );
    }
);


/* ============================================================
   IMAGEN POR URL
============================================================ */

imageUrlInput.addEventListener(
    "input",
    () => {

        const imageUrl =
            imageUrlInput.value.trim();

        if (imageUrl) {

            fileInput.value =
                "";

            imageData =
                "";
        }

        if (!imageUrl) {

            preview.removeAttribute(
                "src"
            );

            showText(
                "Selecciona una imagen o pega una URL para comenzar."
            );

            updateAnalyzeButton();

            return;
        }

        if (
            !isValidImageUrl(
                imageUrl
            )
        ) {

            preview.removeAttribute(
                "src"
            );

            showText(
                "La URL debe comenzar con http:// o https://"
            );

            updateAnalyzeButton();

            return;
        }

        preview.src =
            imageUrl;

        showText(
            "URL lista para analizar."
        );

        analyzeButton.disabled =
            false;
    }
);


/* ============================================================
   ERROR EN VISTA PREVIA
============================================================ */

preview.addEventListener(
    "error",
    () => {

        if (
            imageUrlInput.value.trim()
        ) {

            preview.removeAttribute(
                "src"
            );

            showText(
                "No fue posible mostrar la vista previa. Puedes intentar analizar la URL de todos modos."
            );

            analyzeButton.disabled =
                false;
        }
    }
);


/* ============================================================
   ANALIZAR IMAGEN
============================================================ */

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const imageUrl =
            imageUrlInput.value.trim();

        const usingLocalImage =
            Boolean(imageData);

        const usingImageUrl =
            isValidImageUrl(
                imageUrl
            );

        if (
            !usingLocalImage &&
            !usingImageUrl
        ) {

            showText(
                "Selecciona una imagen o proporciona una URL válida."
            );

            return;
        }

        analyzeButton.disabled =
            true;

        statusText.textContent =
            "● Analizando...";

        showText(
            "La IA está analizando los patrones visuales..."
        );

        try {

            const response =
                await fetch(
                    ANALYZE_API_URL,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                image_data:
                                    usingLocalImage
                                        ? imageData
                                        : "",

                                image_url:
                                    usingImageUrl
                                        ? imageUrl
                                        : "",

                                prompt:
                                    promptInput.value.trim()
                            })
                    }
                );

            let data;

            try {

                data =
                    await response.json();

            }
            catch {

                throw new Error(
                    "El servidor devolvió una respuesta no válida."
                );
            }

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Error del servidor"
                );
            }

            showMarkdown(
                data.analysis
            );

            statusText.textContent =
                "● Análisis terminado";
        }
        catch (error) {

            console.error(
                "Error al analizar imagen:",
                error
            );

            showText(
                "Error: " +
                error.message
            );

            statusText.textContent =
                "● Error";
        }
        finally {

            updateAnalyzeButton();
        }
    }
);


/* ============================================================
   GENERAR IMAGEN
============================================================ */

generateButton.addEventListener(
    "click",
    async () => {

        const prompt =
            generatePrompt.value.trim();

        if (!prompt) {

            generatedMessage.textContent =
                "Escribe una descripción antes de generar la imagen.";

            generatedImage.removeAttribute(
                "src"
            );

            return;
        }

        generateButton.disabled =
            true;

        generatedImage.removeAttribute(
            "src"
        );

        generatedMessage.textContent =
            "La IA está generando tu imagen...";

        statusText.textContent =
            "● Generando imagen...";

        try {

            const response =
                await fetch(
                    GENERATE_API_URL,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                prompt:
                                    prompt
                            })
                    }
                );

            let data;

            try {

                data =
                    await response.json();

            }
            catch {

                throw new Error(
                    "El servidor devolvió una respuesta no válida."
                );
            }

            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "No fue posible generar la imagen."
                );
            }

            if (!data.image) {

                throw new Error(
                    "El servidor no devolvió una imagen."
                );
            }

            generatedImage.src =
                data.image;

            generatedMessage.textContent =
                "";

            statusText.textContent =
                "● Imagen generada";
        }
        catch (error) {

            console.error(
                "Error al generar imagen:",
                error
            );

            generatedImage.removeAttribute(
                "src"
            );

            generatedMessage.textContent =
                "Error: " +
                error.message;

            statusText.textContent =
                "● Error";
        }
        finally {

            generateButton.disabled =
                false;
        }
    }
);
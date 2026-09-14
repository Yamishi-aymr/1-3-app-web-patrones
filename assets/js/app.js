const API_URL =
    "https://1-3-app-web-patrones.vercel.app/api/analyze";


const form = document.getElementById("analyzeForm");

const fileInput = document.getElementById("imageInput");

const imageUrlInput = document.getElementById("imageUrl");

const promptInput = document.getElementById("promptInput");

const preview = document.getElementById("preview");

const analyzeButton = document.getElementById("analyzeButton");

const result = document.getElementById("result");

const statusText = document.getElementById("statusText");


const MAX_FILE_SIZE = 3 * 1024 * 1024;


const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];


let imageData = "";


/*
============================================================
VALIDAR URL
============================================================
*/

function isValidImageUrl(value) {

    if (!value) {
        return false;
    }

    try {

        const url = new URL(value);

        return (
            url.protocol === "https:" ||
            url.protocol === "http:"
        );

    }
    catch {

        return false;

    }

}


/*
============================================================
ACTUALIZAR ESTADO DEL BOTÓN
============================================================
*/

function updateAnalyzeButton() {

    const imageUrl =
        imageUrlInput.value.trim();

    const hasFile =
        Boolean(imageData);

    const hasUrl =
        isValidImageUrl(imageUrl);

    analyzeButton.disabled =
        !hasFile && !hasUrl;

}


/*
============================================================
SELECCIONAR IMAGEN LOCAL
============================================================
*/

fileInput.addEventListener("change", () => {

    const file =
        fileInput.files[0];


    imageData = "";

    preview.removeAttribute("src");

    analyzeButton.disabled = true;

    result.textContent =
        "Selecciona una imagen o pega una URL para comenzar.";


    if (!file) {

        updateAnalyzeButton();

        return;

    }


    /*
    Si el usuario selecciona un archivo,
    eliminamos la URL para evitar dos fuentes
    de imagen al mismo tiempo.
    */

    imageUrlInput.value = "";


    if (!ALLOWED_TYPES.includes(file.type)) {

        result.textContent =
            "Formato no permitido. Usa JPG, PNG o WebP.";

        fileInput.value = "";

        updateAnalyzeButton();

        return;

    }


    if (file.size > MAX_FILE_SIZE) {

        result.textContent =
            "La imagen debe pesar como máximo 3 MB.";

        fileInput.value = "";

        updateAnalyzeButton();

        return;

    }


    const reader =
        new FileReader();


    reader.onload = () => {

        imageData =
            reader.result;

        preview.src =
            imageData;

        result.textContent =
            "Imagen local lista para analizar.";

        updateAnalyzeButton();

    };


    reader.onerror = () => {

        imageData = "";

        preview.removeAttribute("src");

        result.textContent =
            "No fue posible leer la imagen seleccionada.";

        updateAnalyzeButton();

    };


    reader.readAsDataURL(file);

});


/*
============================================================
INGRESAR IMAGEN POR URL
============================================================
*/
imageUrlInput.addEventListener("input", () => {

    const imageUrl = imageUrlInput.value.trim();

    if (imageUrl) {
        fileInput.value = "";
        imageData = "";
    }

    if (!imageUrl) {
        preview.removeAttribute("src");

        result.textContent =
            "Selecciona una imagen o pega una URL para comenzar.";

        updateAnalyzeButton();

        return;
    }

    if (!isValidImageUrl(imageUrl)) {
        preview.removeAttribute("src");

        result.textContent =
            "La URL debe comenzar con http:// o https://";

        updateAnalyzeButton();

        return;
    }

    // Intentamos mostrar la vista previa
    preview.src = imageUrl;

    // Pero el botón queda habilitado aunque la imagen no se renderice
    result.textContent =
        "URL lista para analizar.";

    analyzeButton.disabled = false;
});


/*
============================================================
ERROR DE VISTA PREVIA
============================================================
*/

preview.addEventListener("error", () => {

    /*
    No bloqueamos el análisis solamente porque
    el navegador no pueda mostrar la vista previa.

    Algunos servidores impiden mostrar sus imágenes
    directamente en otras páginas.
    */

    if (imageUrlInput.value.trim()) {

        result.textContent =
            "No fue posible mostrar la vista previa. Puedes intentar analizar la URL de todos modos.";

    }

});


/*
============================================================
ENVIAR IMAGEN AL BACKEND
============================================================
*/

form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const imageUrl =
        imageUrlInput.value.trim();


    const usingLocalImage =
        Boolean(imageData);


    const usingImageUrl =
        isValidImageUrl(imageUrl);


    if (
        !usingLocalImage &&
        !usingImageUrl
    ) {

        result.textContent =
            "Selecciona una imagen o proporciona una URL válida.";

        return;

    }


    analyzeButton.disabled = true;

    statusText.textContent =
        "● Analizando...";

    result.textContent =
        "La IA está analizando los patrones visuales...";


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

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


        result.textContent =
            data.analysis;

        statusText.textContent =
            "● Análisis terminado";

    }
    catch (error) {

        console.error(
            "Error al analizar imagen:",
            error
        );


        result.textContent =
            "Error: " +
            error.message;


        statusText.textContent =
            "● Error";

    }
    finally {

        updateAnalyzeButton();

    }

});
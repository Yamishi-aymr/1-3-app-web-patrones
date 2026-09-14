const API_URL =
    "https://1-3-app-web-patrones.vercel.app/api/analyze";


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


const MAX_FILE_SIZE =
    3 * 1024 * 1024;


const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];


let imageData = "";


/*
============================================================
MOSTRAR TEXTO NORMAL
============================================================
*/

function showText(message) {

    result.textContent =
        message;

}


/*
============================================================
MOSTRAR RESPUESTA MARKDOWN
============================================================
*/

function showMarkdown(markdownText) {

    const html =
        marked.parse(
            markdownText
        );


    result.innerHTML =
        DOMPurify.sanitize(
            html
        );

}


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


/*
============================================================
ACTUALIZAR BOTÓN
============================================================
*/

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


/*
============================================================
IMAGEN LOCAL
============================================================
*/

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


        /*
        Si seleccionamos un archivo,
        eliminamos cualquier URL anterior.
        */

        imageUrlInput.value =
            "";


        /*
        Validar formato
        */

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


        /*
        Validar tamaño
        */

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


/*
============================================================
IMAGEN POR URL
============================================================
*/

imageUrlInput.addEventListener(
    "input",
    () => {

        const imageUrl =
            imageUrlInput.value.trim();


        /*
        Si comienza a introducir una URL,
        eliminamos el archivo seleccionado.
        */

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


        /*
        Intentar mostrar vista previa.
        */

        preview.src =
            imageUrl;


        showText(
            "URL lista para analizar."
        );


        /*
        Aunque la vista previa no pueda mostrarse,
        dejamos habilitado el botón.
        */

        analyzeButton.disabled =
            false;

    }
);


/*
============================================================
ERROR EN VISTA PREVIA
============================================================
*/

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


/*
============================================================
ENVIAR AL BACKEND
============================================================
*/

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
                    API_URL,
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


            if (
                !response.ok
            ) {

                throw new Error(
                    data.error ||
                    "Error del servidor"
                );

            }


            /*
            ====================================================
            AQUÍ RENDERIZAMOS EL MARKDOWN
            ====================================================
            */

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
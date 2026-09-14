import json
import os

from http.server import BaseHTTPRequestHandler

from openai import OpenAI


ALLOWED_ORIGIN = os.environ.get(
    "ALLOWED_ORIGIN",
    ""
).rstrip("/")


MAX_REQUEST_BYTES = 20_000


class handler(BaseHTTPRequestHandler):

    def add_cors_headers(self):

        origin = self.headers.get(
            "Origin",
            ""
        )

        if (
            ALLOWED_ORIGIN
            and origin == ALLOWED_ORIGIN
        ):

            self.send_header(
                "Access-Control-Allow-Origin",
                origin
            )

            self.send_header(
                "Vary",
                "Origin"
            )


    def send_json(
        self,
        status_code,
        data
    ):

        body = json.dumps(
            data,
            ensure_ascii=False
        ).encode(
            "utf-8"
        )

        self.send_response(
            status_code
        )

        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8"
        )

        self.add_cors_headers()

        self.send_header(
            "Content-Length",
            str(
                len(body)
            )
        )

        self.end_headers()

        self.wfile.write(
            body
        )


    def do_OPTIONS(self):

        origin = self.headers.get(
            "Origin",
            ""
        )

        if (
            ALLOWED_ORIGIN
            and origin != ALLOWED_ORIGIN
        ):

            self.send_response(
                403
            )

            self.end_headers()

            return

        self.send_response(
            204
        )

        self.add_cors_headers()

        self.send_header(
            "Access-Control-Allow-Methods",
            "POST, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

        self.send_header(
            "Access-Control-Max-Age",
            "86400"
        )

        self.end_headers()


    def do_GET(self):

        self.send_json(
            405,
            {
                "error":
                    "Este endpoint solamente acepta POST."
            }
        )


    def do_POST(self):

        try:

            origin = self.headers.get(
                "Origin",
                ""
            )

            if (
                ALLOWED_ORIGIN
                and origin != ALLOWED_ORIGIN
            ):

                self.send_json(
                    403,
                    {
                        "error":
                            "Origen no autorizado."
                    }
                )

                return


            content_length = int(
                self.headers.get(
                    "Content-Length",
                    0
                )
            )


            if (
                content_length <= 0
                or content_length > MAX_REQUEST_BYTES
            ):

                self.send_json(
                    413,
                    {
                        "error":
                            "La petición es demasiado grande."
                    }
                )

                return


            body = self.rfile.read(
                content_length
            )


            data = json.loads(
                body.decode(
                    "utf-8"
                )
            )


            prompt = str(
                data.get(
                    "prompt",
                    ""
                )
            ).strip()


            if not prompt:

                self.send_json(
                    400,
                    {
                        "error":
                            "Debes escribir una descripción para generar la imagen."
                    }
                )

                return


            if len(prompt) > 1000:

                self.send_json(
                    400,
                    {
                        "error":
                            "La descripción no puede superar los 1000 caracteres."
                    }
                )

                return


            api_key = os.environ.get(
                "OPENAI_API_KEY"
            )


            if not api_key:

                self.send_json(
                    500,
                    {
                        "error":
                            "OPENAI_API_KEY no está configurada."
                    }
                )

                return


            client = OpenAI(
                api_key=api_key
            )


            response = client.images.generate(
                model="gpt-image-1",
                prompt=prompt,
                size="1024x1024",
                quality="medium"
            )


            image_base64 = (
                response.data[0].b64_json
            )


            if not image_base64:

                self.send_json(
                    500,
                    {
                        "error":
                            "La API no devolvió una imagen."
                    }
                )

                return


            self.send_json(
                200,
                {
                    "image":
                        f"data:image/png;base64,{image_base64}"
                }
            )


        except json.JSONDecodeError:

            self.send_json(
                400,
                {
                    "error":
                        "El cuerpo no contiene JSON válido."
                }
            )


        except Exception as error:

            print(
                f"Error en /api/generate: "
                f"{type(error).__name__}: "
                f"{error}"
            )

            self.send_json(
                500,
                {
                    "error":
                        "No fue posible generar la imagen."
                }
            )

# 1.3 App Web para Identificación de Patrones con IA

**Tecnológico Nacional De México - Campus Pachuca**

**Inteligencia artificial aplicada a las TIC**

**Docente:** M.C. Víctor Manuel Pinedo Fernández

**Alumna:** Alicia Yamileth Mariano Reséndiz

---

Aplicación web desarrollada para analizar imágenes mediante Inteligencia Artificial, identificar patrones visuales, objetos y realizar estimaciones de cantidad. Además, incluye una función adicional para generar imágenes a partir de una descripción escrita por el usuario.

## Descripción

Este proyecto permite trabajar con imágenes de dos formas:

- Subiendo una imagen desde el dispositivo.
- Proporcionando una URL pública de una imagen.

La aplicación envía la imagen a un backend desplegado en Vercel, donde se procesa utilizando la API de OpenAI.

El sistema puede realizar tareas como:

- Identificación de objetos.
- Descripción general de una imagen.
- Conteo estimado de personas u objetos.
- Identificación de patrones visuales.
- Evaluación del nivel de certeza del análisis.
- Generación de imágenes mediante una descripción en lenguaje natural.

La aplicación cuenta con dos modos principales:

- **Analizar imagen**
- **Generar imagen**

---

## Funcionalidades

### Análisis de imágenes

El usuario puede cargar una imagen en formato:

- JPG
- PNG
- WebP

También puede utilizar una URL pública de una imagen.

El sistema permite escribir una instrucción personalizada para indicar qué se desea identificar.

Ejemplo:

```text
¿Cuántas personas aparecen en la imagen?
```

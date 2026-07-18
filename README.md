# Gestor de Gastos Mensuales

Aplicación web ligera para registrar y revisar gastos mensuales, con un asistente de IA opcional para recibir consejos de ahorro.

## Características

- **Añadir gastos:** formulario para registrar descripción, categoría, cantidad y fecha.
- **Categorías predefinidas:** Comida, Transporte, Vivienda, Salud, Ocio, Educación y Otros (configurables en el código).
- **Listado de movimientos:** vista de los gastos añadidos con opción de eliminar cada registro.
- **Filtros:** filtrar por fecha y por categoría.
- **Resumen del mes:** total gastado y desglose por categorías.
- **Borrar datos:** botón para eliminar todos los datos almacenados localmente.
- **Asistente de IA:** pide un análisis y consejos breves mediante la API de OpenAI (requiere introducir una clave API en la interfaz).
- **Almacenamiento local:** todos los gastos se guardan en `localStorage`, sin backend.
- **Responsive:** diseño adaptable para móvil y escritorio.

## Uso

1. Abrir el archivo [app/index.html](app/index.html) en un navegador moderno.
2. Rellenar el formulario de "Nuevo Gasto" y pulsar "Agregar gasto".
3. Usar los filtros para ver movimientos concretos o el resumen por categorías.
4. Para usar el asistente de IA, pega tu clave OpenAI en el campo "Clave API de OpenAI" y pulsa "Pedir consejo". La app envía un prompt con el resumen mensual y muestra la respuesta.

Nota: la funcionalidad de IA realiza peticiones directamente desde el navegador a la API de OpenAI; ten cuidado con la seguridad de tu clave y considera usar un proxy/servidor para producción.

## Archivos principales

- [app/index.html](app/index.html)
- [app/app.js](app/app.js)
- [app/styles.css](app/styles.css)

## Tecnologías

- HTML, CSS, JavaScript (vanilla)

## Desarrollo

- No hay dependencias. Para probar localmente basta con abrir `app/index.html` o servir la carpeta con un servidor estático (por ejemplo `npx serve` o `python -m http.server`).

## Contribuciones

Si deseas mejorar la aplicación: crea un fork, añade cambios y envía un pull request. Para mejorar la seguridad del asistente de IA, considera añadir un backend que gestione las llamadas a la API.
# ScienceMath

Calculadora de física en español. Selecciona un tema y una fórmula, captura los datos en las unidades indicadas y pulsa **Calcular**. Los decimales admiten punto o coma.

## Probar en local

Desde la raíz, ejecuta `python3 -m http.server 8080` y abre `http://localhost:8080/`. Usa un servidor local para probar la instalación y el funcionamiento sin conexión.

## Publicar en GitHub Pages

Sube el código a `main`. En **Settings → Pages → Build and deployment**, selecciona **Deploy from a branch**, luego **main** y **/ (root)**. Las rutas relativas permiten publicarlo en `https://karols234.github.io/ScienceMath/`. Conserva la configuración local de Git para subir desde la cuenta autorizada.

## Instalación y actualizaciones

Abre el enlace publicado. Usa **Instalar app** o la opción de instalación del navegador; en iPhone, abre el enlace en Safari y elige **Compartir → Agregar a inicio**. Tras completar la primera carga, la app puede volver a abrirse sin internet.

Al cambiar los archivos que entrega la PWA, actualiza la versión de caché en `sw.js` y agrega cualquier recurso nuevo a la lista. Cuando se descargue la actualización, vuelve a cargar la página para abrir la versión nueva.

## Implementación y fórmulas

HTML, CSS y JavaScript nativo, con Web App Manifest y Service Worker. No requiere compilación, servidor de aplicación ni dependencias externas. El catálogo vive en `formulas.mjs`; las fotos de `Formulas/` se conservaron como referencia.

- La gravedad se captura como magnitud positiva (9.81 m/s² por defecto). En movimiento vertical se resta cuando el eje positivo apunta hacia arriba.
- En tiro parabólico se ignora la resistencia del aire. El alcance y el tiempo total de vuelo suponen la misma altura de salida y llegada.
- El desplazamiento con velocidad angular media incluye el factor tiempo: θ = (ωf + ω₀)t/2.
- En colisiones, las componentes indicadas con seno para X y coseno para Y toman el ángulo desde el eje vertical positivo.
- La dirección de la resultante usa atan2 para respetar el cuadrante. El análisis dimensional se presenta como consulta de dimensiones y unidades.

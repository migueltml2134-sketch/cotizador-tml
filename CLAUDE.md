# CLAUDE.md — cotizador-tml

Contexto para Claude Code (y para cualquier colaborador) al trabajar en este repositorio. Léelo antes de modificar archivos.

## Qué es este proyecto

**Cotizador Mudanzas TML**: sitio estático (HTML + JavaScript embebido, sin framework, sin build, sin `npm install`) publicado con **GitHub Pages** desde la rama `main`.

- Dueño del repo: **Miguel** (`migueltml2134-sketch`). Hay colaboradores con permiso de push — el trabajo de cada quien va en su propia rama.
- Backend: **Google Apps Script** (una sola URL `.../exec`, constante `API_URL`). El front llama `api(fn, ...args)` con un `POST` de texto plano `{fn, args}`. El código del Apps Script **no vive en este repo**; si un cambio requiere una función nueva del lado del servidor, hay que coordinarlo con Miguel.
- Mapas: Leaflet 1.9.4 desde unpkg.

## Estructura de archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | **Panel interno** (con login). Cotizador completo: direcciones y mapa, ruta y casetas, unidad/volumen, cálculo de precio con modo de IVA (IVA 16%, IVA con retención 4%, sin IVA), precio manual, PDF, envío por WhatsApp, lista de leads, inventario por texto/capturas. Sesión con token en `localStorage` (`tml_cot_token`). |
| `cotiza.html` | **Portal público para clientes** ("Cotiza tu mudanza"). Usa solo funciones públicas del Apps Script (`pubSesion`, `pubGeocode`, `pubRuta`, `pubLeer`, `pubCotizar`, `pubPdf`). |
| `inventario.js` | Catálogo de muebles con m³ por pieza + lectura de texto por reglas (sin IA de pago). Lo cargan **ambas** páginas — un bug aquí afecta panel y portal. |
| `version.txt` | Número de versión de lo publicado (ver abajo). |
| `.nojekyll` | Archivo vacío que le dice a GitHub Pages que no procese el sitio con Jekyll. No borrar. |

## Cómo funciona `version.txt` (rompe-caché)

El valor es una marca de tiempo `AAAAMMDDhhmmss` (ej. `20261027152335`). Debe coincidir en **4 lugares**:

1. `version.txt`
2. `index.html` → `var V='...'` en el script de auto-actualización
3. `cotiza.html` → `var V='...'` en el mismo script
4. `?v=...` en el `<script src="inventario.js?v=...">` de **ambos** HTML

Al abrir la página, el script descarga `version.txt` sin caché; si el valor es distinto al `V` incrustado en el HTML, recarga con `?v=<nuevo>` para forzar que el navegador baje la versión nueva. Si se olvida actualizar alguno de los 4 lugares, los usuarios pueden quedarse con una versión vieja (o, si `V` no coincide con `version.txt`, la página recarga una vez de más sin necesidad).

Para generar el valor nuevo: `date +%Y%m%d%H%M%S`.

## Cómo probar localmente

No hay build. Desde la raíz del repo:

```bash
python3 -m http.server 8000
```

y abrir `http://localhost:8000/` (panel) y `http://localhost:8000/cotiza.html` (portal). Abrir con `file://` no sirve bien porque el `fetch('version.txt')` falla.

Ojo: las páginas hablan con el **Apps Script real de producción** — una cotización, lead o PDF generado en local queda registrado de verdad. Probar con datos claramente de prueba.

## Reglas de colaboración

1. **Nada directo a `main`.** `main` es lo que publica GitHub Pages: todo push a `main` es producción.
2. Cada cambio va en una **rama propia** creada desde el `main` más reciente (ej. `e/descripcion-corta`), y entra a `main` por **Pull Request** que revisa/aprueba Miguel.
3. Antes de empezar y antes de abrir el PR, traer lo último de `main` para no pisar el trabajo de Miguel. Si hay conflictos, resolverlos en la rama, nunca con `push --force` sobre ramas ajenas.
4. **Al publicar** (cuando el PR cambia algo visible de la app), actualizar la versión en los 4 lugares descritos arriba, en el mismo PR. Si dos PRs abiertos tocan la versión, el que se fusiona al último genera una marca nueva.
5. Cambios pequeños y enfocados: un PR por tema, con descripción en español de qué cambió y cómo probarlo.
6. No cambiar `API_URL` ni los nombres de funciones del Apps Script sin acordarlo con Miguel.

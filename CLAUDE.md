# CLAUDE.md — cotizador-tml (páginas publicadas)

Contexto para Claude Code y para cualquier colaborador. Léelo antes de modificar archivos.

## Importante: este repo es solo lo publicado

**El código fuente NO está aquí.** Vive en el repo privado **`migueltml2134-sketch/cotizador-tml-codigo`**:

- `web/index.html`, `web/cotiza.html` y `web/inventario.js` son las páginas fuente.
- `Codigo.gs` es el servidor (Google Apps Script).
- `armar.py` arma este repo.

Este repo (`cotizador-tml`) es la carpeta `publicar/` que genera `armar.py`, y GitHub Pages lo sirve tal cual.

- **No edites las páginas aquí.** La próxima vez que alguien corra `armar.py`, el cambio se pierde. Cualquier cambio a la app va en `cotizador-tml-codigo`, en una rama con su Pull Request.
- `armar.py` pone la URL del Apps Script y la versión (`version.txt`, `var V='...'` y `inventario.js?v=...`) automáticamente. No hay que actualizarlas a mano.

## Direcciones

- **Panel interno:** https://cotizador.mudanzastml.mx/ (entra con usuario de mudanzastml.mx o con la contraseña única).
- **Portal de clientes:** https://cotizador.mudanzastml.mx/cotiza.html
- El dominio es un registro CNAME `cotizador` → `migueltml2134-sketch.github.io` en IONOS. Las direcciones viejas de github.io redirigen solas.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Panel interno: cotizador completo, leads, PDF, WhatsApp. Login con Firebase Auth (cuentas de mudanzastml.mx, permiso "Cotizador" o admin) o con la contraseña única. |
| `cotiza.html` | Portal público para clientes (sin login). |
| `inventario.js` | Catálogo de muebles con m³ por pieza. Lo usan las dos páginas. |
| `version.txt` | Versión publicada. Si cambia, las páginas se recargan solas para no quedarse con la versión vieja guardada en el navegador. |
| `CNAME` | Dominio propio de GitHub Pages. **No borrar**: sin él, la página deja de abrir en cotizador.mudanzastml.mx. |
| `.nojekyll` | Le dice a GitHub Pages que no procese el sitio con Jekyll. No borrar. |
| `CLAUDE.md` | Este archivo. `armar.py` no lo toca. |

## Cómo publicar

En `cotizador-tml-codigo`, con los cambios ya aceptados en `main`:
1. Corre `python armar.py`.
2. Entra a `publicar/` (es un clon de este repo), haz `git pull`, luego commit y push.

## Reglas de colaboración

1. Dueño: **Miguel** (`migueltml2134-sketch`). Nada directo a `main` sin su visto bueno. Los cambios entran por Pull Request en `cotizador-tml-codigo`.
2. Antes de empezar, traer lo último de `main` para no pisar el trabajo de otros. Nunca `push --force` sobre ramas ajenas.
3. No cambiar `API_URL`, `url_api.txt` ni las funciones del Apps Script sin acordarlo con Miguel.
4. Las páginas hablan con el Apps Script **real**: lo que se cotice en pruebas queda registrado. Usar datos claramente de prueba.

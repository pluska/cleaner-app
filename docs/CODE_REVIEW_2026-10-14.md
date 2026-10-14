# Revisión del código y funcionalidades — 14 de octubre de 2026

## Alcance y estado inicial

Revisión de rutas de autenticación y recuperación, tareas y recurrencias, onboarding, perfiles, habitaciones, inventario, recompensas, estadísticas, calendario, reino/PixiJS, chat/IA, componentes de interfaz, service worker, migraciones, configuración de Cloudflare, dependencias y CI. Se contrastó el código con pruebas unitarias, integración SQLite, navegador con D1 local y construcción de OpenNext.

La rama `new-version` contenía una migración amplia sin commit al comenzar. Se conservaron esos cambios y la retirada del índice de las bases SQLite locales. Los cambios de esta revisión se integran sobre ese estado; no se reescribió el historial ni se modificaron recursos de producción.

Estado inicial: TypeScript y lint sin errores; 169 pruebas aprobadas. Esto no detectaba los flujos ficticios o incompletos de las pantallas principales.

## Problemas corregidos

| Prioridad | Problema observado | Corrección y evidencia |
| --- | --- | --- |
| Alta | El endpoint diario se ejecutaba sin autenticación si faltaba `CRON_SECRET`. | Respuesta 503 sin configuración y 401 con autorización incorrecta. Pruebas con SQLite. |
| Alta | Cron Trigger configurado sin manejador `scheduled` en el Worker generado. | Entrada `worker.mjs` conserva HTTP de OpenNext y conecta el trabajo programado al endpoint protegido; promesa ligada a `waitUntil`. |
| Alta | Worker de next-pwa conservaba cachés de páginas/API entre sesiones. | `public/sw.js` retira el worker instalado, elimina cachés heredadas y se desregistra; no maneja fetch. Regresión de privacidad. |
| Alta | Añadir tarea solo navegaba al dashboard. | Formulario obtiene habitaciones propias, guarda por API y permite fecha/frecuencia; mantiene errores visibles y evita envíos simultáneos. E2E real. |
| Alta | Onboarding escribía cadenas/booleanos en columnas incompatibles y ocultaba errores. | Validación del assessment, conversión explícita, comprobación de respuestas y reintento visible. E2E y SQLite. |
| Alta | Generación sugerida modificaba JSON compartido entre solicitudes, duplicaba tareas al reintentar y omitía pasos. | Datos inmutables, IDs estables, lote atómico por misión, subtareas ordenadas y respuesta con misiones reales. Regresiones concurrentes. |
| Alta | Dos compras con IDs distintos podían cobrar dos veces el mismo desbloqueo. | Inserción condicionada por usuario/recompensa en la misma sentencia; comprobación del ID de reintento y bloqueo de compras simultáneas en UI. Regresión concurrente. |
| Media | Calendario con estrellas fijas y días sin navegación útil. | Consulta mensual autenticada de recurrencias e instancias; cada día abre la agenda de su fecha. E2E. |
| Media | Monedas/nivel y estadísticas incluían números fijos; `weeklyActivity` no recibía las nuevas recompensas. | Dashboard consulta el perfil; estadísticas derivadas de `rewardEvents`, zona horaria y semana seleccionada. Horas identificadas como estimadas. SQLite y E2E. |
| Media | UTC cambiaba el día elegido en el navegador; los detalles carecían de duración de pasos. | Fechas de calendario locales, recurrencias evaluadas en la zona del usuario y subtareas con duración/orden/estado. |
| Media | Listado efectuaba una consulta por tarea y usaba IN con más de 100 bindings. | Cuatro consultas mediante joins; una evaluación de recurrencia por tarea/rango. Regresión con 110 tareas. |
| Media | Completar podía aplicar un resultado tardío a otro día o deshacer visualmente una tarea completada. | Guardas de concurrencia/fecha, actualización tras confirmación y refresco del saldo; finalización sin undo. |
| Media | Las redirecciones protegidas usaban el origen de `AUTH_URL`, fallando en previews/otros puertos. | Middleware conserva la navegación en el host de la solicitud. Onboarding protegido. Regresión y E2E anónima. |
| Media | Guardar nombre no refrescaba el JWT; signup fallido dejaba el formulario bloqueado. | JWT vuelve a leer el nombre del servidor en update; éxito solo tras autenticar. E2E de nombre. |
| Media | Validación de contraseña en UI difería de la del servidor. | Registro y reset exigen 8–72 bytes, mayúscula, minúscula y número. |
| Media | Perfil/habitaciones podían colisionar en concurrencia y crear saldos iniciales distintos. | Inserciones idempotentes y saldo inicial consistente de cero para perfiles nuevos; saldos existentes conservados. |
| Media | Helpers heredados de edificios permitían acceso por ID sin comprobar sesión/propietario. | Acceso solo de servidor, sesión, filtro del propietario y validación de posición; regresión entre usuarios. No eran rutas públicas activas. |
| Media | Escenario móvil tapaba el título; controles pequeños y diálogo sin gestión de teclado. | Área útil y encuadre móvil, controles de 44 px, foco/Escape/Tab y movimiento alternativo con botones. Capturas/E2E. |
| Media | Librería cliente editaba con PUT pero la ruta implementaba PATCH; no permitía borrar descripción. | Contrato PATCH y descripción vacía normalizada a null. Regresión. |
| Baja | Prioridad se infería del prefijo arbitrario del ID, botón de modo oscuro no funcionaba y zoom del navegador estaba bloqueado. | Prioridad basada en dificultad; retirada del botón inoperante; zoom habilitado. |
| Baja | Lenguaje HTML quedaba en inglés y calendario no traducía días/meses. | Idioma validado y atributo lang sincronizado; calendarios localizados y controles semánticos. |
| Baja | Tienda ocultaba errores y podía duplicar el catálogo inicial; endpoints aceptaban cuerpos sin límite. | Errores/carga visibles, IDs estables para catálogo, cuerpos acotados y validación en perfiles, herramientas y reino. |
| Baja | E2E y build compartían `.next`, pudiendo corromper sus artefactos. | E2E usa `.next-e2e`, ignorado por Git y excluido de TypeScript. CI incluye navegador y evidencia de fallos. |

## Verificación

Los resultados finales se registran al cerrar las comprobaciones. Las pruebas de navegador usan cuentas sintéticas en D1 local y no simulan autenticación ni las operaciones de negocio. Cubren escritorio 1440×900 y móvil emulado 390×844.

Los escenarios cubren registro por UI, seis pasos del onboarding, persistencia de habitaciones/assessment, nombre del héroe, creación manual, completar tarea, recarga, calendario, estadísticas y tienda; además misión/recompensa/mejora, descanso, diálogo por teclado, movimiento de edificio y persistencia del reino. Las pruebas SQLite verifican aislamiento, cuotas, concurrencia, rollback, recuperación y revocación.

## Límites y pendientes de operación/producto

- La suite local no certifica staging o producción, correo real, llamadas pagadas de OpenAI, recuperación de backups ni FPS en móviles físicos. Se mantiene [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).
- Auditoría de producción: cero vulnerabilidades reportadas por npm. Auditoría completa: cinco entradas altas que corresponden a una dependencia de lint (`braces`), ya descrita en [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md); no hay una corrección compatible publicada en el grafo instalado. No se aplicó el downgrade mayor sugerido por npm.
- La exposición histórica de un hash en Git sigue requiriendo revisión privada/rotación por el propietario, según [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md). Eliminar las bases del índice no elimina copias ni historial.
- `CRON_SECRET`, credenciales de IA/correo y origen canónico deben configurarse en cada entorno. El proceso diario materializa hasta 15 cursores por invocación; para vaciar backlog se repite el endpoint autenticado. Las lecturas de recurrencias siguen funcionando sin depender del cron. Es necesario dimensionar la frecuencia/plan antes de escalar.
- La narrativa del reino permanece principalmente en español; Entrada comparte arte con Torre. Diferenciación de sprites/capítulos y métricas físicas son trabajo de producto, no resultados validados por estas pruebas.
- Los scripts manuales históricos y SQL de `database/` corresponden a versiones anteriores. Las verificaciones vigentes son npm test, Playwright, migraciones `drizzle/` y el smoke local. No ejecutar SQL heredado contra D1/producción.
- No se añadieron editor completo de series, temporizador real, persistencia independiente de checks de subtareas ni modo oscuro: esas funcionalidades no existían en la versión revisada. El diálogo presenta pasos de la misión y la finalización se guarda por tarea.

## Referencias de runtime

- [Límites de D1](https://developers.cloudflare.com/d1/platform/limits/): 100 parámetros por sentencia y consultas por invocación; motivan joins y lotes acotados.
- [Next.js en Cloudflare/OpenNext](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/): comprobación del artefacto Worker, además del build de Next.js.
- [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/): requieren un manejador scheduled, además de la configuración del trigger.

## Resultado final ejecutado

- `npm run typecheck`: aprobado.
- `npm run lint`: aprobado, sin errores ni advertencias.
- `npm test`: **188/188 pruebas**, 32 archivos.
- `npm run test:e2e`: **6/6 escenarios**, escritorio y móvil.
- `npm run pages:build`: aprobado; incluye build de producción de Next.js y artefacto OpenNext.
- `wrangler deploy --dry-run`: aprobado, entrada personalizada y bindings empaquetados; no publica.
- Migraciones en D1 local/estado de revisión: aplicadas, sin migraciones pendientes.
- `scripts/security-smoke.mjs` contra Worker local aislado: aprobado; autenticación, chat bilingüe/fallback, seguridad determinista, validación, rescheduling, idempotencia de recompensas, reset concurrente y revocación inmediata de sesión.
- Evento `scheduled` real en Wrangler local: aprobado; registro `daily_job_completed`, 7 cursores procesados y 2 rachas UTC abandonadas reiniciadas en el estado sintético.
- `npm audit --omit=dev`: cero hallazgos.
- `git diff --check`: aprobado.

No se ejecutó despliegue ni migración remota. El build mantiene una advertencia de detección del plugin de Next.js en ESLint; el comando ESLint independiente sí ejecuta las reglas y termina limpio. Vitest avisa sobre el formato CJS de su configuración y Node sobre SQLite experimental; las suites finalizan correctamente.
- Copia limpia del índice, sin `.env`, `.next` ni `.open-next`, reutilizando solo las dependencias instaladas: TypeScript, lint y 188 pruebas aprobados antes de construir.
- `npm ci --dry-run --ignore-scripts --no-audit --no-fund`: manifest/lockfile compatibles. No sustituye una instalación real desde cero; esa comprobación está en CI.
- Escaneo de patrones conocidos de credenciales sobre 154 archivos añadidos/modificados del índice: sin candidatos; no es una garantía de ausencia de todos los secretos.

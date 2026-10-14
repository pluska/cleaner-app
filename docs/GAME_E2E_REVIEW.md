# Revisión del juego y primera E2E — 2026-10-08

## Estado del diseño

El ciclo principal funciona: misión doméstica → recompensa → restauración del edificio asociado → mejora del reino. La composición de escritorio separa bien el escenario de las acciones; la paleta verde y crema y los edificios mantienen una identidad coherente.

Pendientes observados en las capturas y el código:

- **Prioridad alta, móvil:** el escenario se superpone al título y al texto introductorio. Los edificios y sus etiquetas quedan muy pequeños a 390 px; sobra espacio debajo del mapa. Revisar encuadre y escala móvil.
- **Prioridad media, legibilidad:** algunos edificios tapan etiquetas de otros; los porcentajes de deterioro tienen poco contraste. Los controles móviles de zoom miden 34 px.
- **Prioridad media, identidad y progreso:** Entrada reutiliza el sprite de Torre. Las mejoras escalan el sprite y añaden una estrella; la restauración cambia el tinte. Falta una transformación visual más clara.
- **Prioridad media, orientación:** los capítulos son títulos ligados al contador de misiones, sin objetivos narrativos particulares. La relación habitación/edificio y la forma de mover edificios requieren más explicación.
- El diálogo de misión carece de gestión explícita de foco y cierre por Escape. Pendiente de prueba de teclado.

## Evidencia ejecutada

Playwright, Chrome headless, Next.js local y D1 local real; sin mocks de autenticación, misiones o recompensas. Dos proyectos: escritorio 1440×900 y móvil emulado 390×844. **2/2 pruebas aprobadas**.

La preparación crea una cuenta sintética, una habitación y una tarea mediante las API locales. El inicio de sesión y las acciones del juego pasan por la interfaz. Las cuentas sintéticas permanecen en la base local con correos `kingdom-e2e-…@example.invalid`.

Comprobaciones:

- Inicio de sesión y render del canvas.
- Filtro de tiempo y selección de Taberna desde la lista accesible.
- Abrir misión, completarla y cerrar el diálogo.
- Ganar exactamente 25 XP y 5 monedas; avanzar campaña y reto semanal.
- Restaurar la taberna y evitar recompensas duplicadas al repetir la petición.
- Mejorar al nivel 2 descontando 4 monedas.
- Activar descanso y guardar el diseño actual, incrementando su versión.
- Recargar y conservar descanso, progreso y nivel.
- Sin desbordamiento horizontal ni excepciones JavaScript no controladas.

Capturas por proyecto en `test-results/…/kingdom-before.png` y `kingdom-after.png`; informe HTML en `playwright-report/index.html`. Se regeneran con cada ejecución y están ignorados por Git.

## Reproducir

```bash
npm run db:migrate:local
npx playwright install chromium
npm run test:e2e
```

Con Google Chrome instalado se puede omitir la instalación de Chromium:

```bash
E2E_CHANNEL=chrome npm run test:e2e
```

Playwright arranca el servidor local en el puerto 3100 o reutiliza uno existente fuera de CI. No aplica migraciones automáticamente. Vitest se limita a los archivos `src/**/*.test.ts(x)` para no ejecutar los escenarios de navegador.

## Alcance pendiente

Esta es una E2E local del ciclo del reino, no una certificación de publicación. No cubre onboarding por UI, movimiento real de edificios sobre el canvas, conflictos entre sesiones, desbloqueo a las cinco misiones, tienda ni teclado. La preparación de cuenta/habitación/tarea es por API. El móvil es emulado: faltan dispositivos físicos, FPS y ejecución contra Cloudflare staging/D1 staging.

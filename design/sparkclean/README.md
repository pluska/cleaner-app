# SparkClean · Entrega de diseño

[Archivo de Figma](https://www.figma.com/design/KbdaVK1RegHyjr8Z9HvJJ5?node-id=28-2) · [Recorridos y entrega](https://www.figma.com/design/KbdaVK1RegHyjr8Z9HvJJ5?node-id=34-26) · [Calendario anual](https://www.figma.com/design/KbdaVK1RegHyjr8Z9HvJJ5?node-id=11-98)

Diseño basado en la estructura actual de la app, ampliado con hogares compartidos, camaradas, menores supervisados, varios hogares, cooperación flexible, construcción libre, inventarios, ropa, skins y eventos.

## Entregables

- 129 pantallas: 110 móviles, 16 de escritorio y 3 ejemplos en modo oscuro.
- 8 recorridos principales de prototipo, con navegación y estados alternativos.
- 12 ideas mensuales de eventos; recorridos específicos para camaradas, jardín y festival de luces.
- Consola de eventos: plantillas, borrador, vista previa, programación, validación, pausa y cancelación.
- Biblioteca local de componentes, iconos Lucide, estilos de texto, variables y modos Claro/Oscuro.
- 15 renders PNG con transparencia: personajes, edificios, ítems y terrenos base/invierno/otoño. Generados con ImageGen siguiendo las plantillas suministradas y la paleta oficial.

## Archivos

- `palette.json`: los 24 colores proporcionados, sin cambios de hexadecimal.
- `design-index.json`: enlaces a pantallas, puntos de inicio y calendario de eventos.
- `asset-manifest.json`: rutas, prompts completos, referencias y herramienta de generación.
- `style-templates.txt`: plantillas originales aportadas por el usuario.
- `assets/`: recursos PNG finales independientes de la UI.
- `qa-report.json`: evidencia de revisión estructural y comprobaciones de los recursos.

## Reglas principales

El avatar y los objetos personales pertenecen a la cuenta; la aldea, las construcciones y los recursos comunes pertenecen al hogar. La compra de perfiles supervisados requiere verificación adulta. Nivel, skin y decoración son independientes. El clima real es opcional, con ciudad elegida y alternativa manual. Los eventos no penalizan el descanso; las recompensas ya desbloqueadas tienen siete días adicionales de reclamación.

## Alcance de implementación

Este apartado describe el alcance de la entrega original de Figma. La implementación posterior de la interfaz, hogares y agenda compartida está documentada en [IMPLEMENTATION.md](IMPLEMENTATION.md), con el estado del despliegue enlazado allí.

Esta entrega implementa el diseño en Figma. Los datos y cifras del prototipo son ilustrativos. No se modificaron rutas, APIs ni tablas de la aplicación, y no se integraron todavía clima real, hogares compartidos ni publicación de eventos en producción. Los PNG son renders ilustrados; no son mallas o rigs 3D. Las interfaces conceptuales y la matriz de estados están documentadas en la página **05 · Prototipos y entrega**.


## Revisión de marca y contenido

Se incorporó el logo oficial adjunto en los encabezados y barras laterales. La landing conserva sus 39 strings de marketing en inglés y español; se entregan variantes móviles, de escritorio y cuatro vistas de página completa para revisión. Se restauraron los textos existentes de los principales flujos de la app y el catálogo original de recompensas. El texto de funciones nuevas sigue separado del contenido existente.

- `assets/sparkclean-official-logo.png`: archivo original sin modificaciones.
- `source-copy-catalog.json`: claves, traducciones y ubicaciones de origen.
- `copy-qa-report.json`: comprobación de marca, contenido y enlaces de esta revisión.
- [Landing completa en inglés](https://www.figma.com/design/KbdaVK1RegHyjr8Z9HvJJ5?node-id=52-6958) · [Landing completa en español](https://www.figma.com/design/KbdaVK1RegHyjr8Z9HvJJ5?node-id=52-7067) · [Reglas de marca y copy](https://www.figma.com/design/KbdaVK1RegHyjr8Z9HvJJ5?node-id=53-34).

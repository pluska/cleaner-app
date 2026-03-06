# Vitácora de Auditoría para Producción (Production Readiness Audit)
*Fecha de auditoría: 26 de febrero de 2026*

Este documento registra los hallazgos de una revisión profunda del estado actual de la aplicación, enfocándose en qué se necesita para llevar el producto a un entorno de producción seguro, escalable y sin errores.

---

## 🔒 Seguridad y Autenticación (Middlewares & APIs)

### 1. Manejo de Rutas API en el Middleware
- **Hallazgo**: El archivo `src/middleware.ts` actualmente excluye todas las rutas de la API de la protección global (`if (isApiRoute(request.nextUrl.pathname)) { return NextResponse.next(); }`).
- **Riesgo**: Depende del 100% de que cada ruta de la API implemente correctamente su propia validación. Si se crea un nuevo archivo de ruta y se olvida validar la sesión, la ruta quedará expuesta.
- **Sugerencia**: Se recomienda implementar una protección estructurada o mantener un middleware que verifique tokens para `/api/*` (exceptuando webhooks o rutas públicas específicas).

### 2. Bypass de RLS mediante `SUPABASE_SERVICE_ROLE_KEY`
- **Hallazgo**: En controladores como `src/app/api/user/profile/route.ts`, después de verificar al usuario, se utiliza el `serviceRoleClient` para sobreescribir las políticas de seguridad a nivel de fila (RLS) en Supabase.
- **Riesgo**: Si bien se está filtrando por el `user.id` extraído del token, usar la llave maestra siempre incrementa el riesgo de fugas de datos si la consulta de filtro llega a omitirse en futuras modificaciones.
- **Sugerencia**: Lo ideal para producción es configurar políticas RLS correctas en Supabase para que las tablas `user_profiles` y `tasks` solo sean accesibles por el usuario autenticado usando su propio token.

---

## 🐛 Errores de Tipado y Linting

### 1. Errores bloqueantes del Compilador TypeScript (`npx tsc`)
- Existen 4 errores activos en `src/libs/supabase-server.ts`.
- **Detalle**: El parámetro `cookiesToSet` y sus desestructuraciones (`name`, `value`, `options`) tienen un tipo `any` implícito.
- **Solución**: Importar la interfaz de cookies de Supabase o declarar el arreglo de firmas correctamente (`{ name: string, value: string, options: CookieOptions }[]`) para evitar que la compilación en Cloudflare falle en producción.

### 2. Advertencias de ESLint
- El comando `npm run lint` arroja código de salida fallido con advertencias.
- **Falta el plugin de Next.js**: No se ha detectado en la configuración el plugin oficial de Next.js, lo cual puede esconder malas prácticas en asincronía y rendering.
- **Uso de `any`**: Hay numerosos lugares en el proyecto (ej. `pixi-react`, APIs) donde se escapa del tipado seguro usando `any`. Esto es peligroso para el mantenimiento a largo plazo.

---

## 🚧 Características Incompletas y Deuda Técnica

### 1. Rutas con Datos Simulados (Mock Data)
- **Dashboard**: El componente `DashboardPage` actualmente realiza llamadas HTTP a `/api/mock-tasks` en lugar de la API real. Esto se debe cambiar antes del lanzamiento final.
- **Estadísticas y Tienda**: Las nuevas vistas (`/stats` y `/store`) se ven excelentes pero dependen de estados quemados en código (hardcoded arrays of objects) que aún no están enlazados a Supabase. Tienen que conectarse a una nueva ruta de backend.
- **Archivos sobrantes**: Existen scripts y APIs como `src/libs/populate-tasks.ts` y `/api/tasks/suggested/route.ts` que generan data basura o simulada que deben ser removidos de la rama principal de producción.

### 2. Comentarios `TODO` y `FIXME`
- Los resultados de búsqueda detallan varios `TODO` repartidos en páginas como `src/app/stats/page.tsx` y diccionarios de traducciones (`src/libs/translations.ts`).
- Se recomienda repasar una búsqueda unificada por `TODO` en el editor antes de enviar a producción.

---

## 💡 Recomendaciones para Siguientes Pasos (Next Steps)

1. **Reparar el Tipado en Supabase Server**: Arreglar `supabase-server.ts` de forma prioritaria porque es un error fatal de compilación que bloqueará el *pipeline* de despliegue.
2. **Conectar Vista de Dashboard**: Cambiar los fetch que dicen `/api/mock-tasks` a `/api/tasks`.
3. **Auditoría de Políticas RLS**: Ir al Dashboard de Supabase, asegurar que el RLS esté activo para los Perfiles y las Tareas, y luego quitar paulatinamente la dependencia del `admin_client` de las APIs en favor del cliente de usuario autenticado.
4. **Implementar Backend para Store/Stats**: Crear las tablas `user_rewards` o expandir el estado actual en la base de datos para manejar el flujo de "Monedas" y "Rachas" real de forma confiable.

---

## ☁️ Migración a Stack Cloudflare (TODOs)

Dado el objetivo de mover la infraestructura backend a Cloudflare y prescindir de Supabase, se añaden los siguientes TODOs críticos:

1. **Implementación de BD con Cloudflare D1**: Migrar las tablas y lógica desde Supabase (PostgreSQL) hacia Cloudflare D1 (SQLite). Requiere reescribir las consultas de la API, posiblemente usando un ORM como Drizzle.
2. **Autenticación con NextAuth**: Reemplazar Supabase Auth. Implementar NextAuth.js (Auth.js) conectado a la base de datos D1 para manejar sesiones de usuarios, registro y login.
3. **Mailing en Render (Recuperación de Contraseña)**: Configurar un servicio en Render para el envío de correos electrónicos, necesario de forma urgente para soportar el flujo de "Olvidé mi contraseña" que antes manejaba Supabase de forma nativa.
4. **Configuración de Entorno Local (Dev)**: Configurar Wrangler y los *bindings* (`wrangler.toml`) para poder emular el entorno de Cloudflare directamente en local (D1 local) y alinear el script de `dev`.

---

## 🎯 Features y Funcionalidades (TODOs / FIXes)

### 1. Gestión Principal de Tareas de Limpieza
Las tareas deben expandir su modelo de datos y UI para soportar las siguientes características:
- **Nombre y Descripción**
- **Subtareas** (con tiempo estimado para cada una)
- **Frecuencia** (Diaria, Semanal, Mensual, etc.)
- **Recomendaciones**
- **Herramientas Necesarias** (Ej. Aspiradora, Limpiador multiusos)
- **Habitación/Área** (Ej. Cocina, Baño Principal)
- **Razón de Salud** (Por qué es importante limpiar esto)
- **Link a Fuente** (Enlace a artículos de salud/limpieza)
- *(Sugerencia Adicional)*: **Nivel de Esfuerzo/Energía** (Bajo, Medio, Alto) para ayudar a los usuarios a elegir qué limpiar según su cansancio.
- *(Sugerencia Adicional)*: **Temporada Ideal** (Ej. Limpieza de Primavera) o **Condición Climática** para tareas exteriores.

### 2. Gamificación (Sistema de Recompensas)
El sistema debe incentivar la limpieza a través del juego:
- **Experiencia (XP) y Niveles**: Los usuarios suben de nivel al completar tareas.
- **Recompensas y Monedas**: Ganar divisas del juego por rachas o limpieza profunda.
- **Tienda Virtual**: Usar las monedas para comprar ítems para las herramientas, *skins* para la UI/personajes, o decoraciones.
- **Construcción de Reino (Kingdom Building)**: Un metajuego donde el progreso de limpieza mejora un reino virtual o casa en la app.
- **Animaciones Divertidas**: Feedback visual satisfactorio (confeti, sonidos, personajes moviéndose) al marcar una tarea como completada.

### 3. Generación de Tareas con IA (AI Tasks Generation)
- **Chat Especializado con Gemini**: Interfaz de chat integrada para pedir rutinas de limpieza personalizadas.
- **Persona/Skin del Asistente**: El asistente visual debe estar tematizado como un **Viejo Mago** (Old Wizard) que da "pociones" (recomendaciones) y "misiones" (tareas) mágicas de limpieza.

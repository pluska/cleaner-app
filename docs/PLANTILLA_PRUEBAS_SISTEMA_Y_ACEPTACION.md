# 📋 Plantilla y Protocolo de Pruebas de Sistema y Aceptación (UAT)
**Proyecto:** CleanerPlanner (SparkClean)<br>
**Versión del Sistema:** `0.1.0-gamification`<br>
**Entorno de Ejecución:** [ ] Local / Desarrollo  |  [ ] Staging  |  [ ] Producción<br>

---

## 1. Control del Documento y Metadatos

| Campo | Información |
| :--- | :--- |
| **ID del Protocolo** | `TEST-UAT-SYS-2026-001` |
| **Líder de QA / Responsable:** | `___________________________________` |
| **Product Owner / Aprobador:** | `___________________________________` |
| **Fecha de Inicio:** | `____/____/2026` |
| **Fecha de Finalización:** | `____/____/2026` |
| **Resultado Global:** | [ ] APROBADO (GO)  \|  [ ] RECHAZADO (NO-GO)  \|  [ ] APROBADO CON OBSERVACIONES |

---

## 2. Criterios de Aceptación y Clasificación de Defectos

### Criterios de Entrada (Entry Criteria)
1. Despliegue exitoso del build sin errores de compilación (`npm run build`).
2. Validación de tipos de TypeScript aprobada con 0 errores (`npm run typecheck`).
3. Suite de pruebas unitarias y de integración superada al 100% con cobertura $\ge 80\%$ (`npx vitest run --coverage`).
4. Base de datos D1 migrada con el esquema vigente (`wrangler d1 migrations apply`).

### Criterios de Salida (Exit Criteria)
1. 100% de los casos de prueba de Sistema y UAT ejecutados.
2. 0 defectos clasificados como **Crítico / Bloqueante**.
3. Defectos **Mayores** corregidos o documentados con plan de contingencia aceptado por el Product Owner.
4. Tasa de éxito de casos de prueba $\ge 95\%$.

### Matriz de Severidad de Defectos
- **S1 - Crítico / Bloqueante:** Bloquea el flujo principal, provoca caída del sistema, corrupción de datos o brecha de seguridad. No hay solución temporal.
- **S2 - Mayor:** Falla funcional relevante en una característica clave (ej. cálculo erróneo de EXP o fallo en guardado de layout). Existe alternativa provisional.
- **S3 - Menor / Medio:** Comportamiento inesperado no crítico (ej. texto no traducido, desfase visual menor o retardo leve en animación).
- **S4 - Cosmético:** Ajuste estético, alineación de etiquetas o sugerencia de usabilidad.

---

## 3. Matriz de Pruebas de Sistema (System Testing)

Las pruebas de sistema verifican la integridad técnica, seguridad, persistencia y comunicación entre módulos y servicios externos.

| ID Caso | Módulo / Componente | Objetivo de la Prueba | Prerrequisitos | Pasos de Ejecución | Resultado Esperado | Estado (P/F/B) | Notas / Evidencia |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **SYS-01** | Autenticación y Cifrado | Validar registro seguro con hash bcrypt y persistencia de perfil inicial. | BD accesible, email no registrado. | 1. Enviar POST a `/api/auth/signup` con email y contraseña válida.<br>2. Consultar BD directamente. | HTTP 201 retornado. Usuario registrado sin exponer hash. Perfil creado en nivel 1 con 0 XP y 0 monedas. | | |
| **SYS-02** | Motor RRULE y Recurrencias | Validar proyección matemática de eventos diarios, semanales y mensuales. | Plantilla con regla RRULE generada. | 1. Crear tarea diaria con fecha inicio.<br>2. Consultar `/api/tasks?date=YYYY-MM-DD` para hoy y días futuros. | Solo aparecen instancias proyectadas que coinciden exactamente con la fórmula matemática del día. | | |
| **SYS-03** | Concurrencia Optimista (Reino) | Comprobar que no se sobrescriban distribuciones del reino simultáneas. | Usuario autenticado con sesión en 2 pestañas. | 1. Modificar posiciones en Sesión A con versión 1.<br>2. Guardar en Sesión B con versión desactualizada (versión 1). | Sesión A guarda (200, versión 2). Sesión B recibe HTTP 409 con advertencia de recargar. | | |
| **SYS-04** | Integración IA y Fallback | Evaluar tolerancia a fallos cuando OpenAI API excede cuota o falla red. | OPENAI_API_KEY configurada o mock de desconexión. | 1. Ejecutar recomendación de tareas con clave inválida o corte de red.<br>2. Inspeccionar respuesta. | El sistema no colapsa; conmuta automáticamente a recomendaciones locales seguras (`source: fallback`). | | |
| **SYS-05** | Automatización Diaria (Cron) | Verificar generación de tareas atrasadas y corte de racha por inactividad. | Cabecera `Authorization: Bearer <CRON_SECRET>`. | 1. Invocar GET `/api/cron/daily` con clave secreta.<br>2. Comprobar registros de `taskInstances` y `userProfiles`. | HTTP 200. Tareas vencidas se materializan como `pending`, usuarios sin actividad ayer tienen `currentStreak = 0`. | | |
| **SYS-06** | Idempotencia en Compras | Asegurar que el reintento de compra con mismo `requestId` no descuente monedas dobles. | Usuario con 100 monedas en perfil. | 1. Enviar compra de poción (50 monedas) con `requestId: req-abc-123`.<br>2. Reenviar idéntico payload. | Primera llamada descuenta 50 (saldo: 50). Segunda llamada devuelve éxito o rechazo controlado sin restar más monedas. | | |
| **SYS-07** | Expiración de Sesión (401) | Comprobar detección de token vencido y notificación reactiva al usuario. | Cliente web activo. | 1. Forzar expiración de cookie/token.<br>2. Ejecutar acción de guardado o toggle de tarea. | La librería cliente captura el 401, dispara evento `session-expired` y muestra modal/aviso sin bloqueo de interfaz. | | |

---

## 4. Matriz de Pruebas de Aceptación de Usuario (UAT)

Las pruebas de aceptación validan que el sistema cumple con las expectativas y necesidades operativas del usuario final bajo el estándar **Dado / Cuando / Entonces (Given / When / Then)**.

| ID Caso | Escenario de Usuario | Criterios de Aceptación (Gherkin) | Pasos de Verificación | Resultado Esperado | Estado (P/F/B) | Observaciones |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **UAT-01** | Registro con temática RPG | **Dado** un visitante en la página de registro<br>**Cuando** ingresa contraseña débil (< 8 chars o sin números)<br>**Entonces** recibe advertencias temáticas de rechazo. | 1. Ingresar a `/auth/signup`.<br>2. Ingresar contraseña `secreta`.<br>3. Hacer clic en Registrar. | Mensaje temático: *"Tu santo y seña debe contener al menos 8 caracteres..."*. | | |
| **UAT-02** | Evaluación Inicial del Hogar | **Dado** un nuevo usuario completando el onboarding<br>**Cuando** selecciona "Cocina" y estilo de vida "Ocupado"<br>**Entonces** el sistema genera tareas adaptadas con menor frecuencia. | 1. Completar cuestionario en `/onboarding`.<br>2. Finalizar y ver resumen de tareas recomendadas. | Se asignan tareas de cocina espaciadas cada 2 días con sub-tareas detalladas y tiempos realistas. | | |
| **UAT-03** | Cumplimiento y Recompensa | **Dado** una tarea pendiente en el dashboard<br>**Cuando** el usuario marca la casilla de verificación<br>**Entonces** se suma EXP, se otorgan monedas y salta notificación. | 1. Ingresar a `/dashboard`.<br>2. Completar tarea de 15 EXP.<br>3. Observar barra de experiencia y monedas. | Sonido/animación de éxito, barra de EXP avanza, monedas incrementan (+1 moneda por cada 10 EXP). | | |
| **UAT-04** | Decaimiento y Corrupción del Reino | **Dado** un reino sin limpiar por 7 días<br>**Cuando** el usuario ingresa a la vista del Reino Medieval<br>**Entonces** los edificios muestran 50% de corrupción visual. | 1. Simular última limpieza hace 7 días.<br>2. Navegar a `/kingdom`.<br>3. Inspeccionar edificios en el canvas. | Los edificios muestran texturas con moho/suciedad (corrupción = 50%) y el pozo/taberna requieren purificación. | | |
| **UAT-05** | Modo Vacaciones / Descanso | **Dado** un usuario que activa el modo descanso<br>**Cuando** pasan días sin actividad de limpieza<br>**Entonces** la corrupción del reino y la racha quedan congeladas. | 1. Activar interruptor "Modo Descanso" en ajustes.<br>2. Avanzar fecha del sistema.<br>3. Verificar estado del reino. | No hay aumento en el nivel de corrupción mientras el modo descanso esté activo. | | |
| **UAT-06** | Compañero Sparklin Reactivo | **Dado** el avatar mágico Sparklin en pantalla<br>**Cuando** el usuario hace clic compulsivamente 5 veces seguidas<br>**Entonces** Sparklin despliega un diálogo anti-spam divertido. | 1. Localizar el avatar de Sparklin.<br>2. Hacer 5 clics rápidos (< 3 segundos). | Sparklin abre su globo de diálogo quejándose del spam y pidiendo paciencia con sus hechizos. | | |
| **UAT-07** | Cambio Dinámico de Idioma | **Dado** la aplicación en idioma Español<br>**Cuando** el usuario cambia el selector a Inglés<br>**Entonces** el 100% de la navegación, botones y textos cambian inmediatamente. | 1. Usar el LanguageSwitcher en la barra superior.<br>2. Conmutar de Español a Inglés. | Textos como "Hoy", "Rutina", "Tareas" cambian a "Today", "Routine", "Tasks" sin recargar la página. | | |

---

## 5. Formato de Registro de Defectos (Defect Log)

Utilice esta tabla para asentar cualquier falla detectada durante las sesiones de prueba:

| Bug ID | Caso Asociado | Severidad (S1-S4) | Descripción del Defecto | Pasos para Reproducir | Comportamiento Esperado | Comportamiento Real Obtenido | Asignado A | Estado (Abierto / Resuelto / Verificado) |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| `BUG-01` | | | | | | | | |
| `BUG-02` | | | | | | | | |
| `BUG-03` | | | | | | | | |

---

## 6. Informe de Cierre y Dictamen Final

| Métrica | Valor Numérico | Porcentaje |
| :--- | :---: | :---: |
| **Total de Casos Planificados:** | 14 | 100% |
| **Casos Ejecutados Exitosamente (Pass):** | `____` | `____%` |
| **Casos Fallidos (Fail):** | `____` | `____%` |
| **Casos Bloqueados (Blocked):** | `____` | `____%` |
| **Defectos Críticos (S1) Pendientes:** | `____` | - |
| **Defectos Mayores (S2) Pendientes:** | `____` | - |

### Dictamen de Salida:
- [ ] **APROBADO PARA PRODUCCIÓN (GO):** Cumple con todos los criterios de aceptación y calidad.
- [ ] **APROBADO CONDICIONADO:** Aprobado con observaciones menores a subsanar en el siguiente ciclo.
- [ ] **RECHAZADO (NO-GO):** Bloqueado por defectos críticos o cobertura insuficiente.

**Firma QA Lead:** ___________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Firma Product Owner:** ___________________________<br>
**Fecha:** `____/____/2026`

# Seguridad del prototipo

## Diagnostico actual

El sistema ya cuenta con una base de seguridad correcta para un prototipo academico:

- El frontend envia `Authorization: Bearer access_token` desde `frontend/src/services/api.ts`.
- El backend valida el token con Supabase Auth en `backend/src/middlewares/authMiddleware.ts`.
- El `user_id` usado por el backend se toma desde `req.user.id`, no desde el cuerpo enviado por el frontend.
- Las rutas `/api/chat` y `/api/sessions` estan protegidas por middleware de autenticacion.
- RLS esta definido para `chat_sessions`, `chat_messages`, `knowledge_topics` y `academic_materials`.
- Las sesiones y mensajes se filtran por usuario autenticado.
- OpenRouter se consume solo desde el backend.
- `.env` esta incluido en `.gitignore`.
- Los archivos `.env.example` no contienen claves reales.
- `backend/.env` contiene variables privadas del backend y `frontend/.env` contiene solo variables publicas `VITE_*`.
- No se encontraron `OPENROUTER_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `service_role` ni `sb_secret_` en `frontend/src` ni en `frontend/dist` despues del build final.

## Riesgos encontrados

- `backend/.env` tenia variables `VITE_*` duplicadas. Se quitaron porque pertenecen al frontend.
- No habia headers basicos de seguridad en Express. Se agrego un middleware equivalente para un prototipo.
- No habia rate limiting para el endpoint de chat. Se agrego un limite simple y se ubico despues de autenticacion para aplicar el cupo por usuario autenticado o IP.
- El prompt del tutor podia ser mas explicito contra prompt injection, filtracion de instrucciones y pedidos de claves.
- La validacion de `topic` aceptaba cualquier texto sin caracteres de control. Se endurecio.
- Helmet no esta instalado. Para evitar agregar dependencias y cambiar el flujo de instalacion, se implementaron headers basicos y se recomienda Helmet para una etapa posterior.
- RLS esta definido en SQL local y el script fue ejecutado desde Supabase SQL Editor durante la validacion.
- Git fue instalado e inicializado; `backend/.env` y `frontend/.env` aparecen como ignorados (`!!`) en `git status --short --ignored`.

## Cambios aplicados

- `backend/src/server.ts`: desactiva `x-powered-by`, aplica headers basicos, mantiene CORS por `CORS_ORIGIN` y agrega rate limit a `/api/chat`.
- `backend/src/routes/chatRoutes.ts`: aplica autenticacion antes del rate limit y protege `POST /api/chat/send`.
- `backend/src/middlewares/securityMiddleware.ts`: middleware de headers y rate limit en memoria.
- `backend/src/utils/validators.ts`: rechaza caracteres de control en textos opcionales como `topic`.
- `backend/src/services/promptService.ts`: agrega reglas de seguridad para dominio, privacidad y prompt injection.
- `backend/.env`: se quitaron variables `VITE_*` duplicadas.

## Recomendaciones prioritarias

1. Ejecutar `database/rls-policies.sql` en Supabase y verificar que RLS quede activo en el panel.
2. Confirmar en Supabase Auth que Google OAuth tenga como redirect permitido `http://localhost:5173/chat` y el dominio de produccion si existe.
3. Mantener `SUPABASE_SERVICE_ROLE_KEY` y `OPENROUTER_API_KEY` solo en backend.
4. Revisar antes de entregar que `frontend/dist` no contenga `service_role`, `SUPABASE_SERVICE_ROLE_KEY` ni `OPENROUTER_API_KEY`.
5. Considerar instalar `helmet` y `express-rate-limit` si se desea una solucion mantenida por librerias.
6. Ejecutar las pruebas de `docs/pruebas-tecnicas.md` y `docs/pruebas-seguridad.md` antes de la defensa.

## Conclusion de seguridad

El prototipo implementa una seguridad basica adecuada para un Trabajo Final de Grado. La configuracion protege claves privadas manteniendolas solo en el backend, utiliza autenticacion con Supabase, valida tokens en rutas protegidas, restringe CORS a origenes configurados, aplica rate limit al endpoint `/api/chat/send`, valida entradas como mensajes vacios y mensajes demasiado largos, utiliza RLS en Supabase para aislar datos por usuario, refuerza el prompt contra prompt injection y rechaza consultas fuera del dominio academico de Algoritmos y Estructuras de Datos I.

## Checklist final de seguridad basica

- [ ] `.env` no esta versionado.
- [ ] `backend/.env` contiene claves privadas reales solo del backend.
- [ ] `frontend/.env` contiene solo variables `VITE_*`.
- [ ] Rutas protegidas responden `401` sin token.
- [ ] Rutas protegidas responden `401` con token invalido o expirado.
- [ ] No se acepta `user_id` desde el frontend.
- [ ] Un usuario no puede leer sesiones de otro usuario.
- [ ] Un usuario no puede leer mensajes de otro usuario.
- [ ] `knowledge_topics` y `academic_materials` son solo lectura para usuarios autenticados.
- [ ] CORS permite solo origenes configurados en `CORS_ORIGIN`.
- [ ] El endpoint de chat valida mensaje vacio y longitud maxima.
- [ ] OpenRouter se invoca solo desde backend.
- [ ] El tutor rechaza pedidos de claves, tokens, instrucciones internas o datos de otros usuarios.
- [ ] La busqueda en `frontend/dist` no encuentra claves privadas luego de cada build.

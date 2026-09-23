# Documentacion tecnica

## Descripcion general del sistema

Tutor Inteligente AED I es un prototipo web de apoyo academico para la asignatura Algoritmos y Estructuras de Datos I. El sistema integra autenticacion de usuarios, chat con IA, recuperacion de contexto academico, almacenamiento persistente de conversaciones y una interfaz responsive.

El prototipo esta delimitado al acompanamiento del aprendizaje. No sustituye la intervencion docente, no emite calificaciones formales y no debe considerarse una fuente unica de verdad academica.

## Arquitectura cliente-servidor

La aplicacion se organiza en dos capas principales:

- Frontend: aplicacion React con Vite encargada de la interfaz, autenticacion desde el cliente con Supabase Auth y consumo de la API propia.
- Backend: API REST en Express encargada de validar tokens, aplicar controles de seguridad, consultar Supabase, construir el prompt academico y consumir OpenRouter.

Supabase cumple dos funciones: proveedor de autenticacion y base de datos PostgreSQL. OpenRouter se usa solo desde el backend para evitar exponer la clave privada en el navegador.

## Flujo de autenticacion

1. El usuario se registra o inicia sesion desde el frontend.
2. Supabase Auth devuelve una sesion con `access_token`.
3. El frontend conserva la sesion mediante el cliente de Supabase.
4. Cada solicitud protegida al backend incluye `Authorization: Bearer <token>`.
5. El backend valida el token con Supabase Auth.
6. Si el token es valido, el backend usa `req.user.id` como identidad confiable.
7. Si el token falta, esta vacio, es invalido o expiro, se devuelve HTTP 401.

## Flujo de login con Google

1. El usuario presiona "Continuar con Google".
2. El frontend inicia OAuth con `supabase.auth.signInWithOAuth`.
3. Supabase redirige al proveedor Google.
4. El usuario autoriza el acceso.
5. Supabase redirige nuevamente a `/chat`.
6. La aplicacion detecta la sesion activa y muestra el chat.

## Flujo de envio de mensaje

1. El usuario escribe una consulta en el chat.
2. El frontend valida estado basico y envia el mensaje al backend.
3. El backend autentica el token.
4. El backend valida mensaje y sesion.
5. El backend recupera en paralelo historial reciente y contexto academico a partir de la consulta.
6. Se construye un prompt con reglas pedagogicas y de seguridad.
7. OpenRouter genera la respuesta con `openai/gpt-5.6-luna`.
8. El backend guarda el mensaje del usuario y la respuesta del tutor.
9. El frontend recarga los mensajes de la sesion.

## Flujo de almacenamiento del historial

Las conversaciones se guardan en dos tablas:

- `chat_sessions`: identifica cada conversacion por usuario.
- `chat_messages`: almacena mensajes del estudiante y del tutor.

Cada registro queda asociado al `user_id` autenticado. Las politicas RLS impiden que un usuario autenticado consulte sesiones o mensajes pertenecientes a otro usuario.

## Estructura de carpetas

```text
TutorFIUNI/
  backend/
    src/
      config/
      controllers/
      middlewares/
      routes/
      services/
      types/
      utils/
  frontend/
    src/
      components/
      context/
      pages/
      services/
      types/
      utils/
  database/
    schema.sql
    rls-policies.sql
    seed-topics.sql
  docs/
```

## Tecnologias utilizadas

- React y TypeScript para el frontend.
- Vite como herramienta de desarrollo y build.
- Express y TypeScript para el backend.
- Supabase Auth para autenticacion.
- Supabase PostgreSQL para persistencia.
- Row Level Security para aislamiento de datos.
- OpenRouter para generacion de respuestas con `openai/gpt-5.6-luna`.
- Markdown para renderizar respuestas del tutor.

## Variables de entorno

Backend:

- `PORT`
- `NODE_ENV`
- `CORS_ORIGIN`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (opcional; por defecto `openai/gpt-5.6-luna`)

Frontend:

- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Las variables privadas del backend no deben copiarse al frontend.

## Seguridad aplicada

- `.env` ignorado por Git.
- Separacion entre frontend publico y backend privado.
- Validacion de tokens con Supabase Auth.
- Rutas protegidas para chat e historial.
- Uso de `req.user.id` como identidad confiable.
- CORS restringido.
- Headers basicos de seguridad.
- Rate limit en `/api/chat/send`.
- Validacion de mensajes vacios, longitud maxima y textos opcionales.
- RLS en tablas principales.
- Prompt reforzado contra prompt injection.
- Rechazo de solicitudes fuera del dominio academico.

## Delimitaciones tecnicas

- El prototipo esta orientado a AED I.
- La IA puede cometer errores y requiere criterio docente.
- El rate limit es basico y en memoria.
- No incluye panel docente.
- No incluye compilador ni correccion automatica de codigo.
- No esta integrado a sistemas institucionales.
- La documentacion describe el estado del prototipo, no una certificacion de seguridad completa.

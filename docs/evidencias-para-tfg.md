# Evidencias para TFG

Este documento lista capturas y evidencias recomendadas para respaldar la presentacion tecnica del prototipo.

## Capturas funcionales

- Login desktop con panel deslizante.
- Login celular con layout vertical.
- Registro de usuario.
- Login con Google desde Supabase Auth.
- Chat vacio con sugerencias iniciales.
- Chat con respuesta del tutor.
- Generacion de ejercicio de AED I.
- Selector de tema.
- Selector de dificultad.
- Historial de conversaciones en sidebar.
- Recuperacion de una conversacion anterior.
- Cierre de sesion.

## Capturas responsive

- Chat responsive en celular `390 x 844`.
- Chat responsive en celular pequeno `360 x 740`.
- Chat responsive en tablet vertical `768 x 1024`.
- Chat responsive en tablet horizontal `1024 x 768`.
- Chat en notebook `1366 x 768`.
- Chat en escritorio `1920 x 1080`.
- Sidebar drawer abierto en celular.
- Input visible abajo en celular.
- Selectores apilados en celular.

## Capturas de Supabase

- Supabase Auth con usuarios registrados.
- Proveedor Google habilitado.
- Tabla `chat_sessions`.
- Tabla `chat_messages`.
- Tabla `knowledge_topics`.
- Tabla `academic_materials`.
- Politicas RLS activas.

## Capturas tecnicas

- Backend corriendo en terminal.
- Frontend corriendo en terminal.
- Build correcto del frontend.
- Typecheck o build correcto del backend.
- `git status --ignored` mostrando `.env` ignorado.
- Busqueda sin secretos en frontend.
- Respuesta HTTP 401 sin token.
- Respuesta HTTP 401 con token invalido.
- Respuesta HTTP 400 con mensaje vacio.
- Respuesta HTTP 400 con mensaje mayor a 4000 caracteres.
- Respuesta HTTP 429 por rate limit.

## Capturas de seguridad

- Variables privadas solo en backend, sin mostrar valores reales.
- `.env.example` sin secretos.
- CORS configurado por variable de entorno.
- RLS en Supabase.
- Rechazo de prompt injection.
- Rechazo de pedido de API key.
- Rechazo de consulta fuera del dominio.

## Recomendacion para organizar evidencias

Guardar las capturas en carpetas separadas:

```text
evidencias/
  01-funcionalidad/
  02-responsive/
  03-supabase/
  04-seguridad/
  05-build-y-ejecucion/
```

Usar nombres descriptivos como `login-desktop.png`, `chat-celular-390x844.png` o `supabase-rls-chat-sessions.png`.

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
- Recuperacion automatica de contexto academico.
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

## Anexos de evaluacion existentes

- Comparacion reproducible de modelos de la Fase 3: metodologia, casos congelados y comando de consolidacion en `evals/model-comparison/README.md`.
- Inventario academico vigente: evidencia de 27 registros en `knowledge_topics` y 52 en `academic_materials`, junto con el seed sincronizado `database/seed-topics.sql`.
- Medicion de latencia de la Fase 6: conservar la planilla o registro de las cinco mediciones realizadas, incluyendo tiempos totales y de modelo; no constituye un nuevo experimento.
- Pruebas de regresion de la Fase 7: conservar las evidencias manuales y los resultados de typecheck, build y `git diff --check` de ese cierre.

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

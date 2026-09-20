# Tutor Inteligente AED I

## Descripcion

Tutor Inteligente AED I es un prototipo academico de sistema tutor conversacional para apoyar el aprendizaje de la asignatura Algoritmos y Estructuras de Datos I. La aplicacion permite a los estudiantes registrarse, iniciar sesion, conversar con un tutor basado en IA, seleccionar tema, generar explicaciones o ejercicios, y recuperar el historial de conversaciones.

El sistema fue desarrollado como prototipo para un Trabajo Final de Grado. No reemplaza al docente ni constituye una herramienta de evaluacion formal; su alcance es brindar apoyo academico guiado dentro del dominio de AED I.

## Objetivo

Desarrollar un prototipo funcional de tutor inteligente que integre autenticacion de usuarios, interaccion conversacional con IA, persistencia de historial, medidas basicas de seguridad y una interfaz responsive usable desde escritorio, notebook, tablet y celular.

## Tecnologias utilizadas

- Frontend: React, TypeScript, Vite, React Router, Axios, Supabase JS, React Markdown, Lucide React.
- Backend: Node.js, Express, TypeScript, Supabase JS, Google Generative AI SDK.
- Base de datos y autenticacion: Supabase Auth, PostgreSQL, Row Level Security.
- IA generativa: Gemini API, consumida exclusivamente desde el backend.
- Estilos: CSS responsivo con media queries.

## Arquitectura general

La arquitectura es cliente-servidor:

- El frontend presenta las pantallas de login, registro, chat, sidebar, historial y selector de tema.
- Supabase Auth gestiona autenticacion por email/contrasena y Google OAuth.
- El frontend obtiene el `access_token` de Supabase y lo envia al backend mediante `Authorization: Bearer`.
- El backend valida el token con Supabase, procesa las solicitudes y usa el usuario autenticado para consultar o guardar datos.
- Supabase almacena sesiones, mensajes y material academico.
- Gemini genera respuestas del tutor a partir del mensaje del estudiante, historial reciente y contexto academico recuperado.

## Instalacion del backend

```bash
cd backend
pnpm install
```

Crear `backend/.env` a partir de `backend/.env.example` y completar las variables reales.

## Instalacion del frontend

```bash
cd frontend
pnpm install
```

Crear `frontend/.env` a partir de `frontend/.env.example` y completar las variables publicas necesarias para el cliente.

## Variables de entorno

Backend:

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

Frontend:

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Las claves privadas `SUPABASE_SERVICE_ROLE_KEY` y `GEMINI_API_KEY` deben permanecer solo en el backend. Los archivos `.env` estan incluidos en `.gitignore`.

## Configuracion de Supabase

1. Crear un proyecto en Supabase.
2. Ejecutar `database/schema.sql` en el SQL Editor.
3. Ejecutar `database/rls-policies.sql`.
4. Ejecutar `database/seed-topics.sql` para cargar temas base.
5. Confirmar que RLS este activo en `chat_sessions`, `chat_messages`, `knowledge_topics` y `academic_materials`.

## Configuracion de Google OAuth

1. Habilitar el proveedor Google en Supabase Auth.
2. Configurar las credenciales OAuth en Google Cloud.
3. Registrar las URL de redireccion permitidas, por ejemplo:
   - `http://localhost:5173/chat`
   - Dominio de produccion si corresponde.
4. Verificar que el boton "Continuar con Google" redireccione correctamente al chat.

## Configuracion de Gemini API

1. Obtener una clave de Gemini API.
2. Guardarla solo en `backend/.env` como `GEMINI_API_KEY`.
3. Definir el modelo en `GEMINI_MODEL`.
4. Verificar que el backend sea el unico componente que invoque la API.

## Ejecucion local

Backend:

```bash
cd backend
pnpm run dev
```

Frontend:

```bash
cd frontend
pnpm run dev
```

Por defecto:

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

## Funcionalidades principales

- Registro con email y contrasena.
- Inicio de sesion con email y contrasena.
- Inicio de sesion real con Google mediante Supabase Auth.
- Chat academico con IA para AED I.
- Seleccion de tema.
- Generacion de explicaciones, ejemplos y ejercicios.
- Historial persistente de conversaciones.
- Sidebar de sesiones.
- Cierre de sesion.
- Interfaz responsive para escritorio, notebook, tablet y celular.

## Seguridad implementada

El prototipo incorpora medidas basicas adecuadas para un entorno academico:

- Variables de entorno protegidas.
- Separacion entre claves privadas de backend y variables publicas del frontend.
- CORS restringido por `CORS_ORIGIN`.
- Headers basicos de seguridad.
- Rate limit en el endpoint de chat.
- Validacion de token de Supabase en rutas protegidas.
- Validacion de mensajes vacios y longitud maxima de 4000 caracteres.
- Validacion de textos opcionales.
- RLS en Supabase para aislar sesiones y mensajes por usuario.
- Prompt del tutor reforzado contra prompt injection.
- Rechazo de consultas fuera del dominio de AED I.
- Manejo de errores sin exponer stack trace al cliente.

## Pruebas realizadas

La documentacion de pruebas se encuentra en:

- `docs/pruebas-tecnicas.md`
- `docs/pruebas-seguridad.md`
- `docs/pruebas-responsive.md`

Se validaron flujos funcionales, casos de seguridad, rechazo de entradas invalidas, persistencia de historial, responsive y build del frontend.

## Responsive

La interfaz fue ajustada para los siguientes rangos:

- Escritorio grande: 1200 px o mas.
- Notebook: 1024 px a 1199 px.
- Tablet: 768 px a 1023 px.
- Celular: menor a 768 px.
- Celular pequeno: menor a 480 px.

Se verifico que no exista scroll horizontal, que el input del chat permanezca visible, que los mensajes sean legibles y que el sidebar funcione como drawer en pantallas pequenas.

## Limitaciones

- No reemplaza al docente.
- No realiza evaluacion formal.
- No corrige codigo automaticamente.
- No incluye compilador.
- No se integra al sistema academico institucional.
- Depende de Supabase y Gemini como servicios externos.
- Puede generar respuestas que requieren revision docente.

## Mejoras futuras

- Panel docente.
- Carga avanzada de materiales.
- Correccion guiada de codigo.
- Analiticas de uso.
- Seguimiento de progreso.
- Integracion institucional.
- Expansion a otras asignaturas.
- Despliegue en produccion.
- Validacion con mayor cantidad de estudiantes.

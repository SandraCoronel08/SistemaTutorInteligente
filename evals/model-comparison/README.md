# Comparación reproducible de modelos — Fase 3

Este harness compara respuestas al mismo prompt de Fase 2 sin consultar Supabase ni usar el flujo HTTP del STI. Cada corrida es secuencial: procesa un caso y, para ese mismo prompt, ejecuta los modelos indicados uno por uno.

## Casos congelados

`cases.json` contiene exactamente siete casos. Cada uno guarda:

- `query`: la consulta del estudiante.
- `academic_context`: el texto académico ya renderizado con el formato que consume el prompt de Fase 2.
- `history`: siempre `[]`.

El runner no llama a Supabase ni realiza retrieval. Construye el prompt mediante `buildTutorPromptFromRenderedContext` de `backend/src/services/promptService.ts`; por lo tanto conserva las instrucciones y la composición real de Fase 2, sustituyendo solo el contexto congelado, el historial vacío y la consulta del caso.

## Proveedores y modelos

Cada modelo se declara explícitamente con `--model provider:model_id`. Se aceptan `gemini`, `groq` y `openrouter`. El proveedor determina únicamente el adaptador de API y la variable local requerida:

| Proveedor | Variable local | Endpoint |
| --- | --- | --- |
| `gemini` | `GEMINI_API_KEY` | SDK de Google Generative AI |
| `groq` | `GROQ_API_KEY` | API compatible con OpenAI de Groq |
| `openrouter` | `OPENROUTER_API_KEY` | API compatible con OpenAI de OpenRouter |

El runner carga solo `backend/.env`; no lee ni registra otros valores de entorno, claves ni prompts en la consola. Cada proveedor/modelo se solicita en serie y un fallo de red, cuota o API queda como una fila con `status: "error"` y `error_code`, sin abortar la corrida.

## Resultados

Cada corrida crea un archivo JSONL en `results/` (ignorados por Git). Toda línea incluye:

`run_id, model_id, provider, case_id, prompt_hash, context_hash, status, latency_ms, input_tokens, output_tokens, total_tokens, error_code, response`

Los hashes SHA-256 permiten verificar que cada modelo recibió el mismo prompt y contexto por caso. Los campos de tokens son `null` cuando la API no los devuelve.

## Ejecución

Desde la raíz del repositorio, cuando esté autorizada una corrida:

```powershell
cd backend
.\node_modules\.bin\tsx.cmd ..\evals\model-comparison\run.ts --model gemini:gemini-3.1-flash-lite --model groq:llama-3.1-8b-instant --model openrouter:google/gemini-2.5-flash
```

Podés sustituir o repetir `--model` para comparar los IDs autorizados. No hay modelos por defecto: omitir `--model` falla antes de realizar solicitudes.

## Consolidación de la comparación formal

`consolidate.ts` consolida las tres corridas finales de siete casos para `openai/gpt-5.6-luna`, `anthropic/claude-sonnet-5` y `google/gemini-3.8-flash`. Genera `results/final-model-comparison-summary.json` con éxito por caso, latencia, tokens, errores y costo estimado.

Las tarifas configuradas son las documentadas por OpenRouter y verificadas el 2026-09-21: GPT-5.6 Luna ($0.20/M entrada, $1.20/M salida), Claude Sonnet 5 ($2/M, $10/M) y Gemini 3.8 Flash ($0.75/M, $3.75/M). El costo no incorpora caché, imágenes, audio ni herramientas.

```powershell
cd backend
.\node_modules\.bin\tsx.cmd ..\evals\model-comparison\consolidate.ts
```

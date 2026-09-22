import { appendFile, mkdir, readFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { buildTutorPromptFromRenderedContext } from "../../backend/src/services/promptService.js";
import {
  ProviderRequestError,
  providerIds,
  requestModel,
  type ProviderId
} from "./providers.js";

type EvaluationCase = {
  case_id: string;
  query: string;
  academic_context: string;
  history: [];
};

type ModelTarget = {
  provider: ProviderId;
  modelId: string;
};

type ResultRecord = {
  run_id: string;
  model_id: string;
  provider: ProviderId;
  case_id: string;
  prompt_hash: string;
  context_hash: string;
  status: "success" | "error";
  latency_ms: number;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  error_code: string | null;
  response: string | null;
};

const backendDirectory = process.cwd();
const comparisonDirectory = resolve(backendDirectory, "../evals/model-comparison");
const casesPath = resolve(comparisonDirectory, "cases.json");
const resultsDirectory = resolve(comparisonDirectory, "results");

const loadLocalApiKeys = async () => {
  const envFile = await readFile(resolve(backendDirectory, ".env"), "utf8");
  const permittedKeys = new Set([
    "GEMINI_API_KEY",
    "GROQ_API_KEY",
    "OPENROUTER_API_KEY"
  ]);

  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || !permittedKeys.has(match[1])) {
      continue;
    }

    process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
};

const hash = (value: string) =>
  createHash("sha256").update(value, "utf8").digest("hex");

const parseModelTargets = (args: string[]): ModelTarget[] => {
  const targets: ModelTarget[] = [];

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== "--model") {
      continue;
    }

    const target = args[index + 1];
    if (!target) {
      throw new Error("Falta un valor para --model.");
    }

    const separator = target.indexOf(":");
    const provider = target.slice(0, separator) as ProviderId;
    const modelId = target.slice(separator + 1);

    if (separator <= 0 || !providerIds.includes(provider) || !modelId) {
      throw new Error(
        "Cada --model debe tener el formato provider:model_id (gemini, groq u openrouter)."
      );
    }

    targets.push({ provider, modelId });
    index += 1;
  }

  if (targets.length === 0) {
    throw new Error("Indicá al menos un --model provider:model_id.");
  }

  return targets;
};

const parseCaseIds = (args: string[]) => {
  const caseIds: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== "--case") {
      continue;
    }

    const caseId = args[index + 1];
    if (!caseId) {
      throw new Error("Falta un valor para --case.");
    }

    caseIds.push(caseId);
    index += 1;
  }

  return caseIds;
};

const loadCases = async (): Promise<EvaluationCase[]> => {
  const cases = JSON.parse(await readFile(casesPath, "utf8")) as unknown;

  if (!Array.isArray(cases) || cases.length !== 7) {
    throw new Error("cases.json debe contener exactamente 7 casos.");
  }

  for (const item of cases) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof (item as EvaluationCase).case_id !== "string" ||
      typeof (item as EvaluationCase).query !== "string" ||
      typeof (item as EvaluationCase).academic_context !== "string" ||
      !Array.isArray((item as EvaluationCase).history) ||
      (item as EvaluationCase).history.length !== 0
    ) {
      throw new Error(
        "Cada caso requiere case_id, query, academic_context e history vacío."
      );
    }
  }

  return cases as EvaluationCase[];
};

const errorCodeFrom = (error: unknown) =>
  error instanceof ProviderRequestError ? error.code : "UNEXPECTED_ERROR";

const main = async () => {
  await loadLocalApiKeys();
  const args = process.argv.slice(2);
  const targets = parseModelTargets(args);
  const cases = await loadCases();
  const caseIds = parseCaseIds(args);
  const selectedCases =
    caseIds.length === 0
      ? cases
      : cases.filter((evaluationCase) => caseIds.includes(evaluationCase.case_id));

  if (caseIds.length > 0 && selectedCases.length !== caseIds.length) {
    throw new Error("Uno o más valores de --case no existen en cases.json.");
  }

  const runId = randomUUID();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsPath = resolve(resultsDirectory, `${timestamp}-${runId}.jsonl`);

  await mkdir(resultsDirectory, { recursive: true });

  for (const evaluationCase of selectedCases) {
    const prompt = buildTutorPromptFromRenderedContext({
      message: evaluationCase.query,
      academicContext: evaluationCase.academic_context,
      conversationHistory: "Sin historial previo."
    });
    const promptHash = hash(prompt);
    const contextHash = hash(evaluationCase.academic_context);

    for (const target of targets) {
      const startedAt = performance.now();
      let record: ResultRecord;

      try {
        const result = await requestModel(target.provider, target.modelId, prompt);
        record = {
          run_id: runId,
          model_id: target.modelId,
          provider: target.provider,
          case_id: evaluationCase.case_id,
          prompt_hash: promptHash,
          context_hash: contextHash,
          status: "success",
          latency_ms: Math.round(performance.now() - startedAt),
          input_tokens: result.inputTokens,
          output_tokens: result.outputTokens,
          total_tokens: result.totalTokens,
          error_code: null,
          response: result.response
        };
      } catch (error) {
        record = {
          run_id: runId,
          model_id: target.modelId,
          provider: target.provider,
          case_id: evaluationCase.case_id,
          prompt_hash: promptHash,
          context_hash: contextHash,
          status: "error",
          latency_ms: Math.round(performance.now() - startedAt),
          input_tokens: null,
          output_tokens: null,
          total_tokens: null,
          error_code: errorCodeFrom(error),
          response: null
        };
      }

      await appendFile(resultsPath, `${JSON.stringify(record)}\n`, "utf8");
    }
  }

  console.log(`Resultados: ${resultsPath}`);
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Error de configuración.";
  console.error(message);
  process.exitCode = 1;
});

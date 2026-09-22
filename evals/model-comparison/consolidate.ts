import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type ResultRecord = {
  model_id: string;
  provider: string;
  status: "success" | "error";
  latency_ms: number;
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
  error_code: string | null;
};

type FinalModel = {
  modelId: string;
  provider: "openrouter";
  files: string[];
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
  pricingSource: string;
  selected?: true;
};

const backendDirectory = process.cwd();
const resultsDirectory = resolve(backendDirectory, "../evals/model-comparison/results");

const finalModels: FinalModel[] = [
  {
    modelId: "openai/gpt-5.6-luna",
    provider: "openrouter",
    files: [
      "2026-09-22T00-12-07-804Z-6defafe2-d01a-4193-8c8d-47759525b146.jsonl",
      "2026-09-22T01-00-34-072Z-d8c2b63b-afcc-4d53-8356-6cf9a84c1d75.jsonl",
      "2026-09-22T01-00-57-413Z-efe5e162-e0a7-4c0f-bca5-5a649f28e7c8.jsonl"
    ],
    inputUsdPerMillion: 0.2,
    outputUsdPerMillion: 1.2,
    pricingSource: "https://openrouter.ai/openai/gpt-5.6-luna",
    selected: true
  },
  {
    modelId: "anthropic/claude-sonnet-5",
    provider: "openrouter",
    files: [
      "2026-09-21T23-41-20-162Z-c89b04bb-ab60-4de1-848b-80298091ff66.jsonl",
      "2026-09-22T01-09-00-348Z-f3245370-f6e5-4f55-950d-dc04a6641962.jsonl",
      "2026-09-22T01-15-16-948Z-a450cfa0-4003-4cff-bd45-4e9dd69f6d15.jsonl"
    ],
    inputUsdPerMillion: 2,
    outputUsdPerMillion: 10,
    pricingSource: "https://openrouter.ai/anthropic/claude-sonnet-5"
  },
  {
    modelId: "google/gemini-3.8-flash",
    provider: "openrouter",
    files: [
      "2026-09-22T01-17-17-189Z-3efd4a17-79a5-4714-961b-862bf7b4f787.jsonl",
      "2026-09-22T01-18-21-575Z-9044f5e8-6e82-493c-93e8-d3d7fb1fd2b3.jsonl",
      "2026-09-22T01-51-56-393Z-889b6f5f-0a5a-4af5-b308-a21085f48a42.jsonl"
    ],
    inputUsdPerMillion: 0.75,
    outputUsdPerMillion: 3.75,
    pricingSource: "https://openrouter.ai/google/gemini-3.8-flash"
  }
];

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const median = (values: number[]) => {
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);

  return ordered.length % 2 === 0
    ? (ordered[middle - 1] + ordered[middle]) / 2
    : ordered[middle];
};

const loadRows = async (file: string) => {
  const content = await readFile(resolve(resultsDirectory, file), "utf8");
  return content
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as ResultRecord);
};

const summarize = async (model: FinalModel) => {
  const rows = (await Promise.all(model.files.map(loadRows))).flat();

  if (
    rows.length !== 21 ||
    rows.some(
      (row) => row.model_id !== model.modelId || row.provider !== model.provider
    )
  ) {
    throw new Error(`Las corridas finales de ${model.modelId} no contienen 21 filas válidas.`);
  }

  const successes = rows.filter((row) => row.status === "success");
  const errors = rows.filter((row) => row.status === "error");
  if (successes.length !== 21) {
    throw new Error(`${model.modelId} no tiene 21/21 casos exitosos.`);
  }

  const latencies = rows.map((row) => row.latency_ms);
  const inputTokens = sum(
    rows.map((row) => row.input_tokens ?? 0)
  );
  const outputTokens = sum(
    rows.map((row) => row.output_tokens ?? 0)
  );
  const totalTokens = sum(
    rows.map((row) => row.total_tokens ?? 0)
  );
  const inputCostUsd = (inputTokens / 1_000_000) * model.inputUsdPerMillion;
  const outputCostUsd = (outputTokens / 1_000_000) * model.outputUsdPerMillion;

  return {
    model_id: model.modelId,
    provider: model.provider,
    selected_for_sti: model.selected ?? false,
    source_files: model.files,
    cases: { successful: successes.length, total: rows.length },
    latency_ms: {
      median: median(latencies),
      average: sum(latencies) / latencies.length
    },
    tokens_reported: {
      input: inputTokens,
      output: outputTokens,
      total: totalTokens,
      rows_with_all_token_counts: rows.filter(
        (row) =>
          row.input_tokens !== null &&
          row.output_tokens !== null &&
          row.total_tokens !== null
      ).length
    },
    errors: errors.map((row) => row.error_code),
    estimated_cost_usd: {
      input: inputCostUsd,
      output: outputCostUsd,
      total: inputCostUsd + outputCostUsd,
      rates_per_million_tokens: {
        input: model.inputUsdPerMillion,
        output: model.outputUsdPerMillion
      },
      pricing_source: model.pricingSource,
      pricing_checked_on: "2026-09-21"
    }
  };
};

const main = async () => {
  const models = await Promise.all(finalModels.map(summarize));
  const summary = {
    generated_at: new Date().toISOString(),
    selected_model: "openai/gpt-5.6-luna",
    methodology: "Tres corridas finales de siete casos cada una; ejecución secuencial.",
    models
  };

  await writeFile(
    resolve(resultsDirectory, "final-model-comparison-summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8"
  );
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Error de consolidación.");
  process.exitCode = 1;
});

import type { SupabaseClient } from "@supabase/supabase-js";

export type KnowledgeContext = {
  topics: {
    id: string;
    unit: string;
    topic: string;
    subtopic: string | null;
    difficulty: string;
    description: string;
    keywords: string[];
  }[];
  materials: {
    id: string;
    topic_id: string;
    title: string;
    content: string;
    source: string | null;
    type: string;
    difficulty: string;
  }[];
};

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractSearchTerms = (message: string, topic?: string) => {
  const base = normalizeSearchText(`${topic ?? ""} ${message}`);
  const terms = base
    .split(" ")
    .filter((term) => term.length >= 4)
    .slice(0, 8);

  return Array.from(new Set(terms));
};

export const findKnowledgeContext = async (
  supabase: SupabaseClient,
  message: string,
  topic?: string
): Promise<KnowledgeContext> => {
  const terms = extractSearchTerms(message, topic);

  if (terms.length === 0) {
    return { topics: [], materials: [] };
  }

  const orFilter = terms
    .map(
      (term) =>
        `topic.ilike.%${term}%,subtopic.ilike.%${term}%,description.ilike.%${term}%`
    )
    .join(",");

  const { data: topics } = await supabase
    .from("knowledge_topics")
    .select("id, unit, topic, subtopic, difficulty, description, keywords")
    .or(orFilter)
    .limit(5);

  const topicRows = (topics ?? []) as KnowledgeContext["topics"];
  const topicIds = topicRows.map((item) => item.id);

  if (topicIds.length === 0) {
    return { topics: [], materials: [] };
  }

  const { data: materials } = await supabase
    .from("academic_materials")
    .select("id, topic_id, title, content, source, type, difficulty")
    .in("topic_id", topicIds)
    .limit(6);

  return {
    topics: topicRows,
    materials: (materials ?? []) as KnowledgeContext["materials"]
  };
};

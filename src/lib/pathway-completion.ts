import { isPathway, type Pathway } from "@/lib/pathways";

export const PATHWAY_COMPLETION_STORAGE_KEY = "dreadfulCompletedPathways";
export const PATHWAY_COMPLETION_EVENT = "dreadful:pathway-completion-changed";

function getWindow() {
  return typeof window === "undefined" ? null : window;
}

export function readCompletedPathways(): Set<Pathway> {
  const browserWindow = getWindow();
  if (!browserWindow) return new Set();

  try {
    const stored = browserWindow.localStorage.getItem(PATHWAY_COMPLETION_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(parsed)) return new Set();

    return new Set(parsed.filter(isPathway));
  } catch {
    return new Set();
  }
}

export function markPathwayComplete(pathway: Pathway) {
  const browserWindow = getWindow();
  if (!browserWindow) return;

  const completed = readCompletedPathways();
  if (completed.has(pathway)) return;

  completed.add(pathway);
  const nextValue = [...completed];
  browserWindow.localStorage.setItem(
    PATHWAY_COMPLETION_STORAGE_KEY,
    JSON.stringify(nextValue)
  );
  browserWindow.dispatchEvent(
    new CustomEvent(PATHWAY_COMPLETION_EVENT, {
      detail: { pathway, completed: nextValue },
    })
  );
}

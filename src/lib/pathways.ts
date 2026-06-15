export type Pathway = "denial" | "bargaining" | "anger" | "tender";

export function isPathway(value: unknown): value is Pathway {
  return (
    value === "denial" ||
    value === "bargaining" ||
    value === "anger" ||
    value === "tender"
  );
}

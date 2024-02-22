export function safeJSONParse(jsonString: unknown): unknown | null {
  if (typeof jsonString !== "string") {
    return null;
  }

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return null;
  }
}

export function calculateWordCount(content: string): number {
  if (!content || typeof content !== "string") {
    return 0;
  }

  // Remove HTML tags, entities, and normalize whitespace
  const plainText = content
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&[^;]+;/g, "") // Remove HTML entities like &nbsp;, &amp;, etc.
    .replace(/\s+/g, " ") // Normalize multiple whitespaces to single space
    .trim();

  if (!plainText) {
    return 0;
  }

  // Split by whitespace and filter out empty strings
  return plainText.split(" ").filter((word) => word.length > 0).length;
}

export function validateWordCountRange(
  wordCount: number,
  content: string
): boolean {
  const calculatedCount = calculateWordCount(content);
  // Allow reasonable variance (±10% or minimum 5 words difference)
  const tolerance = Math.max(Math.ceil(calculatedCount * 0.1), 5);
  return Math.abs(calculatedCount - wordCount) <= tolerance;
}

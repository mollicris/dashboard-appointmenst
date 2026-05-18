// Color palette for services (cycling through 12 distinct colors)
const COLOR_PALETTE = [
  { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" }, // Blue
  { bg: "#dcfce7", text: "#166534", border: "#22c55e" }, // Green
  { bg: "#fce7f3", text: "#831843", border: "#ec4899" }, // Pink
  { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" }, // Amber
  { bg: "#e9d5ff", text: "#581c87", border: "#a855f7" }, // Purple
  { bg: "#cffafe", text: "#164e63", border: "#06b6d4" }, // Cyan
  { bg: "#fee2e2", text: "#7f1d1d", border: "#ef4444" }, // Red
  { bg: "#f0fdf4", text: "#15803d", border: "#65a30d" }, // Lime
  { bg: "#fef9c3", text: "#713f12", border: "#eab308" }, // Yellow
  { bg: "#f3e8ff", text: "#6b21a8", border: "#d946ef" }, // Violet
  { bg: "#fecdd3", text: "#831f1f", border: "#f97316" }, // Orange
  { bg: "#e0f2fe", text: "#0c4a6e", border: "#0284c7" }, // Sky
] as const;

/**
 * Get a consistent color for a service based on its ID.
 * Same serviceId always returns the same color.
 */
export function getServiceColor(serviceId: string): { bg: string; text: string; border: string } {
  // Use serviceId hash to pick a consistent color
  let hash = 0;
  for (let i = 0; i < serviceId.length; i++) {
    hash = ((hash << 5) - hash) + serviceId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  const color = COLOR_PALETTE[index];
  if (!color) throw new Error("Unexpected: COLOR_PALETTE index out of bounds");
  return color;
}

/**
 * Get the Tailwind class string for a service color.
 * Useful for inline styling.
 */
export function getServiceColorClass(serviceId: string): {
  bg: string;
  text: string;
  border: string;
} {
  return getServiceColor(serviceId);
}

const marks = new Map<string, number>();
const order: string[] = [];

export function mark(label: string): void {
  marks.set(label, performance.now());
  order.push(label);
}

export function report(): void {
  if (order.length === 0) return;
  const lines: string[] = ["\n=== Server Startup Breakdown ==="];
  const start = marks.get(order[0]) ?? 0;
  for (let i = 0; i < order.length; i++) {
    const label = order[i];
    const t = marks.get(label)!;
    const delta = i === 0 ? 0 : t - marks.get(order[i - 1])!;
    lines.push(`${label}: +${delta.toFixed(0)}ms (total ${(t - start).toFixed(0)}ms)`);
  }
  console.log(lines.join("\n"));
}

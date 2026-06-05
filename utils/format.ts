export function compactCount(value: number): string {
  if (!Number.isFinite(value)) {
    return '0';
  }

  const absoluteValue = Math.max(0, Math.trunc(value));
  const units = [
    { value: 1_000_000_000, suffix: 'B' },
    { value: 1_000_000, suffix: 'M' },
    { value: 1_000, suffix: 'K' },
  ];

  for (const unit of units) {
    if (absoluteValue >= unit.value) {
      const compact = Math.floor((absoluteValue / unit.value) * 10) / 10;
      const formatted = Number.isInteger(compact) ? `${compact}` : compact.toFixed(1);
      const plus = absoluteValue % unit.value === 0 ? '' : '+';
      return `${formatted}${unit.suffix}${plus}`;
    }
  }

  return `${absoluteValue}`;
}

export function labelForCount(count: number, one: string, other: string): string {
  return count <= 1 ? one : other;
}

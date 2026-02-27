export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateImportData(data: unknown): ValidationResult {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid JSON structure'] };
  }
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.notes)) errors.push('Missing or invalid "notes" array');
  if (!Array.isArray(d.routines)) errors.push('Missing or invalid "routines" array');
  if (!Array.isArray(d.records)) errors.push('Missing or invalid "records" array');
  if (!Array.isArray(d.labels)) errors.push('Missing or invalid "labels" array');
  return { valid: errors.length === 0, errors };
}

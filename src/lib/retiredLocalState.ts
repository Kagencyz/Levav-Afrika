const RETIRED_LOCAL_STORAGE_KEYS = [
  // WP-0003 / PDR-0009: remove when no supported client can still carry this prototype score.
  'wri_score',
  // WP-0001 Amendment A1 / PDR-0009: remove when no supported client can still carry this inert audit log.
  'levav_audit_log',
] as const;

/**
 * Removes retired prototype state once per application load.
 *
 * Removal condition: delete this module only after Product Command records that
 * no supported client can still carry any key in RETIRED_LOCAL_STORAGE_KEYS.
 */
export function clearRetiredLocalState(storage: Pick<Storage, 'removeItem'> = localStorage): void {
  for (const key of RETIRED_LOCAL_STORAGE_KEYS) storage.removeItem(key);
}

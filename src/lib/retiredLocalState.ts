/**
 * Clear retired browser-only stores once per application load.
 *
 * WP-0001 retired `levav_audit_log`; WP-0003 retired `wri_score`. Later packets add their keys here rather
 * than creating competing cleanup paths. Remove this module only after a
 * recorded product decision confirms no supported client can carry any key.
 */
const RETIRED_LOCAL_STORAGE_KEYS = ['levav_audit_log', 'wri_score'] as const;

export function clearRetiredLocalState(storage: Pick<Storage, 'removeItem'> = localStorage): void {
  RETIRED_LOCAL_STORAGE_KEYS.forEach((key) => storage.removeItem(key));
}

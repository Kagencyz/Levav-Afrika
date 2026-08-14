import { describe, expect, it, vi } from 'vitest';
import { clearRetiredLocalState } from './retiredLocalState';

describe('clearRetiredLocalState', () => {
  it('removes the retired client-side audit log without introducing another key', () => {
    const removeItem = vi.fn();

    clearRetiredLocalState({ removeItem });

    expect(removeItem).toHaveBeenCalledTimes(2);
    expect(removeItem).toHaveBeenCalledWith('levav_audit_log');
    expect(removeItem).toHaveBeenCalledWith('wri_score');
  });
});

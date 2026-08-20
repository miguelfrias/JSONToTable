import { describe, it, expect } from 'vitest';
import { getSnapshotIdFromUrl, getSnapshotShareUrl } from '../utils/routerHelper';

describe('routerHelper', () => {
  it('extracts snapshot ID from window.location.hash format #/v/<uuid>', () => {
    window.location.hash = '#/v/55d65c0b-9dde-4adb-b20f-c06e94c4692d';
    const id = getSnapshotIdFromUrl();
    expect(id).toBe('55d65c0b-9dde-4adb-b20f-c06e94c4692d');
  });

  it('generates shareable snapshot URL with #/v/<uuid>', () => {
    const url = getSnapshotShareUrl('55d65c0b-9dde-4adb-b20f-c06e94c4692d');
    expect(url).toContain('#/v/55d65c0b-9dde-4adb-b20f-c06e94c4692d');
  });
});

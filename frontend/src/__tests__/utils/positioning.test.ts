import { describe, it, expect } from 'vitest';
import { interpolatePosition } from '@/utils/positioning';

describe('interpolatePosition', () => {
  // ─── No-op cases ──────────────────────────────────────────────────────────

  it('returns same position when speed is zero', () => {
    const [lat, lng] = interpolatePosition(40, -74, 90, 0, 10);
    expect(lat).toBe(40);
    expect(lng).toBe(-74);
  });

  it('returns same position when speed is negative', () => {
    const [lat, lng] = interpolatePosition(40, -74, 90, -50, 10);
    expect(lat).toBe(40);
    expect(lng).toBe(-74);
  });

  it('returns same position when dt is zero', () => {
    const [lat, lng] = interpolatePosition(40, -74, 90, 100, 0);
    expect(lat).toBe(40);
    expect(lng).toBe(-74);
  });

  it('returns same position when dt is negative', () => {
    const [lat, lng] = interpolatePosition(40, -74, 90, 100, -5);
    expect(lat).toBe(40);
    expect(lng).toBe(-74);
  });

  // ─── Cardinal directions ─────────────────────────────────────────────────

  it('moves north when heading is 0°', () => {
    const [lat, lng] = interpolatePosition(40, -74, 0, 100, 10);
    expect(lat).toBeGreaterThan(40);
    expect(lng).toBeCloseTo(-74, 4); // longitude should barely change
  });

  it('moves south when heading is 180°', () => {
    const [lat, lng] = interpolatePosition(40, -74, 180, 100, 10);
    expect(lat).toBeLessThan(40);
    expect(lng).toBeCloseTo(-74, 4);
  });

  it('moves east when heading is 90°', () => {
    const [lat, lng] = interpolatePosition(40, -74, 90, 100, 10);
    expect(lat).toBeCloseTo(40, 4);
    expect(lng).toBeGreaterThan(-74);
  });

  it('moves west when heading is 270°', () => {
    const [lat, lng] = interpolatePosition(40, -74, 270, 100, 10);
    expect(lat).toBeCloseTo(40, 4);
    expect(lng).toBeLessThan(-74);
  });

  // ─── Distance proportionality ────────────────────────────────────────────

  it('doubles distance when speed doubles', () => {
    const [lat1] = interpolatePosition(0, 0, 0, 100, 10);
    const [lat2] = interpolatePosition(0, 0, 0, 200, 10);
    const dist1 = lat1; // distance from origin going north
    const dist2 = lat2;
    expect(dist2).toBeCloseTo(dist1 * 2, 4);
  });

  it('doubles distance when time doubles', () => {
    const [lat1] = interpolatePosition(0, 0, 0, 100, 10);
    const [lat2] = interpolatePosition(0, 0, 0, 100, 20);
    const dist1 = lat1;
    const dist2 = lat2;
    expect(dist2).toBeCloseTo(dist1 * 2, 4);
  });

  // ─── Clamping ────────────────────────────────────────────────────────────

  it('clamps time to maxDt (prevents drift on stale data)', () => {
    // maxDt=65 by default, so dt=1000 should give same result as dt=65
    const [lat1] = interpolatePosition(0, 0, 0, 100, 65);
    const [lat2] = interpolatePosition(0, 0, 0, 100, 1000);
    expect(lat1).toBeCloseTo(lat2, 6);
  });

  it('clamps distance to maxDist when specified', () => {
    // At 100 knots for 60 seconds = ~3086m, maxDist=1000 should cap it
    const [lat1] = interpolatePosition(0, 0, 0, 100, 60, 1000);
    const [lat2] = interpolatePosition(0, 0, 0, 100, 60, 0); // no cap
    expect(lat1).toBeLessThan(lat2);
  });

  // ─── Known calculation ───────────────────────────────────────────────────

  it('produces correct magnitude for known speed/time', () => {
    // 1 knot = 1 NM/hr = 1852 m/hr ≈ 0.5144 m/s
    // 100 knots for 10 seconds = 514.4 meters
    // At equator, 1° lat ≈ 111,320m, so 514.4m ≈ 0.00462°
    const [lat] = interpolatePosition(0, 0, 0, 100, 10);
    const expectedDegrees = (100 * 0.5144 * 10) / 111320;
    expect(lat).toBeCloseTo(expectedDegrees, 4);
  });

  // ─── Edge cases ──────────────────────────────────────────────────────────

  it('handles positions near the poles', () => {
    const [lat, lng] = interpolatePosition(89.9, 0, 0, 10, 5);
    expect(lat).toBeGreaterThan(89.9);
    expect(Number.isFinite(lat)).toBe(true);
    expect(Number.isFinite(lng)).toBe(true);
  });

  it('handles positions near the dateline', () => {
    const [lat, lng] = interpolatePosition(0, 179.99, 90, 100, 10);
    expect(Number.isFinite(lat)).toBe(true);
    expect(Number.isFinite(lng)).toBe(true);
  });
});

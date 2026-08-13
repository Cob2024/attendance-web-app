// ============================================================
// Device Fingerprint Service
// Generates a stable browser fingerprint for device binding.
// Combines multiple browser signals into a single hash string.
// ============================================================

/**
 * Generate a simple hash from a string using djb2 algorithm.
 * Returns a hex string.
 */
const hashString = (str: string): string => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to unsigned and then to hex
  return (hash >>> 0).toString(16).padStart(8, '0');
};

/**
 * Generate a canvas fingerprint by rendering text and shapes,
 * then hashing the resulting data URL.
 */
const getCanvasFingerprint = (): string => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    // Draw text with specific styles
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('TTU Attendance 🎓', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Device Fingerprint', 4, 35);

    const dataUrl = canvas.toDataURL();
    return hashString(dataUrl);
  } catch {
    return 'canvas-error';
  }
};

/**
 * Collect browser signals and combine them into a fingerprint.
 */
const collectSignals = (): string[] => {
  const signals: string[] = [];

  // User agent
  signals.push(navigator.userAgent || 'unknown-ua');

  // Screen properties
  signals.push(`${screen.width}x${screen.height}x${screen.colorDepth}`);
  signals.push(`${screen.availWidth}x${screen.availHeight}`);

  // Language
  signals.push(navigator.language || 'unknown-lang');

  // Hardware concurrency (number of CPU cores)
  signals.push(`cores:${navigator.hardwareConcurrency || 'unknown'}`);

  // Timezone
  try {
    signals.push(Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown-tz');
  } catch {
    signals.push('unknown-tz');
  }

  // Platform
  signals.push((navigator as any).platform || 'unknown-platform');

  // Canvas fingerprint
  signals.push(`canvas:${getCanvasFingerprint()}`);

  // WebGL renderer (if available)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        signals.push(`gl:${renderer}`);
      }
    }
  } catch {
    signals.push('gl:unknown');
  }

  // Touch support
  signals.push(`touch:${navigator.maxTouchPoints || 0}`);

  return signals;
};

/**
 * Generate a device fingerprint string.
 * This combines multiple browser signals into a single deterministic hash.
 */
export const generateDeviceFingerprint = (): string => {
  const signals = collectSignals();
  const combined = signals.join('|');
  
  // Create a multi-part hash for more uniqueness
  const hash1 = hashString(combined);
  const hash2 = hashString(combined.split('').reverse().join(''));
  const hash3 = hashString(combined + combined);
  
  return `${hash1}-${hash2}-${hash3}`;
};

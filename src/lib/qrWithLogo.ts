import { GOOGLE_QR_CENTER_LOGO, GOOGLE_QR_REMOTE_URL } from '../constants/qrLogo';

/**
 * Composites the official Google / brand logo into the dead-center of a QR code.
 * Uses high-error-correction safe margins (20-22% dimension) with a clean white rounded shield,
 * subtle border, and soft drop shadow.
 */
export async function createQrWithCenterLogo(
  baseQrDataUrl: string,
  customLogoUrl?: string,
  targetSize: number = 1024
): Promise<string> {
  if (typeof window === 'undefined') return baseQrDataUrl;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseQrDataUrl;

    // 1. Load & draw base QR code
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => reject(new Error('Failed to load QR image'));
      qrImg.src = baseQrDataUrl;
    });

    ctx.drawImage(qrImg, 0, 0, targetSize, targetSize);

    // 2. Load center logo (try remote URL, fallback to local base64)
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';

    const loadPromise = new Promise<void>((resolve) => {
      logoImg.onload = () => resolve();
      logoImg.onerror = () => {
        // Fallback to embedded base64 if remote fails or has CORS issues
        if (logoImg.src !== GOOGLE_QR_CENTER_LOGO) {
          logoImg.src = GOOGLE_QR_CENTER_LOGO;
        } else {
          resolve();
        }
      };
      logoImg.src = customLogoUrl || GOOGLE_QR_REMOTE_URL;
    });

    await loadPromise;

    // 3. Composite Center Shield & Logo
    const cx = targetSize / 2;
    const cy = targetSize / 2;
    // 22% of QR code is optimal for Level H (30% error correction)
    // Keep badgeSize identical while enlarging the logo inside to fill the container
    const badgeSize = Math.round(targetSize * 0.22);
    const radius = Math.round(badgeSize * 0.20);
    const padding = Math.round(badgeSize * 0.04);
    const logoSize = badgeSize - padding * 2;

    // Draw white protective rounded badge
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
    ctx.shadowBlur = Math.round(targetSize * 0.015);
    ctx.shadowOffsetY = Math.round(targetSize * 0.005);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cx - badgeSize / 2, cy - badgeSize / 2, badgeSize, badgeSize, radius);
    ctx.fill();

    // Subtle border for crisp definition against light modules
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#dadce0';
    ctx.lineWidth = Math.max(3, Math.round(targetSize * 0.004));
    ctx.stroke();
    ctx.restore();

    // Draw logo inside badge
    if (logoImg.width && logoImg.height) {
      ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
    }

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Error compositing QR code with center logo:', err);
    return baseQrDataUrl;
  }
}

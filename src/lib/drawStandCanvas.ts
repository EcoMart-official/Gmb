import { StandTemplate } from '../components/dashboard/ReviewLinkTab';
import { BusinessSettings } from '../types';
import { GOOGLE_QR_CENTER_LOGO, GOOGLE_QR_REMOTE_URL } from '../constants/qrLogo';

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

async function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Draws the high-res QR code and explicitly stamps the Google center logo with protective rounded shield
 */
async function drawQrWithCenterLogo(
  ctx: CanvasRenderingContext2D,
  qrDataUrl: string,
  qrX: number,
  qrY: number,
  qrSize: number
) {
  const qrImg = await loadImg(qrDataUrl);
  if (qrImg) {
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  }

  // Stamp Center Logo with Protective White Badge
  let centerLogoImg = await loadImg(GOOGLE_QR_REMOTE_URL);
  if (!centerLogoImg) {
    centerLogoImg = await loadImg(GOOGLE_QR_CENTER_LOGO);
  }

  if (centerLogoImg) {
    const cx = qrX + qrSize / 2;
    const cy = qrY + qrSize / 2;
    // Keep badgeSize identical while enlarging the logo inside to fill the container
    const badgeSize = Math.round(qrSize * 0.22);
    const radius = Math.round(badgeSize * 0.20);
    const padding = Math.round(badgeSize * 0.04);
    const logoDrawSize = badgeSize - padding * 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cx - badgeSize / 2, cy - badgeSize / 2, badgeSize, badgeSize, radius);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#dadce0';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    ctx.drawImage(centerLogoImg, cx - logoDrawSize / 2, cy - logoDrawSize / 2, logoDrawSize, logoDrawSize);
  }
}

/**
 * High-Resolution (1200 x 1800 px) Canvas Generator supporting 10 distinct layouts
 */
export async function renderStandToCanvas(
  canvas: HTMLCanvasElement,
  template: StandTemplate,
  settings: BusinessSettings,
  qrDataUrl: string
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const width = 1200;
  const height = 1800;
  canvas.width = width;
  canvas.height = height;

  const bizName = settings.businessName || 'Your Business';
  const logo = settings.businessLogo ? await loadImg(settings.businessLogo) : null;

  // -------------------------------------------------------------
  // 1. OFFICIAL GOOGLE CANOPY & CARD
  // -------------------------------------------------------------
  if (template.layoutType === 'official-google') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Outer border
    ctx.strokeStyle = '#dadce0';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Google 4-Color Stripe
    const segW = (width - 72) / 4;
    ctx.fillStyle = '#4285f4'; ctx.fillRect(36, 36, segW, 24);
    ctx.fillStyle = '#ea4335'; ctx.fillRect(36 + segW, 36, segW, 24);
    ctx.fillStyle = '#fbbc05'; ctx.fillRect(36 + segW * 2, 36, segW, 24);
    ctx.fillStyle = '#34a853'; ctx.fillRect(36 + segW * 3, 36, segW, 24);

    let y = 140;

    // Google Canopy Pill Badge
    const badgeW = 600;
    const badgeH = 70;
    const badgeX = (width - badgeW) / 2;
    ctx.fillStyle = '#e8f0fe';
    ctx.beginPath();
    ctx.roundRect(badgeX, y, badgeW, badgeH, 35);
    ctx.fill();
    ctx.strokeStyle = '#d2e3fc';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#1a73e8';
    ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOOGLE BUSINESS REVIEWS', width / 2, y + 46);
    y += 110;

    // Logo if present
    if (logo) {
      const logoSize = 130;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#dadce0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(width / 2 - logoSize / 2, y, logoSize, logoSize, 20);
      ctx.fill();
      ctx.stroke();
      ctx.drawImage(logo, width / 2 - logoSize / 2 + 10, y + 10, logoSize - 20, logoSize - 20);
      y += logoSize + 30;
    }

    // Business Name
    ctx.fillStyle = '#202124';
    ctx.font = 'bold 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(bizName, width / 2, y);
    y += 65;

    // 5 Stars in Google Yellow
    const starSize = 44;
    const starGap = 16;
    const totalStarsW = 5 * starSize + 4 * starGap;
    let starX = (width - totalStarsW) / 2;
    ctx.fillStyle = '#fbbc04';
    for (let i = 0; i < 5; i++) {
      drawStar(ctx, starX + starSize / 2, y, 5, starSize / 2, starSize / 4);
      starX += starSize + starGap;
    }
    y += 65;

    // QR Box
    const qrBoxSize = 700;
    const qrX = (width - qrBoxSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#dadce0';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(qrX - 25, y - 25, qrBoxSize + 50, qrBoxSize + 50, 30);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qrX, y, qrBoxSize);
    y += qrBoxSize + 75;

    // Footer
    ctx.fillStyle = '#202124';
    ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Scan with your phone to review us!', width / 2, y);
    y += 50;

    ctx.fillStyle = '#5f6368';
    ctx.font = '30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Draft your review with AI in 10 seconds • Direct Google Maps', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 2. MODERN SPLIT-HERO PODIUM
  // -------------------------------------------------------------
  if (template.layoutType === 'split-hero') {
    // 38% Dark Header
    const splitY = 660;
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, width, splitY);

    // 62% Crisp White Base
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, splitY, width, height - splitY);

    // Border Frame
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    // Top Neon Pill Badge
    let y = 120;
    const pillW = 500;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect((width - pillW) / 2, y, pillW, 60, 30);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AI POWERED REVIEW PORTAL', width / 2, y + 40);
    y += 110;

    // Business Name on Dark
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(bizName, width / 2, y);
    y += 65;

    // 5 Glowing Stars
    ctx.fillStyle = '#38bdf8';
    const starSize = 42;
    const totalStarsW = 5 * starSize + 4 * 16;
    let starX = (width - totalStarsW) / 2;
    for (let i = 0; i < 5; i++) {
      drawStar(ctx, starX + starSize / 2, y, 5, starSize / 2, starSize / 4);
      starX += starSize + 16;
    }

    // Elevated QR Pedestal on Split Boundary
    const qrBoxSize = 720;
    const qrX = (width - qrBoxSize) / 2;
    const qrPedestalY = splitY - 140;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 15;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(qrX - 30, qrPedestalY - 30, qrBoxSize + 60, qrBoxSize + 60, 40);
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qrX, qrPedestalY, qrBoxSize);

    // Subtitle on Base
    y = qrPedestalY + qrBoxSize + 90;
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Point Camera to Review Us', width / 2, y);
    y += 55;

    ctx.fillStyle = '#64748b';
    ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Instant AI Review Assistance • Verified Google Maps', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 3. LUXURY GOLD CREST & ORNATE FRAME
  // -------------------------------------------------------------
  if (template.layoutType === 'luxury-crest') {
    ctx.fillStyle = '#0a1128';
    ctx.fillRect(0, 0, width, height);

    // Outer double gold border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    let y = 160;
    // Gold Ribbon Header
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('— EXCELLENCE & REPUTATION —', width / 2, y);
    y += 90;

    // Logo / Crest
    if (logo) {
      const size = 130;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(width / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.drawImage(logo, width / 2 - size / 2 + 15, y + 15, size - 30, size - 30);
      y += size + 35;
    }

    // Business Name in Serif
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px Georgia, serif';
    ctx.fillText(bizName, width / 2, y);
    y += 65;

    // Gold Stars
    ctx.fillStyle = '#f59e0b';
    const starSize = 44;
    const totalW = 5 * starSize + 4 * 16;
    let sx = (width - totalW) / 2;
    for (let i = 0; i < 5; i++) {
      drawStar(ctx, sx + starSize / 2, y, 5, starSize / 2, starSize / 4);
      sx += starSize + 16;
    }
    y += 85;

    // Luxury QR Frame
    const qrSize = 680;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(qx - 30, y - 30, qrSize + 60, qrSize + 60, 24);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 90;

    ctx.fillStyle = '#fde68a';
    ctx.font = 'italic bold 40px Georgia, serif';
    ctx.fillText('Your Experience is Our Greatest Honor', width / 2, y);
    y += 50;

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '28px Georgia, serif';
    ctx.fillText('Scan with smartphone • Draft review with AI in 10s', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 4. SCANDINAVIAN ARCHITECTURAL NOIR
  // -------------------------------------------------------------
  if (template.layoutType === 'scandi-minimal') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Thick Solid Black Border with Inner Hairline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 16;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 2;
    ctx.strokeRect(65, 65, width - 130, height - 130);

    let y = 170;
    ctx.fillStyle = '#52525b';
    ctx.font = 'bold 26px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[ RATE YOUR EXPERIENCE // DIRECT PORTAL ]', width / 2, y);
    y += 90;

    // Business Name
    ctx.fillStyle = '#000000';
    ctx.font = '900 68px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(bizName.toUpperCase(), width / 2, y);
    y += 70;

    // Solid Black Geometric Stars
    ctx.fillStyle = '#000000';
    const starSize = 46;
    const totalW = 5 * starSize + 4 * 20;
    let sx = (width - totalW) / 2;
    for (let i = 0; i < 5; i++) {
      drawStar(ctx, sx + starSize / 2, y, 5, starSize / 2, starSize / 4);
      sx += starSize + 20;
    }
    y += 90;

    // Stark Square QR Box with 4 Corner L-Brackets
    const qrSize = 700;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(qx - 20, y - 20, qrSize + 40, qrSize + 40);

    // Corner L-brackets
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    const bLen = 50;
    // Top-left
    ctx.beginPath(); ctx.moveTo(qx - 40, y - 40 + bLen); ctx.lineTo(qx - 40, y - 40); ctx.lineTo(qx - 40 + bLen, y - 40); ctx.stroke();
    // Top-right
    ctx.beginPath(); ctx.moveTo(qx + qrSize + 40 - bLen, y - 40); ctx.lineTo(qx + qrSize + 40, y - 40); ctx.lineTo(qx + qrSize + 40, y - 40 + bLen); ctx.stroke();
    // Bottom-left
    ctx.beginPath(); ctx.moveTo(qx - 40, y + qrSize + 40 - bLen); ctx.lineTo(qx - 40, y + qrSize + 40); ctx.lineTo(qx - 40 + bLen, y + qrSize + 40); ctx.stroke();
    // Bottom-right
    ctx.beginPath(); ctx.moveTo(qx + qrSize + 40 - bLen, y + qrSize + 40); ctx.lineTo(qx + qrSize + 40, y + qrSize + 40); ctx.lineTo(qx + qrSize + 40, y + qrSize + 40 - bLen); ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 95;

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('INSTANT MOBILE REVIEW', width / 2, y);
    y += 45;

    ctx.fillStyle = '#71717a';
    ctx.font = '28px "Courier New", monospace';
    ctx.fillText('Fast AI Review Assistant • Google Maps', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 5. EMERALD ECO & WELLNESS CAPSULE
  // -------------------------------------------------------------
  if (template.layoutType === 'emerald-wellness') {
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 10;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    let y = 160;
    // Pill Badge
    const pillW = 560;
    ctx.fillStyle = '#dcfce7';
    ctx.strokeStyle = '#bbf7d0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect((width - pillW) / 2, y, pillW, 64, 32);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#15803d';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VERIFIED CLIENT CARE & WELLNESS', width / 2, y + 42);
    y += 120;

    // Business Name
    ctx.fillStyle = '#064e3b';
    ctx.font = 'bold 58px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(bizName, width / 2, y);
    y += 65;

    // Emerald Stars
    ctx.fillStyle = '#10b981';
    const starSize = 44;
    const totalW = 5 * starSize + 4 * 16;
    let sx = (width - totalW) / 2;
    for (let i = 0; i < 5; i++) {
      drawStar(ctx, sx + starSize / 2, y, 5, starSize / 2, starSize / 4);
      sx += starSize + 16;
    }
    y += 85;

    // Pebble Smooth Rounded QR Container
    const qrSize = 680;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(qx - 30, y - 30, qrSize + 60, qrSize + 60, 50);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 90;

    ctx.fillStyle = '#064e3b';
    ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Share Your Experience With Our Community', width / 2, y);
    y += 50;

    ctx.fillStyle = '#047857';
    ctx.font = '30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Scan with smartphone camera to review in 10 seconds', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 6. VINTAGE BISTRO & WOODCRAFT STITCH
  // -------------------------------------------------------------
  if (template.layoutType === 'artisan-vintage') {
    ctx.fillStyle = '#fefce8';
    ctx.fillRect(0, 0, width, height);

    // Dashed Stitched Border
    ctx.save();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 8;
    ctx.setLineDash([20, 12]);
    ctx.strokeRect(45, 45, width - 90, height - 90);
    ctx.restore();

    let y = 170;
    // Circular Retro Badge Banner
    ctx.fillStyle = '#ca8a04';
    ctx.font = 'bold 32px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ ARTISAN CRAFT & LOCAL SERVICE ★', width / 2, y);
    y += 90;

    // Business Name
    ctx.fillStyle = '#422006';
    ctx.font = 'bold 60px Georgia, serif';
    ctx.fillText(bizName, width / 2, y);
    y += 65;

    // Stars with dashes
    ctx.fillStyle = '#ca8a04';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText('— ★ ★ ★ ★ ★ —', width / 2, y + 10);
    y += 85;

    // QR Box
    const qrSize = 680;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 30);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 90;

    ctx.fillStyle = '#422006';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText('Loved Your Visit? Review Us!', width / 2, y);
    y += 50;

    ctx.fillStyle = '#713f12';
    ctx.font = '30px Georgia, serif';
    ctx.fillText('We appreciate your friendly local support • Google Reviews', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 7. CYBERPUNK HUD & NEON TERMINAL
  // -------------------------------------------------------------
  if (template.layoutType === 'cyber-hud') {
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, width, height);

    // Cyber Neon Border
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    let y = 140;
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 28px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('/// SYSTEM READY // SCAN TO REVIEW', width / 2, y);
    y += 100;

    // Business Name
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 64px "Courier New", monospace';
    ctx.fillText(bizName, width / 2, y);
    y += 65;

    // Cyan Stars
    ctx.fillStyle = '#06b6d4';
    const starSize = 44;
    const totalW = 5 * starSize + 4 * 16;
    let sx = (width - totalW) / 2;
    for (let i = 0; i < 5; i++) {
      drawStar(ctx, sx + starSize / 2, y, 5, starSize / 2, starSize / 4);
      sx += starSize + 16;
    }
    y += 85;

    // Neon Frame QR
    const qrSize = 680;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 24);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 90;

    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 44px "Courier New", monospace';
    ctx.fillText('POINT CAMERA TO REVIEW', width / 2, y);
    y += 50;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '28px "Courier New", monospace';
    ctx.fillText('GEMINI 3.8 AI REVIEW GENERATOR // GOOGLE MAPS', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 8. ROSE VELVET & GLAMOUR ARCH
  // -------------------------------------------------------------
  if (template.layoutType === 'rose-boutique') {
    ctx.fillStyle = '#fdf2f8';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 10;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    let y = 160;
    ctx.fillStyle = '#db2777';
    ctx.font = 'bold 32px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ LOVE YOUR EXPERIENCE? ✨', width / 2, y);
    y += 90;

    ctx.fillStyle = '#831843';
    ctx.font = 'bold 58px Georgia, serif';
    ctx.fillText(bizName, width / 2, y);
    y += 65;

    // Stars
    ctx.fillStyle = '#f59e0b';
    const starSize = 44;
    const totalW = 5 * starSize + 4 * 16;
    let sx = (width - totalW) / 2;
    for (let i = 0; i < 5; i++) {
      drawStar(ctx, sx + starSize / 2, y, 5, starSize / 2, starSize / 4);
      sx += starSize + 16;
    }
    y += 85;

    // Pill Rounded QR Box
    const qrSize = 680;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 40);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 90;

    ctx.fillStyle = '#831843';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText('Scan to Share Your Glow', width / 2, y);
    y += 50;

    ctx.fillStyle = '#db2777';
    ctx.font = '30px Georgia, serif';
    ctx.fillText('Review us on Google Maps in 10 seconds with AI', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 9. DYNAMIC SUNSET BURST (ANGLED HEADER)
  // -------------------------------------------------------------
  if (template.layoutType === 'dynamic-burst') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Diagonal angled header banner
    const grad = ctx.createLinearGradient(0, 0, width, 400);
    grad.addColorStop(0, '#ea580c');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(1, '#ef4444');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.lineTo(width, 420);
    ctx.lineTo(0, 480);
    ctx.closePath();
    ctx.fill();

    let y = 140;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    const pillW = 500;
    ctx.beginPath();
    ctx.roundRect((width - pillW) / 2, y, pillW, 60, 30);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔥 AWESOME EXPERIENCE? RATE US! 🔥', width / 2, y + 42);
    y += 110;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 62px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(bizName, width / 2, y);

    // On white section
    y = 560;
    ctx.fillStyle = '#f59e0b';
    const starSize = 46;
    const totalW = 5 * starSize + 4 * 16;
    let sx = (width - totalW) / 2;
    for (let i = 0; i < 5; i++) {
      drawStar(ctx, sx + starSize / 2, y, 5, starSize / 2, starSize / 4);
      sx += starSize + 16;
    }
    y += 75;

    // QR Box
    const qrSize = 700;
    const qx = (width - qrSize) / 2;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 30);
    ctx.fill();
    ctx.stroke();

    await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
    y += qrSize + 85;

    ctx.fillStyle = '#c2410c';
    ctx.font = 'bold 46px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Tap or Scan to Review', width / 2, y);
    y += 50;

    ctx.fillStyle = '#7c2d12';
    ctx.font = '30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Draft your 5-star review in 10 seconds flat!', width / 2, y);
    return;
  }

  // -------------------------------------------------------------
  // 10. CORPORATE COBALT EXECUTIVE (VERTICAL STRIPE PLAQUE)
  // -------------------------------------------------------------
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Left Vertical Navy Bar
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, 70, height);

  ctx.strokeStyle = '#dadce0';
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  let y = 170;
  const pillW = 600;
  ctx.fillStyle = '#e0e7ff';
  ctx.beginPath();
  ctx.roundRect((width - pillW) / 2 + 35, y, pillW, 64, 16);
  ctx.fill();

  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CLIENT SATISFACTION INDEX', width / 2 + 35, y + 42);
  y += 120;

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 58px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(bizName, width / 2 + 35, y);
  y += 65;

  ctx.fillStyle = '#f59e0b';
  const starSize = 44;
  const totalW = 5 * starSize + 4 * 16;
  let sx = (width - totalW) / 2 + 35;
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, sx + starSize / 2, y, 5, starSize / 2, starSize / 4);
    sx += starSize + 16;
  }
  y += 85;

  // QR Container
  const qrSize = 680;
  const qx = (width - qrSize) / 2 + 35;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.roundRect(qx - 25, y - 25, qrSize + 50, qrSize + 50, 20);
  ctx.fill();
  ctx.stroke();

  await drawQrWithCenterLogo(ctx, qrDataUrl, qx, y, qrSize);
  y += qrSize + 90;

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Verified Client Feedback System', width / 2 + 35, y);
  y += 50;

  ctx.fillStyle = '#64748b';
  ctx.font = '30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Direct Submission to Google Maps • Secure & Fast', width / 2 + 35, y);
}

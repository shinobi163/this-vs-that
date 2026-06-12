import html2canvas from 'html2canvas';

// ─── Dark-theme background color used for screenshots ────────────
const SCREENSHOT_BG = '#0a0e1a';

/**
 * Captures a DOM element as a PNG image and triggers a download.
 *
 * @param {HTMLElement} element   - The DOM node to capture
 * @param {string}      filename - Output filename (default: 'this-vs-that.png')
 */
export async function captureAndDownload(element, filename = 'this-vs-that.png') {
  if (!element) {
    console.warn('[shareUtils] No element provided to capture.');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: SCREENSHOT_BG,
      scale: 2, // Retina-quality output
      useCORS: true,
      logging: false,
    });

    // Create a temporary link and trigger the download
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('[shareUtils] Failed to capture screenshot:', error);
  }
}

/**
 * Captures a DOM element as a PNG and copies it to the clipboard.
 *
 * Uses the modern Clipboard API (navigator.clipboard.write).
 * Falls back gracefully if the browser doesn't support it.
 *
 * @param {HTMLElement} element - The DOM node to capture
 * @returns {Promise<boolean>} true if copy succeeded, false otherwise
 */
export async function captureAndCopy(element) {
  if (!element) {
    console.warn('[shareUtils] No element provided to capture.');
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: SCREENSHOT_BG,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Convert canvas to a Blob for the clipboard
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas toBlob returned null'));
      }, 'image/png');
    });

    // Write to clipboard using the modern API
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);

    return true;
  } catch (error) {
    console.error('[shareUtils] Failed to copy to clipboard:', error);
    return false;
  }
}

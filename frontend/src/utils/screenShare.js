export function getScreenShareUnavailableReason() {
  if (!globalThis.isSecureContext) {
    return "Screen sharing requires a secure context. Open the exam over HTTPS (or localhost on this computer) and reload the page."
  }

  if (typeof navigator === "undefined" || typeof navigator.mediaDevices?.getDisplayMedia !== "function") {
    return "Screen sharing is not available in this browser. Use an up-to-date version of Chrome or Edge."
  }

  return null
}

/**
 * Utility functions to trigger the slim top progress bar for page switches & image loads
 */
export function triggerTopProgress() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:start-progress'));
  }
}

export function completeTopProgress() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:complete-progress'));
  }
}

const INVALID = '[aria-invalid="true"], [data-scroll-target="invalid"]';

/**
 * Bring the first missing field into view. Two frames, so a click that just
 * marked the field invalid has already painted, and a second click still
 * finds the field that was already marked.
 */
export function scrollToFirstInvalid(root: ParentNode | null) {
  if (!root || typeof window === "undefined") return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const node = root.querySelector<HTMLElement>(INVALID);
      if (!node) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      node.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "center",
      });
      if (node.matches("input, textarea, select, button")) {
        node.focus({ preventScroll: true });
      }
    });
  });
}

"use client";

/**
 * Smooth caret input, based on Skiper UI skiper106 (gxuri).
 * https://skiper-ui.com/v1/skiper106
 *
 * DialKit was left out: that panel is for demos, not login.
 */

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

const SPRING = { stiffness: 500, damping: 30, mass: 0.5 };
const SPRING_SNAP = { stiffness: 10000, damping: 100, mass: 0.1 };
const DOT_PX = 8;
const DOT_GAP_PX = 7;

const WRAPPER =
  "relative w-full rounded-[14px] border border-border bg-surface-2 px-4 transition focus-within:border-accent/60 focus-within:bg-white/[0.08]";
const FIELD =
  "h-12 w-full bg-transparent text-[15px] text-white outline-none placeholder:text-dim disabled:opacity-50";

type SmoothInputProps = Omit<ComponentPropsWithoutRef<"input">, "prefix"> & {
  wrapperClassName?: string;
  prefix?: ReactNode;
};

export function SmoothInput({
  className = "",
  wrapperClassName = "",
  prefix,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  type = "text",
  placeholder,
  style,
  ...props
}: SmoothInputProps) {
  const [internalValue, setInternalValue] = useState(
    () => defaultValue ?? "",
  );
  const [revealed, setRevealed] = useState(false);
  const caretX = useMotionValue(0);
  const caretOpacity = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isControlled = value !== undefined;
  const inputValue = isControlled ? String(value) : String(internalValue);
  const isPassword = type === "password";
  const maskPassword = isPassword && !revealed;
  // Chrome/Safari leave selectionStart null on email/number, so the caret
  // would stick at 0. Keep the keyboard via inputMode. Password stays text
  // so we can draw our own dots instead of the native discs.
  const nativeType =
    type === "email" || type === "number" || type === "password" ? "text" : type;
  const nativeInputMode =
    props.inputMode ??
    (type === "email" ? "email" : type === "number" ? "decimal" : undefined);

  const springCaretX = useSpring(
    caretX,
    prefersReducedMotion ? SPRING_SNAP : SPRING,
  );

  const syncMeasureSpan = () => {
    const input = inputRef.current;
    const measureSpan = measureRef.current;
    if (!input || !measureSpan) return;
    const styles = window.getComputedStyle(input);
    const fontSize = styles.fontSize;
    measureSpan.style.font = `${styles.fontStyle} ${styles.fontWeight} ${fontSize} ${styles.fontFamily}`;
    measureSpan.style.letterSpacing = styles.letterSpacing;
    measureSpan.style.fontFeatureSettings = styles.fontFeatureSettings;
    measureSpan.style.fontVariationSettings = styles.fontVariationSettings;
  };

  const measurePrefixWidth = (text: string) => {
    const input = inputRef.current;
    const measureSpan = measureRef.current;
    if (!input || !measureSpan) return null;
    syncMeasureSpan();
    measureSpan.textContent = text;
    const paddingLeft =
      parseFloat(window.getComputedStyle(input).paddingLeft) || 0;
    return text.length > 0
      ? measureSpan.offsetWidth + paddingLeft
      : paddingLeft - 1;
  };

  const scrollCaretIntoView = (
    target: HTMLInputElement,
    absoluteWidth: number,
  ) => {
    const styles = window.getComputedStyle(target);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const maxScroll = Math.max(0, target.scrollWidth - target.clientWidth);
    const visibleRight = target.scrollLeft + target.clientWidth - paddingRight;
    const visibleLeft = target.scrollLeft + paddingLeft;
    if (absoluteWidth > visibleRight) {
      target.scrollLeft = Math.min(
        absoluteWidth - target.clientWidth + paddingRight,
        maxScroll,
      );
      return;
    }
    if (absoluteWidth < visibleLeft) {
      target.scrollLeft = Math.max(0, absoluteWidth - paddingLeft);
    }
  };

  const getCaretIndex = (target: HTMLInputElement) => {
    const selectionStart = target.selectionStart ?? 0;
    const selectionEnd = target.selectionEnd ?? 0;
    if (selectionStart === selectionEnd) return selectionStart;
    return target.selectionDirection === "backward"
      ? selectionStart
      : selectionEnd;
  };

  const updateCaretFromInput = (target: HTMLInputElement | null) => {
    if (!target) return;
    const selectionStart = target.selectionStart ?? 0;
    const selectionEnd = target.selectionEnd ?? 0;
    const hasSelection = selectionStart !== selectionEnd;
    const caretIndex = getCaretIndex(target);
    const styles = window.getComputedStyle(target);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const stride = DOT_PX + DOT_GAP_PX;
    const absoluteWidth = maskPassword
      ? paddingLeft + caretIndex * stride
      : measurePrefixWidth(
          target.value.slice(0, caretIndex),
        );
    if (absoluteWidth === null) return;
    scrollCaretIntoView(target, absoluteWidth);
    const caretPosition = absoluteWidth - target.scrollLeft;
    const minX = paddingLeft - 1;
    const maxX = target.clientWidth - paddingRight;
    const isCaretVisible = caretPosition >= minX && caretPosition <= maxX + 1;
    caretX.set(Math.min(caretPosition, maxX));
    if (!isCaretVisible || hasSelection) {
      caretOpacity.set(0);
      return;
    }
    caretOpacity.set(1);
  };

  const updateCaretRef = useRef(updateCaretFromInput);
  updateCaretRef.current = updateCaretFromInput;
  const caretOpacityRef = useRef(caretOpacity);
  caretOpacityRef.current = caretOpacity;

  useEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) {
      updateCaretRef.current(input);
    }
  }, [inputValue, revealed]);

  useEffect(() => {
    const input = inputRef.current;
    const container = containerRef.current;
    if (!input || !container) return;
    let alive = true;

    const updateCaretIfFocused = () => {
      if (!alive) return;
      if (document.activeElement === input) {
        updateCaretRef.current(input);
      }
    };
    const handleSelectionChange = () => {
      if (!alive || document.activeElement !== input) return;
      requestAnimationFrame(() => {
        if (!alive) return;
        if (document.activeElement === input) {
          updateCaretRef.current(input);
        }
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.fonts.addEventListener("loadingdone", updateCaretIfFocused);
    void document.fonts.ready.then(updateCaretIfFocused);
    input.addEventListener("scroll", updateCaretIfFocused);
    const resizeObserver = new ResizeObserver(updateCaretIfFocused);
    resizeObserver.observe(container);
    updateCaretIfFocused();

    return () => {
      alive = false;
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.fonts.removeEventListener("loadingdone", updateCaretIfFocused);
      input.removeEventListener("scroll", updateCaretIfFocused);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      className={`${WRAPPER} ${prefix || isPassword ? "flex items-center gap-3" : ""} ${wrapperClassName}`}
    >
      {prefix ? (
        <span className="shrink-0 text-dim" aria-hidden>
          {prefix}
        </span>
      ) : null}
      <div
        ref={containerRef}
        className="relative grid min-w-0 flex-1 grid-cols-1 overflow-hidden p-0"
        style={{ caretColor: "transparent" }}
      >
        <input
          {...props}
          ref={inputRef}
          type={nativeType}
          inputMode={nativeInputMode}
          placeholder={placeholder}
          autoCapitalize={isPassword ? "off" : props.autoCapitalize}
          autoCorrect={isPassword ? "off" : props.autoCorrect}
          spellCheck={isPassword ? false : props.spellCheck}
          className={`${FIELD} col-start-1 col-end-2 row-start-1 row-end-2 caret-transparent ${
            maskPassword
              ? "text-transparent [-webkit-text-fill-color:transparent] placeholder:[-webkit-text-fill-color:rgba(255,255,255,0.32)]"
              : ""
          } ${className}`}
          style={style}
          value={inputValue}
          onChange={(event) => {
            const target = event.currentTarget;
            if (!isControlled) setInternalValue(event.target.value);
            onChange?.(event);
            requestAnimationFrame(() => {
              updateCaretRef.current(target);
            });
          }}
          onFocus={(event) => {
            const target = event.currentTarget;
            requestAnimationFrame(() => {
              updateCaretRef.current(target);
            });
            onFocus?.(event);
          }}
          onBlur={(event) => {
            caretOpacityRef.current.set(0);
            onBlur?.(event);
          }}
        />
        {maskPassword && inputValue.length > 0 ? (
          <div
            aria-hidden
            className="pointer-events-none col-start-1 col-end-2 row-start-1 row-end-2 flex items-center"
            style={{ gap: DOT_GAP_PX }}
          >
            {Array.from({ length: inputValue.length }).map((_, index) => (
              <span
                key={index}
                className="block shrink-0 rounded-full bg-white/88"
                style={{ width: DOT_PX, height: DOT_PX }}
              />
            ))}
          </div>
        ) : null}
        <span
          ref={measureRef}
          aria-hidden
          className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre"
        />
        <motion.div
          className="pointer-events-none col-start-1 col-end-2 row-start-1 row-end-2 h-4 w-0.5 self-center rounded-full bg-accent"
          style={{ x: springCaretX, opacity: caretOpacity }}
        />
      </div>
      {isPassword ? (
        <button
          type="button"
          aria-label={revealed ? "Ocultar contraseña" : "Mostrar contraseña"}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setRevealed((open) => !open)}
          className="shrink-0 text-dim transition-colors duration-300 hover:text-white"
        >
          {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      ) : null}
    </div>
  );
}

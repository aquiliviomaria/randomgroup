import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const distance = (touches) =>
  Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY,
  );
const midpoint = (touches) => ({
  x: (touches[0].clientX + touches[1].clientX) / 2,
  y: (touches[0].clientY + touches[1].clientY) / 2,
});
const clamp = (value) => Math.max(1, Math.min(8, value));

export function usePreviewZoom(source, expanded = false) {
  const frame = useRef(null),
    image = useRef(null),
    gesture = useRef(null),
    anchor = useRef(null);
  const [scale, setScale] = useState(1),
    [size, setSize] = useState(null);
  const scaleNow = useRef(1);
  scaleNow.current = scale;
  const reset = useCallback(() => {
    gesture.current = null;
    anchor.current = null;
    scaleNow.current = 1;
    setScale(1);
    if (frame.current) {
      frame.current.scrollLeft = 0;
      frame.current.scrollTop = 0;
    }
  }, []);
  const fit = useCallback(() => {
    const el = frame.current,
      img = image.current;
    if (!el || !img?.naturalWidth) return;
    const css = getComputedStyle(el);
    const available =
      el.clientWidth -
      parseFloat(css.paddingLeft) -
      parseFloat(css.paddingRight);
    const height = expanded
      ? Math.max(
          1,
          el.clientHeight -
            parseFloat(css.paddingTop) -
            parseFloat(css.paddingBottom),
        )
      : Math.min(
          window.innerHeight * 0.42,
          parseFloat(css.maxHeight) -
            parseFloat(css.paddingTop) -
            parseFloat(css.paddingBottom),
        );
    const ratio = Math.min(
      available / img.naturalWidth,
      height / img.naturalHeight,
    );
    setSize({
      width: img.naturalWidth * ratio,
      height: img.naturalHeight * ratio,
      frameHeight: Math.max(
        parseFloat(css.minHeight) || 0,
        img.naturalHeight * ratio +
          parseFloat(css.paddingTop) +
          parseFloat(css.paddingBottom) +
          parseFloat(css.borderTopWidth) +
          parseFloat(css.borderBottomWidth),
      ),
    });
    reset();
  }, [reset, expanded]);

  useLayoutEffect(() => {
    fit();
  }, [expanded, fit]);

  useEffect(() => {
    setSize(null);
    reset();
  }, [source, reset]);
  useEffect(() => {
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);
  // Keep the content beneath the pinch midpoint in the same place as it scales.
  const applyAnchor = useCallback(() => {
    const point = anchor.current,
      el = frame.current,
      img = image.current;
    if (!point || !el || !img) return;
    const rect = img.getBoundingClientRect();
    el.scrollLeft += rect.left + point.u * rect.width - point.x;
    el.scrollTop += rect.top + point.v * rect.height - point.y;
    anchor.current = null;
  }, []);
  useLayoutEffect(applyAnchor, [scale, applyAnchor]);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const begin = (event) => {
      const img = image.current;
      if (!img?.naturalWidth) return;
      if (event.touches.length >= 2) {
        event.preventDefault();
        const center = midpoint(event.touches),
          rect = img.getBoundingClientRect();
        gesture.current = {
          distance: Math.max(1, distance(event.touches)),
          scale: scaleNow.current,
          u: (center.x - rect.left) / rect.width,
          v: (center.y - rect.top) / rect.height,
        };
      } else if (event.touches.length === 1) {
        gesture.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }
    };
    const move = (event) => {
      const start = gesture.current;
      if (!start) return;
      event.preventDefault();
      if (event.touches.length >= 2) {
        if (!start.distance) {
          begin(event);
          return;
        }
        const center = midpoint(event.touches);
        anchor.current = {
          u: start.u,
          v: start.v,
          x: center.x,
          y: center.y,
        };
        const next = clamp(
          (start.scale * distance(event.touches)) / start.distance,
        );
        if (next === scaleNow.current) applyAnchor();
        scaleNow.current = next;
        setScale(next);
      } else if (event.touches.length === 1) {
        if (start.distance) {
          begin(event);
          return;
        }
        const touch = event.touches[0];
        if (scaleNow.current > 1) {
          el.scrollLeft += start.x - touch.clientX;
          el.scrollTop += start.y - touch.clientY;
        } else {
          const modal = el.closest('[role="dialog"]');
          if (modal) modal.scrollTop += start.y - touch.clientY;
        }
        gesture.current = { x: touch.clientX, y: touch.clientY };
      }
    };
    const end = (event) => {
      gesture.current = null;
      if (event.touches.length) begin(event);
    };
    const cancel = () => {
      gesture.current = null;
      anchor.current = null;
    };
    el.addEventListener("touchstart", begin, { passive: false });
    el.addEventListener("touchmove", move, { passive: false });
    el.addEventListener("touchend", end, { passive: false });
    el.addEventListener("touchcancel", cancel);
    return () => {
      el.removeEventListener("touchstart", begin);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", cancel);
    };
  }, [applyAnchor]);

  const toggle = () => {
    if (scale > 1) {
      reset();
      return;
    }
    const rect = frame.current.getBoundingClientRect();
    anchor.current = {
      u: 0.5,
      v: 0.5,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const next = clamp(Math.max(2, 1200 / (size?.width || rect.width)));
    scaleNow.current = next;
    setScale(next);
  };
  return {
    frame,
    image,
    scale,
    fit,
    reset,
    toggle,
    frameStyle: size ? { height: size.frameHeight } : undefined,
    imageStyle: size
      ? {
          width: size.width * scale,
          height: size.height * scale,
          maxWidth: "none",
          maxHeight: "none",
        }
      : undefined,
  };
}

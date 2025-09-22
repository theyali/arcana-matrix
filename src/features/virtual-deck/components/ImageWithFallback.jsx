// src/features/virtual-deck/components/ImageWithFallback.jsx
import React from "react";

/* Фолбэк webp→png→jpg */
export default function ImageWithFallback({ candidates, alt, onFinalError, ...rest }) {
  const [idx, setIdx] = React.useState(0);
  const [hidden, setHidden] = React.useState(false);

  // >>> добавлено: сброс внутреннего состояния при смене кандидатов
  const sig = React.useMemo(
    () => (Array.isArray(candidates) ? candidates.join("|") : String(candidates ?? "")),
    [candidates]
  );
  React.useEffect(() => {
    setIdx(0);
    setHidden(false);
  }, [sig]);
  // <<<

  const src = Array.isArray(candidates) ? candidates[idx] : candidates;

  const handleError = () => {
    if (Array.isArray(candidates) && idx < candidates.length - 1) {
      setIdx((i) => i + 1);
    } else {
      setHidden(true);
      onFinalError && onFinalError();
    }
  };

  if (hidden) return null;
  return <img src={src} alt={alt} onError={handleError} {...rest} />;
}

import { useEffect, useState } from "react";

export function useScanner(interval = 6000) {
  const [scanned, setScanned] = useState(false);
  const [flashlight, setFlashlight] = useState(false);

  useEffect(() => {
    const pulse = window.setInterval(() => {
      setScanned(true);
      navigator.vibrate?.(50);
      window.setTimeout(() => setScanned(false), 850);
    }, interval);
    return () => window.clearInterval(pulse);
  }, [interval]);

  return {
    scanned,
    flashlight,
    toggleFlashlight: () => setFlashlight((value) => !value),
  };
}

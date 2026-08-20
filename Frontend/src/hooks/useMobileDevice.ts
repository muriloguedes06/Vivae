import { useEffect, useState } from "react";

const mobileQuery = "(max-width: 1024px) and (pointer: coarse)";

export function useMobileDevice() {
  const [isMobileDevice, setIsMobileDevice] = useState(() =>
    window.matchMedia(mobileQuery).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(mobileQuery);
    const update = (event: MediaQueryListEvent) => setIsMobileDevice(event.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobileDevice;
}

import { useCallback, useEffect, useRef, useState } from "react";

type CameraStatus = "idle" | "requesting" | "active" | "denied" | "unsupported" | "error";

interface DetectedBarcode {
  rawValue: string;
}

interface BarcodeDetectorConstructor {
  new (options: { formats: string[] }): {
    detect(source: HTMLVideoElement): Promise<DetectedBarcode[]>;
  };
  getSupportedFormats?(): Promise<string[]>;
}

function getBarcodeDetector() {
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
}

export function useScanner(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const detectedRef = useRef(false);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [scannedCode, setScannedCode] = useState("");
  const [flashlight, setFlashlight] = useState(false);
  const [decoderAvailable] = useState(() => Boolean(getBarcodeDetector()));

  const releaseCamera = useCallback(() => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    animationRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stopCamera = useCallback(() => {
    releaseCamera();
    setFlashlight(false);
    setStatus("idle");
  }, [releaseCamera]);

  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    const Detector = getBarcodeDetector();
    if (!video || !Detector || detectedRef.current || video.readyState < 2) return;

    try {
      const detector = new Detector({ formats: ["qr_code"] });
      const codes = await detector.detect(video);
      const value = codes[0]?.rawValue?.trim();
      if (value) {
        detectedRef.current = true;
        navigator.vibrate?.(80);
        setScannedCode(value);
      }
    } catch {
      // Alguns frames podem falhar enquanto a câmera ajusta o foco.
    }
  }, []);

  useEffect(() => {
    if (status !== "active" || !decoderAvailable) return;

    const loop = async () => {
      await scanFrame();
      if (!detectedRef.current) animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, [decoderAvailable, scanFrame, status]);

  useEffect(() => {
    async function synchronizeCameraAvailability() {
      if (!enabled) stopCamera();
    }

    void synchronizeCameraAvailability();
    return releaseCamera;
  }, [enabled, releaseCamera, stopCamera]);

  async function startCamera() {
    if (!enabled || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");
    detectedRef.current = false;
    setScannedCode("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("active");
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      setStatus(name === "NotAllowedError" ? "denied" : "error");
    }
  }

  async function toggleFlashlight() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    const next = !flashlight;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
      setFlashlight(next);
    } catch {
      setFlashlight(false);
    }
  }

  return {
    videoRef,
    status,
    scannedCode,
    flashlight,
    decoderAvailable,
    startCamera,
    stopCamera,
    toggleFlashlight,
  };
}

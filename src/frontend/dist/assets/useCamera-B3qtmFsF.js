import { r as reactExports } from "./index-Bp53jmYJ.js";
const useCamera = (config = {}) => {
  const {
    facingMode = "environment",
    width = 1920,
    height = 1080,
    quality = 0.8,
    format = "image/jpeg"
  } = config;
  const [isActive, setIsActive] = reactExports.useState(false);
  const [isSupported, setIsSupported] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [currentFacingMode, setCurrentFacingMode] = reactExports.useState(facingMode);
  const videoRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  const streamRef = reactExports.useRef(null);
  const isMountedRef = reactExports.useRef(true);
  reactExports.useEffect(() => {
    var _a;
    const supported = !!((_a = navigator.mediaDevices) == null ? void 0 : _a.getUserMedia);
    setIsSupported(supported);
  }, []);
  reactExports.useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);
  const cleanup = reactExports.useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);
  const createMediaStream = reactExports.useCallback(
    async (facing) => {
      try {
        const constraints = {
          video: {
            facingMode: facing,
            width: { ideal: width },
            height: { ideal: height }
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!isMountedRef.current) {
          for (const track of stream.getTracks()) {
            track.stop();
          }
          return null;
        }
        return stream;
      } catch (err) {
        let errorType = "unknown";
        let errorMessage = "Failed to access camera";
        if (err.name === "NotAllowedError") {
          errorType = "permission";
          errorMessage = "Camera permission denied";
        } else if (err.name === "NotFoundError") {
          errorType = "not-found";
          errorMessage = "No camera device found";
        } else if (err.name === "NotSupportedError") {
          errorType = "not-supported";
          errorMessage = "Camera is not supported";
        }
        throw { type: errorType, message: errorMessage };
      }
    },
    [width, height]
  );
  const setupVideo = reactExports.useCallback(async (stream) => {
    if (!videoRef.current) return false;
    const video = videoRef.current;
    video.srcObject = stream;
    return new Promise((resolve) => {
      const onLoadedMetadata = () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("error", onError);
        video.play().catch((err) => {
          console.warn("Video autoplay failed:", err);
        });
        resolve(true);
      };
      const onError = () => {
        video.removeEventListener("loadedmetadata", onLoadedMetadata);
        video.removeEventListener("error", onError);
        resolve(false);
      };
      video.addEventListener("loadedmetadata", onLoadedMetadata);
      video.addEventListener("error", onError);
      if (video.readyState >= 1) {
        onLoadedMetadata();
      }
    });
  }, []);
  const startCamera = reactExports.useCallback(async () => {
    if (isSupported === false || isLoading) {
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      cleanup();
      const stream = await createMediaStream(currentFacingMode);
      if (!stream) return false;
      streamRef.current = stream;
      const success = await setupVideo(stream);
      if (success && isMountedRef.current) {
        setIsActive(true);
        return true;
      }
      cleanup();
      return false;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
      }
      cleanup();
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    isSupported,
    isLoading,
    currentFacingMode,
    cleanup,
    createMediaStream,
    setupVideo
  ]);
  const stopCamera = reactExports.useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    cleanup();
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (isMountedRef.current) {
      setIsLoading(false);
    }
  }, [isLoading, cleanup]);
  const switchCamera = reactExports.useCallback(
    async (newFacingMode) => {
      if (isSupported === false || isLoading) {
        return false;
      }
      const targetFacingMode = newFacingMode || (currentFacingMode === "user" ? "environment" : "user");
      setIsLoading(true);
      setError(null);
      try {
        cleanup();
        setCurrentFacingMode(targetFacingMode);
        await new Promise((resolve) => setTimeout(resolve, 100));
        const stream = await createMediaStream(targetFacingMode);
        if (!stream) return false;
        streamRef.current = stream;
        const success = await setupVideo(stream);
        if (success && isMountedRef.current) {
          setIsActive(true);
          return true;
        }
        cleanup();
        return false;
      } catch (err) {
        if (isMountedRef.current) {
          setError(err);
        }
        cleanup();
        return false;
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [
      isSupported,
      isLoading,
      currentFacingMode,
      cleanup,
      createMediaStream,
      setupVideo
    ]
  );
  const retry = reactExports.useCallback(async () => {
    if (isLoading) return false;
    setError(null);
    await stopCamera();
    await new Promise((resolve) => setTimeout(resolve, 200));
    return startCamera();
  }, [isLoading, stopCamera, startCamera]);
  const capturePhoto = reactExports.useCallback(() => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current || !isActive) {
        resolve(null);
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      if (currentFacingMode === "user") {
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0);
      } else {
        ctx.drawImage(video, 0, 0);
      }
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const extension = format.split("/")[1];
            const file = new File([blob], `photo_${Date.now()}.${extension}`, {
              type: format
            });
            resolve(file);
          } else {
            resolve(null);
          }
        },
        format,
        quality
      );
    });
  }, [isActive, format, quality, currentFacingMode]);
  return {
    // State
    isActive,
    isSupported,
    error,
    isLoading,
    currentFacingMode,
    // Actions
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    retry,
    // Refs for components
    videoRef,
    canvasRef
  };
};
export {
  useCamera as u
};

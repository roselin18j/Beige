import { useEffect, useRef, useState } from "react";
import { X, Camera, Upload, ImagePlus, Sparkles } from "lucide-react";
import { toast } from "sonner";

const lipColours = [
  { id: "none", name: "No lipstick", color: null },
  { id: "classic-red", name: "Classic red", color: "#B3202A" },
  { id: "soft-rose", name: "Soft rose", color: "#D98A98" },
  { id: "warm-nude", name: "Warm nude", color: "#B9806A" },
  { id: "deep-berry", name: "Deep berry", color: "#7A1F3D" },
];

const foundationShades = [
  { id: "none", name: "No foundation", color: null },
  { id: "ivory", name: "Ivory", color: "#EBD8BE" },
  { id: "sand", name: "Sand", color: "#DDBF9A" },
  { id: "honey", name: "Honey", color: "#C99A6B" },
  { id: "caramel", name: "Caramel", color: "#A87347" },
  { id: "espresso", name: "Espresso", color: "#6B4430" },
];

/**
 * Props
 * - onClose()                      close the modal
 * - onGenerate({ file, image, lip, foundation })
 *       async; return a preview image URL (string) or { imageUrl }
 * - aiAvailable (bool)             false => "awaiting activation" notices and
 *                                  the Generate button stays disabled
 */
export default function TryOnModal({
  onClose,
  onGenerate,
  aiAvailable = false,
}) {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const imageRef = useRef(null);

  const [step, setStep] = useState(1); // 1 = photo, 2 = makeup shades
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  const [photoConsent, setPhotoConsent] = useState(false);
  const [sendConsent, setSendConsent] = useState(false);

  const [lip, setLip] = useState("classic-red");
  const [foundation, setFoundation] = useState("none");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------- cleanup ----------
  imageRef.current = image;

  useEffect(() => {
    return () => {
      if (imageRef.current) URL.revokeObjectURL(imageRef.current);
      stopCamera();
    };
  }, []);

  // ---------- image helpers ----------
  const setPhoto = (blob) => {
    if (imageRef.current) URL.revokeObjectURL(imageRef.current);
    setFile(blob);
    setImage(URL.createObjectURL(blob));
    setResult(null);
  };

  const removePhoto = () => {
    if (imageRef.current) URL.revokeObjectURL(imageRef.current);
    setFile(null);
    setImage(null);
    setResult(null);
    setPhotoConsent(false);
    setSendConsent(false);
  };

  // ---------- camera ----------
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const openCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error("Camera is not supported on this device");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Allow camera access to take a photo");
    }
  };

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOpen]);

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) {
      toast.error("Camera is not ready yet");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Could not capture the photo");
          return;
        }
        setPhoto(blob);
        closeCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  // ---------- upload ----------
  const processFile = (f) => {
    if (!f) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) {
      toast.error("Upload a JPG, PNG or WEBP photo");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Photo must be smaller than 10 MB");
      return;
    }
    setPhoto(f);
  };

  const onFileChange = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  // ---------- navigation ----------
  const goToShades = () => {
    if (!image || !photoConsent) return;
    setStep(2);
  };

  const useAnotherPhoto = () => {
    removePhoto();
    setStep(1);
  };

  // ---------- generate ----------
  const handleGenerate = async () => {
    if (!image || !sendConsent || !aiAvailable) return;

    try {
      setLoading(true);
      const output = await onGenerate?.({
        file,
        image,
        lip,
        foundation,
      });
      const url = typeof output === "string" ? output : output?.imageUrl;
      if (!url) throw new Error("No preview returned");
      setResult(url);
    } catch (error) {
      console.error(error);
      toast.error("We couldn't create your preview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onPickLip = (id) => {
    setLip(id);
    setResult(null);
  };

  const onPickFoundation = (id) => {
    setFoundation(id);
    setResult(null);
  };

  const canContinue = Boolean(image && photoConsent);
  const canGenerate = Boolean(
    image && sendConsent && aiAvailable && !loading
  );

  // ---------- small UI pieces ----------
  const Swatch = ({ color }) =>
    color ? (
      <span
        className="h-3.5 w-3.5 rounded-full border border-black/10"
        style={{ backgroundColor: color }}
      />
    ) : (
      <span className="h-3.5 w-3.5 rounded-full border border-line bg-white" />
    );

  const Chip = ({ item, selected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-ink transition ${
        selected
          ? "border-mocha bg-sand"
          : "border-line bg-white hover:border-mocha"
      }`}
    >
      <Swatch color={item.color} />
      {item.name}
    </button>
  );

  const Notice = ({ children }) => (
    <div className="rounded-md border border-line bg-sand/60 px-4 py-3 text-xs text-muted">
      {children}
    </div>
  );

  // ---------- render ----------
  return (
    <div className="flex max-h-[90vh] w-full flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4 sm:px-7">
        <h2 className="font-serif text-2xl text-ink">Beige AI try-on</h2>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 transition hover:bg-sand"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* =============================
          STEP 1 - PHOTO
      ============================= */}
      {step === 1 && (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
          <p className="mb-4 text-sm text-muted">
            Use a clear front-facing photo in natural light, with your face and
            hair visible. For try-on, avoid filters and heavy makeup.
          </p>

          {/* photo area */}
          {cameraOpen ? (
            <div className="relative overflow-hidden rounded-md bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-[min(260px,30vh)] w-full object-cover"
              />
              <div className="absolute bottom-4 flex w-full justify-center gap-3">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-ink"
                >
                  Capture photo
                </button>
                <button
                  type="button"
                  onClick={closeCamera}
                  className="rounded-full bg-black/60 px-5 py-2.5 text-sm text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : image ? (
            <>
              <div className="overflow-hidden rounded-md border border-line bg-cream">
                <img
                  src={image}
                  alt="Your uploaded portrait"
                  className="h-[min(260px,30vh)] w-full object-cover object-top"
                />
              </div>

              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={openCamera}
                  className="flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-xs text-ink transition hover:bg-cream"
                >
                  <Camera size={14} />
                  Retake photo
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-xs text-ink transition hover:bg-cream"
                >
                  <Upload size={14} />
                  Upload photo
                </button>
              </div>

              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={removePhoto}
                  className="text-xs text-ink underline underline-offset-4"
                >
                  Remove photo
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`flex h-[min(260px,30vh)] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed transition ${
                  dragging
                    ? "border-mocha bg-sand"
                    : "border-line bg-cream hover:border-mocha"
                }`}
              >
                <ImagePlus size={28} className="mb-3 text-mocha" />
                <p className="text-sm text-ink">Drag a photo here</p>
                <p className="mt-1 text-xs text-muted">
                  JPG, PNG or WEBP, up to 10 MB
                </p>
              </div>

              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={openCamera}
                  className="flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-xs text-ink transition hover:bg-cream"
                >
                  <Camera size={14} />
                  Take photo
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-xs text-ink transition hover:bg-cream"
                >
                  <Upload size={14} />
                  Upload photo
                </button>
              </div>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={onFileChange}
          />

          {/* consent */}
          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={photoConsent}
              onChange={(e) => setPhotoConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-mocha"
            />
            <span className="text-xs leading-5 text-ink">
              I own this photo or have permission to use it, and agree to send
              it to OpenAI for AI analysis and cosmetic previews.
            </span>
          </label>

          <p className="mt-3 text-xs leading-5 text-muted">
            Beige does not save the photo to your account. It is sent to the AI
            provider only when you request an AI feature.
          </p>

          {!aiAvailable && (
            <div className="mt-4">
              <Notice>
                AI photo features are awaiting activation. The skin and hair
                questionnaire still gives you a care profile.
              </Notice>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={goToShades}
              disabled={!canContinue}
              className={`rounded-md px-6 py-3 text-sm font-medium transition ${
                canContinue
                  ? "bg-mocha text-white hover:opacity-90"
                  : "cursor-not-allowed bg-mocha/40 text-white"
              }`}
            >
              Choose makeup shades
            </button>
          </div>
        </div>
      )}

      {/* =============================
          STEP 2 - MAKEUP SHADES
      ============================= */}
      {step === 2 && (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
          <p className="mb-5 text-sm text-muted">
            Choose a lip colour, a foundation shade, or both. These are preview
            colours, independent of product availability.
          </p>

          <p className="mb-2 text-xs font-medium text-ink">Lip colour</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {lipColours.map((item) => (
              <Chip
                key={item.id}
                item={item}
                selected={lip === item.id}
                onClick={() => onPickLip(item.id)}
              />
            ))}
          </div>

          <p className="mb-2 text-xs font-medium text-ink">Foundation</p>
          <div className="mb-5 flex flex-wrap gap-2">
            {foundationShades.map((item) => (
              <Chip
                key={item.id}
                item={item}
                selected={foundation === item.id}
                onClick={() => onPickFoundation(item.id)}
              />
            ))}
          </div>

          {/* original vs preview */}
          <div className="grid grid-cols-2 overflow-hidden rounded-md bg-sand/60">
            <div className="flex flex-col">
              <span className="px-3 py-2 text-xs text-ink">Original</span>
              <div className="m-2 mt-0 h-[min(210px,24vh)] overflow-hidden rounded-sm bg-white">
                {image && (
                  <img
                    src={image}
                    alt="Original"
                    className="h-full w-full object-cover object-top"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <span className="px-3 py-2 text-xs text-ink">AI preview</span>
              <div className="m-2 mt-0 flex h-[min(210px,24vh)] items-center justify-center overflow-hidden rounded-sm bg-sand">
                {loading ? (
                  <p className="px-4 text-center text-xs text-muted">
                    Creating your preview...
                  </p>
                ) : result ? (
                  <img
                    src={result}
                    alt="AI makeup preview"
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex flex-col items-center px-4 text-center">
                    <Sparkles size={22} className="mb-2 text-mocha/60" />
                    <p className="text-xs text-muted">
                      Your preview will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-muted">
            AI may alter image details. Colours vary with lighting and screens;
            this is not an exact shade match.
          </p>

          {!result && (
            <div className="mt-3">
              <Notice>
                {aiAvailable
                  ? "No image has been generated yet."
                  : "AI try-on is awaiting activation. No image has been generated."}
              </Notice>
            </div>
          )}

          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={sendConsent}
              onChange={(e) => setSendConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-mocha"
            />
            <span className="text-xs leading-5 text-ink">
              I agree to send my permitted photo to OpenAI to generate the
              try-on preview.
            </span>
          </label>

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-ink underline underline-offset-4"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition ${
                canGenerate
                  ? "bg-mocha text-white hover:opacity-90"
                  : "cursor-not-allowed bg-mocha/40 text-white"
              }`}
            >
              <Sparkles size={15} />
              {loading ? "Generating..." : "Generate AI preview"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={useAnotherPhoto}
              className="text-xs text-ink underline underline-offset-4"
            >
              Use another photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
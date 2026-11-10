import { useEffect, useRef, useState } from "react";
import { X, Camera, Upload, ImagePlus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { env } from "../../utils/env";


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
  const [foundation, setFoundation] = useState("honey");

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

  // CHANGED: use correct endpoint, preserve selectedOptions alongside data
  const handleGenerate = async () => {
    if (!file) {
      toast.error("Please add a photo first.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("lipColor", lip);
      formData.append("foundationShade", foundation);

      const response = await fetch(`${env.api_base_url}/makeupBaseAnalyze`, {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      console.log("Makeup AI Result:", payload);

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Makeup analysis failed.");
      }

      // CHANGED: merge selectedOptions (from top level) into result
      setResult({
        ...payload.data,
        selectedOptions: payload.selectedOptions,
      });
      toast.success("Makeup analysis completed.");
    } catch (error) {
      console.error("Makeup Analysis Error:", error);
      toast.error(error.message || "Unable to analyze your makeup.");
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


  useEffect(() => {
    console.log("Lip State Updated:", lip);
  }, [lip]);

  useEffect(() => {
    console.log("Foundation State Updated:", foundation);
  }, [foundation]);

  const canContinue = Boolean(image && photoConsent);
  const canGenerate = Boolean(
    image &&
    sendConsent &&
    !loading &&
    lip &&
    lip !== "none" &&
    foundation &&
    foundation !== "none"
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
      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs text-ink transition ${selected
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
                className={`flex h-[min(260px,30vh)] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed transition ${dragging
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
              className={`rounded-md px-6 py-3 text-sm font-medium transition ${canContinue
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

            {/* CHANGED: expanded summary panel */}
            <div className="flex flex-col">
              <span className="px-3 py-2 text-xs text-ink">AI analysis</span>
              <div className="m-2 mt-0 h-[min(210px,24vh)] overflow-y-auto rounded-sm bg-white px-3 py-2 text-[11px] leading-4 text-ink">
                {loading ? (
                  <p className="text-center text-xs text-muted">
                    Analyzing your makeup...
                  </p>
                ) : result ? (
                  <div className="space-y-1.5">
                    <p>
                      <span className="font-semibold">Skin tone:</span>{" "}
                      {result?.skinAnalysis?.visibleSkinTone || "—"}
                    </p>
                    <p>
                      <span className="font-semibold">Undertone:</span>{" "}
                      {result?.skinAnalysis?.possibleUndertone || "—"}
                    </p>
                    <p>
                      <span className="font-semibold">Confidence:</span>{" "}
                      {result?.skinAnalysis?.confidence || "—"}
                    </p>
                    <p>
                      <span className="font-semibold">Selected shade:</span>{" "}
                      {result?.foundationAnalysis?.selectedShade || "—"}
                    </p>
                    <p>
                      <span className="font-semibold">Foundation fit:</span>{" "}
                      {result?.foundationAnalysis?.suitability || "—"}
                    </p>
                    <p>
                      <span className="font-semibold">Better direction:</span>{" "}
                      {result?.foundationAnalysis?.recommendedShadeDirection ||
                        "—"}
                    </p>
                    <p>
                      <span className="font-semibold">Coverage:</span>{" "}
                      {result?.foundationAnalysis?.coverage || "—"}
                    </p>
                    <p>
                      <span className="font-semibold">Finish:</span>{" "}
                      {result?.foundationAnalysis?.finish || "—"}
                    </p>
                    <p>
                      <span className="font-semibold">Lip match:</span>{" "}
                      {result?.lipColorAnalysis?.compatibility || "—"}
                    </p>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <Sparkles size={22} className="mb-2 text-mocha/60" />
                    <p className="text-xs text-muted">
                      Your analysis will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CHANGED: render every field from the response */}
          {result && !loading && (
            <div className="mt-4 space-y-4 rounded-md border border-line bg-white px-4 py-4 text-xs leading-5 text-ink">

              {/* ===== SELECTED OPTIONS ===== */}
              {result?.selectedOptions && (
                <section>
                  <h4 className="mb-1 text-sm font-semibold text-ink">
                    Selected options
                  </h4>
                  <p>
                    <span className="font-semibold">Lip:</span>{" "}
                    {result.selectedOptions.lipColor || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Foundation:</span>{" "}
                    {result.selectedOptions.foundationShade || "—"}
                  </p>
                </section>
              )}

              {/* ===== SKIN ANALYSIS ===== */}
              <section>
                <h4 className="mb-2 text-sm font-semibold text-ink">
                  Skin analysis
                </h4>
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">Visible skin tone:</span>{" "}
                    {result?.skinAnalysis?.visibleSkinTone || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Possible undertone:</span>{" "}
                    {result?.skinAnalysis?.possibleUndertone || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Confidence:</span>{" "}
                    {result?.skinAnalysis?.confidence || "—"}
                  </p>
                  {result?.skinAnalysis?.observation && (
                    <p>
                      <span className="font-semibold">Observation:</span>{" "}
                      {result.skinAnalysis.observation}
                    </p>
                  )}
                </div>
              </section>

              {/* ===== FOUNDATION ANALYSIS ===== */}
              <section>
                <h4 className="mb-2 text-sm font-semibold text-ink">
                  Foundation analysis
                </h4>
                <div className="space-y-1">
                  <p>
                    <span className="font-semibold">Selected shade:</span>{" "}
                    {result?.foundationAnalysis?.selectedShade || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Suitability:</span>{" "}
                    {result?.foundationAnalysis?.suitability || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">
                      Recommended direction:
                    </span>{" "}
                    {result?.foundationAnalysis?.recommendedShadeDirection ||
                      "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Coverage:</span>{" "}
                    {result?.foundationAnalysis?.coverage || "—"}
                  </p>
                  <p>
                    <span className="font-semibold">Finish:</span>{" "}
                    {result?.foundationAnalysis?.finish || "—"}
                  </p>
                  {result?.foundationAnalysis?.reason && (
                    <p>
                      <span className="font-semibold">Reason:</span>{" "}
                      {result.foundationAnalysis.reason}
                    </p>
                  )}
                </div>
              </section>

              {/* ===== MAKEUP RECOMMENDATIONS ===== */}
              {result?.makeupRecommendations && (
                <section>
                  <h4 className="mb-2 text-sm font-semibold text-ink">
                    Makeup recommendations
                  </h4>

                  <div className="space-y-3">
                    {result.makeupRecommendations.primer && (
                      <div className="rounded-sm bg-cream px-3 py-2">
                        <p className="font-semibold">Primer</p>
                        {result.makeupRecommendations.primer.type && (
                          <p>
                            <span className="font-semibold">Type:</span>{" "}
                            {result.makeupRecommendations.primer.type}
                          </p>
                        )}
                        {result.makeupRecommendations.primer.reason && (
                          <p>
                            <span className="font-semibold">Why:</span>{" "}
                            {result.makeupRecommendations.primer.reason}
                          </p>
                        )}
                      </div>
                    )}

                    {result.makeupRecommendations.concealer && (
                      <div className="rounded-sm bg-cream px-3 py-2">
                        <p className="font-semibold">Concealer</p>
                        {result.makeupRecommendations.concealer
                          .shadeDirection && (
                          <p>
                            <span className="font-semibold">Shade:</span>{" "}
                            {
                              result.makeupRecommendations.concealer
                                .shadeDirection
                            }
                          </p>
                        )}
                        {result.makeupRecommendations.concealer.type && (
                          <p>
                            <span className="font-semibold">Type:</span>{" "}
                            {result.makeupRecommendations.concealer.type}
                          </p>
                        )}
                        {result.makeupRecommendations.concealer
                          .application && (
                          <p>
                            <span className="font-semibold">Application:</span>{" "}
                            {
                              result.makeupRecommendations.concealer
                                .application
                            }
                          </p>
                        )}
                      </div>
                    )}

                    {result.makeupRecommendations.colorCorrector && (
                      <div className="rounded-sm bg-cream px-3 py-2">
                        <p className="font-semibold">Colour corrector</p>
                        {result.makeupRecommendations.colorCorrector
                          .recommended && (
                          <p>
                            <span className="font-semibold">Recommended:</span>{" "}
                            {
                              result.makeupRecommendations.colorCorrector
                                .recommended
                            }
                          </p>
                        )}
                        {result.makeupRecommendations.colorCorrector.reason && (
                          <p>
                            <span className="font-semibold">Why:</span>{" "}
                            {result.makeupRecommendations.colorCorrector.reason}
                          </p>
                        )}
                      </div>
                    )}

                    {result.makeupRecommendations.foundation && (
                      <div className="rounded-sm bg-cream px-3 py-2">
                        <p className="font-semibold">Foundation</p>
                        {result.makeupRecommendations.foundation
                          .recommendation && (
                          <p>
                            <span className="font-semibold">
                              Recommendation:
                            </span>{" "}
                            {
                              result.makeupRecommendations.foundation
                                .recommendation
                            }
                          </p>
                        )}
                        {result.makeupRecommendations.foundation
                          .application && (
                          <p>
                            <span className="font-semibold">Application:</span>{" "}
                            {
                              result.makeupRecommendations.foundation
                                .application
                            }
                          </p>
                        )}
                      </div>
                    )}

                    {result.makeupRecommendations.settingPowder && (
                      <div className="rounded-sm bg-cream px-3 py-2">
                        <p className="font-semibold">Setting powder</p>
                        {result.makeupRecommendations.settingPowder.shade && (
                          <p>
                            <span className="font-semibold">Shade:</span>{" "}
                            {result.makeupRecommendations.settingPowder.shade}
                          </p>
                        )}
                        {result.makeupRecommendations.settingPowder.type && (
                          <p>
                            <span className="font-semibold">Type:</span>{" "}
                            {result.makeupRecommendations.settingPowder.type}
                          </p>
                        )}
                      </div>
                    )}

                    {result.makeupRecommendations.blush && (
                      <div className="rounded-sm bg-cream px-3 py-2">
                        <p className="font-semibold">Blush</p>
                        {Array.isArray(
                          result.makeupRecommendations.blush.recommendedColors
                        ) &&
                          result.makeupRecommendations.blush.recommendedColors
                            .length > 0 && (
                            <p>
                              <span className="font-semibold">Colours:</span>{" "}
                              {result.makeupRecommendations.blush.recommendedColors.join(
                                ", "
                              )}
                            </p>
                          )}
                        {result.makeupRecommendations.blush.reason && (
                          <p>
                            <span className="font-semibold">Why:</span>{" "}
                            {result.makeupRecommendations.blush.reason}
                          </p>
                        )}
                      </div>
                    )}

                    {result.makeupRecommendations.bronzer && (
                      <div className="rounded-sm bg-cream px-3 py-2">
                        <p className="font-semibold">Bronzer</p>
                        {result.makeupRecommendations.bronzer
                          .shadeDirection && (
                          <p>
                            <span className="font-semibold">Shade:</span>{" "}
                            {
                              result.makeupRecommendations.bronzer
                                .shadeDirection
                            }
                          </p>
                        )}
                        {result.makeupRecommendations.bronzer.application && (
                          <p>
                            <span className="font-semibold">Application:</span>{" "}
                            {result.makeupRecommendations.bronzer.application}
                          </p>
                        )}
                      </div>
                    )}

                    {result.makeupRecommendations.highlighter && (
                      <div className="rounded-sm bg-cream px-3 py-2">
                        <p className="font-semibold">Highlighter</p>
                        {result.makeupRecommendations.highlighter
                          .recommendedColors && (
                          <p>
                            <span className="font-semibold">Colours:</span>{" "}
                            {
                              result.makeupRecommendations.highlighter
                                .recommendedColors
                            }
                          </p>
                        )}
                        {result.makeupRecommendations.highlighter
                          .application && (
                          <p>
                            <span className="font-semibold">Application:</span>{" "}
                            {
                              result.makeupRecommendations.highlighter
                                .application
                            }
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* ===== LIP COLOUR ANALYSIS ===== */}
              {result?.lipColorAnalysis && (
                <section>
                  <h4 className="mb-2 text-sm font-semibold text-ink">
                    Lip colour analysis
                  </h4>
                  <div className="space-y-1">
                    <p>
                      <span className="font-semibold">Selected colour:</span>{" "}
                      {result.lipColorAnalysis.selectedColor || "—"}
                    </p>
                    <p>
                      <span className="font-semibold">Compatibility:</span>{" "}
                      {result.lipColorAnalysis.compatibility || "—"}
                    </p>
                    {result.lipColorAnalysis.baseMakeupAdjustment && (
                      <p>
                        <span className="font-semibold">
                          Base adjustment:
                        </span>{" "}
                        {result.lipColorAnalysis.baseMakeupAdjustment}
                      </p>
                    )}
                  </div>
                </section>
              )}

              {/* ===== COMPLETE ROUTINE ===== */}
              {Array.isArray(result?.completeRoutine) &&
                result.completeRoutine.length > 0 && (
                  <section>
                    <h4 className="mb-2 text-sm font-semibold text-ink">
                      Complete routine
                    </h4>
                    <ol className="list-decimal space-y-1 pl-5">
                      {result.completeRoutine.map((s, i) => (
                        <li key={i}>
                          <span className="font-semibold">
                            {s.productType || `Step ${s.step ?? i + 1}`}:
                          </span>{" "}
                          {s.instruction || "—"}
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

              {/* ===== FINAL SUGGESTION ===== */}
              {result?.finalSuggestion && (
                <section>
                  <h4 className="mb-1 text-sm font-semibold text-ink">
                    Final suggestion
                  </h4>
                  <p>{result.finalSuggestion}</p>
                </section>
              )}

              {/* ===== IMAGE LIMITATIONS ===== */}
              {result?.imageLimitations && (
                <section>
                  <h4 className="mb-1 text-sm font-semibold text-ink">
                    Image limitations
                  </h4>
                  <p className="text-muted">{result.imageLimitations}</p>
                </section>
              )}
            </div>
          )}

          <p className="mt-4 text-xs leading-5 text-muted">
            AI may alter image details. Colours vary with lighting and screens;
            this is not an exact shade match.
          </p>

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
              className={`flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium transition ${canGenerate
                ? "bg-mocha text-white hover:opacity-90"
                : "cursor-not-allowed bg-mocha/40 text-white"
                }`}
            >
              <Sparkles size={15} />
              {loading ? "Analyzing..." : "Generate AI preview"}
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
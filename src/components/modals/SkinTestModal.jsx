import { useEffect, useRef, useState } from "react";
// import { api_base_url } from "../../utils/env"
import { env } from "../../utils/env";
import {
  X,
  GripHorizontal,
  Check,
  Camera,
  Upload,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { isVideoFile, validateMediaFile } from "../../utils/mediaUpload.js";

const skinQuestions = [
  {
    question: "After cleansing, how does your skin usually feel?",
    options: [
      "Comfortable",
      "Tight or dry",
      "Oily",
      "Dry in some areas, oily in others",
    ],
  },
  {
    question: "Where do you notice shine during the day?",
    options: [
      "Little or none",
      "Mostly forehead, nose and chin",
      "Across most of my face",
    ],
  },
  {
    question: "How often do products cause stinging or irritation?",
    options: ["Rarely", "Sometimes", "Often"],
  },
];

const hairQuestions = [
  {
    question: "What is your natural hair pattern, without styling?",
    options: ["Straight", "Wavy", "Curly", "Coily", "Not sure"],
  },
  {
    question: "How does your scalp usually feel between washes?",
    options: ["Balanced", "Oily", "Dry", "Not sure"],
  },
  {
    question: "How do your lengths and ends usually feel?",
    options: ["Soft and comfortable", "Dry or frizzy", "Oily", "Not sure"],
  },
  {
    question: "Is your hair coloured or chemically treated?",
    options: ["Yes", "No"],
  },
];


export default function SkinTestModal({ onClose, onAdd }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [photo, setPhoto] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [addedProducts, setAddedProducts] = useState([]);
  const [AnalysisResult, setAnalysisResult] = useState(null);
  const [loading, setloading] = useState(false)
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const getQuestionAnswerArray = () => {
    const skinAnswers = skinQuestions.map((item, index) => ({
      category: "Skin",
      question: item.question,
      answer: answers[`1-${index}`] || "",
    }));

    const hairAnswers = hairQuestions.map((item, index) => ({
      category: "Hair",
      question: item.question,
      answer: answers[`2-${index}`] || "",
    }));

    return [...skinAnswers, ...hairAnswers];
  };

  const handleAnswer = (questionIndex, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [`${step}-${questionIndex}`]: answer,
    }));
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());

      if (photo?.url) {
        URL.revokeObjectURL(photo.url);
      }
    };
  }, [photo]);

  const startCamera = async () => {
    try {
      setCameraError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      setCameraError(error.message || "Unable to access camera.");
    }
  };

  useEffect(() => {
    if (cameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => { });
    }
  }, [cameraOpen]);

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], "beige-portrait.jpg", {
          type: "image/jpeg",
        });

        setPhoto({
          file,
          url: URL.createObjectURL(file),
        });

        stopCamera();
      },
      "image/jpeg"
    );
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const validationError = validateMediaFile(file);
    if (validationError) {
      setCameraError(validationError);
      return;
    }

    setCameraError("");

    setPhoto({
      file,
      url: URL.createObjectURL(file),
    });

    stopCamera();
    event.target.value = "";
  };

  const removePhoto = () => {
    if (photo?.url) {
      URL.revokeObjectURL(photo.url);
    }

    setPhoto(null);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };



  const handleContinue = async () => {
    if (step === 1) {
      const unanswered = skinQuestions.some(
        (_, index) => !answers[`1-${index}`]
      );

      if (unanswered) {
        toast.error("Please answer all skin questions before continuing.");
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      const unanswered = hairQuestions.some(
        (_, index) => !answers[`2-${index}`]
      );

      if (unanswered) {
        toast.error("Please answer all hair questions before continuing.");
        return;
      }

      setStep(3);
      return;
    }

    if (loading) return;

    if (!photo?.file) {
      toast.error("Please upload a face image or video.");
      return;
    }

    setloading(true);

    try {
      const questionAnswerArray = getQuestionAnswerArray();

      const formData = new FormData();

      formData.append("image", photo.file);
      formData.append("answers", JSON.stringify(questionAnswerArray));

      const response = await fetch(`${env.api_base_url}/skinAnalyze`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Skin analysis failed.");
      }

      setAnalysisResult(result.data);

      toast.success("Your skin analysis completed successfully.");

      stopCamera();
      setShowProfile(true);

    } catch (error) {
      console.error("Skin analysis error:", error);

      toast.error(
        error.message || "Unable to analyze your media. Please try again."
      );

    } finally {
      setloading(false);
    }
  };

  const handleEditAnswers = () => {
    setShowProfile(false);
    setStep(1);
  };

  const getSkinType = () => {
    return AnalysisResult?.skinAnalysis?.skinType || "Not assessed";
  };

  const hairType =
    AnalysisResult?.hairAnalysis?.hairType ||
    answers["2-0"] ||
    "Not assessed";
  const scalpType =
    AnalysisResult?.hairAnalysis?.scalpCondition ||
    answers["2-1"] ||
    "Not assessed";
  const hairCondition =
    AnalysisResult?.hairAnalysis?.hairCondition || "Not assessed";
  const skinTone =
    AnalysisResult?.skinAnalysis?.skinToneObservation || "Not assessed";
  const skinSummary = AnalysisResult?.skinAnalysis?.summary || "";
  const hairSummary = AnalysisResult?.hairAnalysis?.summary || "";
  const visibleConcerns =
    AnalysisResult?.skinAnalysis?.visibleConcerns || [];
  const generalAdvice =
    AnalysisResult?.recommendations?.generalAdvice || [];
  const morningRoutine =
    AnalysisResult?.recommendations?.morningRoutine || [];
  const nightRoutine =
    AnalysisResult?.recommendations?.nightRoutine || [];
  const hairCareRoutine =
    AnalysisResult?.recommendations?.hairCareRoutine || [];
  const dynamicProducts = AnalysisResult?.recommendedProducts || [];
  const disclaimer = AnalysisResult?.disclaimer || "";

  const handleAddToBag = (product) => {
    const productKey = String(product?._id || product?.productname || "");
    if (!productKey || addedProducts.includes(productKey)) return;

    if (!onAdd) {
      toast.error("Cart is not connected.");
      return;
    }

    const success = onAdd(product);

    if (success) {
      setAddedProducts((prev) => [...prev, productKey]);
    }
  };

  return (
    <div className="flex max-h-[90vh] flex-col overflow-hidden bg-[#FCFAF6] text-[#3F352D]">
      {/* HEADER (unchanged) */}
      <header className="sticky top-0 z-20 shrink-0 bg-[#FCFAF6] px-6 pt-5 max-[768px]:px-3 max-[768px]:pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl tracking-tight max-[550px]:text-[20px] max-[450px]:text-[18px]">
            Find your care ritual
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-[#F2EAE0]"
            aria-label="Close skin test"
          >
            <X size={21} strokeWidth={1.5} />
          </button>
        </div>

        <div
          data-drag-handle
          className="flex cursor-grab  max-[550px]:hidden touch-none justify-end pr-2 text-[#A58B70] active:cursor-grabbing"
        >
          <GripHorizontal size={23} strokeWidth={1.3} />
        </div>

        {!showProfile && (
          <div className="flex items-center justify-between border-t border-[#E2D4C3] py-5">
            {["Skin test", "Hair test", "Your photo"].map((label, index) => {
              const number = index + 1;
              const active = step === number;
              const completed = step > number;

              return (
                <div
                  key={label}
                  className={`flex items-center gap-2 text-xs max-[768px]:text-[10px] max-[768px]:gap-1 ${active || completed
                    ? "font-medium text-[#72543D]"
                    : "text-[#A58B70]"
                    }`}
                >
                  <span
                    className={`flex h-6 w-6 max-[768px]:h-5 max-[768px]:w-5 items-center justify-center rounded-full border ${active || completed
                      ? "border-[#72543D] bg-[#72543D] text-white"
                      : "border-[#D6C2A8]"
                      }`}
                  >
                    {completed ? <Check size={13} /> : number}
                  </span>

                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </header>

      {/* CARE PROFILE — CHANGED: now renders dynamic data from AnalysisResult */}
      {showProfile ? (
        <>
          <main className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 max-[768px]:px-3 max-[768px]:pb-6">
            <p className="mb-3 mt-7 max-[991px]:mt-4 max-[768px]:mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#72543D]">
              Your care profile
            </p>

            <h2 className="mb-6 font-serif text-[30px] max-[991px]:text-[26px] max-[768px]:text-[22px] max-[550px]:text-[20px] max-[450px]:text-[18px]">
              A ritual for you
            </h2>

            {/* PROFILE CARDS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="border border-[#E2D4C3] bg-[#F5EEE2] p-4 max-[881px]:p-3">
                <p className="text-xs text-[#806D5B]">
                  Skin type · AI analysis
                </p>

                <h3 className="mt-3 text-[20px] max-[768px]:text-[18px] max-[550px]:text-[16px]  font-semibold leading-6">
                  {getSkinType()}
                </h3>
              </div>

              <div className="border border-[#E2D4C3] bg-[#F5EEE2] p-4 max-[881px]:p-3">
                <p className="text-xs text-[#806D5B]">
                  Hair type · AI analysis
                </p>

                <h3 className="mt-3 text-[20px] max-[768px]:text-[18px] max-[550px]:text-[16px] font-semibold leading-6">
                  {hairType}
                </h3>

                <p className="mt-3 text-xs text-[#806D5B]">
                  Scalp: {scalpType}
                </p>
              </div>

              <div className="border border-[#E2D4C3] bg-[#F5EEE2] p-4 max-[881px]:p-3">
                <p className="text-xs text-[#806D5B]">
                  Skin tone · AI analysis
                </p>

                <h3 className="mt-3 text-[20px] max-[768px]:text-[18px] max-[550px]:text-[16px]  font-semibold leading-6">
                  {skinTone}
                </h3>
              </div>
            </div>

            {/* SUMMARIES */}
            {skinSummary && (
              <p className="text-sm leading-6 text-[#806D5B] mt-3">
                {skinSummary}
              </p>
            )}
            {hairSummary && (
              <p className="text-sm leading-6 text-[#806D5B] mt-2">
                {hairSummary}
              </p>
            )}

            {/* VISIBLE CONCERNS */}
            {visibleConcerns.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Visible concerns</h3>
                <ul className="list-disc pl-5 text-xs leading-5 text-[#806D5B]">
                  {visibleConcerns.map((concern, i) => (
                    <li key={i}>
                      {typeof concern === "string"
                        ? concern
                        : concern?.concern ||
                        concern?.name ||
                        JSON.stringify(concern)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ROUTINES */}
            {(morningRoutine.length > 0 ||
              nightRoutine.length > 0 ||
              hairCareRoutine.length > 0) && (
                <div className="mt-5 border border-[#E2D4C3] bg-[#F0E6D6] px-4 py-4 text-sm leading-6 text-[#806D5B]">
                  {morningRoutine.length > 0 && (
                    <div className="mb-2">
                      <p className="font-medium text-[#3F352D]">
                        Morning routine
                      </p>
                      <ul className="list-disc pl-5">
                        {morningRoutine.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {nightRoutine.length > 0 && (
                    <div className="mb-2">
                      <p className="font-medium text-[#3F352D]">Night routine</p>
                      <ul className="list-disc pl-5">
                        {nightRoutine.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {hairCareRoutine.length > 0 && (
                    <div>
                      <p className="font-medium text-[#3F352D]">
                        Hair care routine
                      </p>
                      <ul className="list-disc pl-5">
                        {hairCareRoutine.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            {/* GENERAL ADVICE */}
            {generalAdvice.length > 0 && (
              <div className="mt-3 border-l border-[#A58B70] pl-3 text-xs leading-5 text-[#806D5B]">
                <ul className="list-disc pl-4">
                  {generalAdvice.map((advice, i) => (
                    <li key={i}>{advice}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* RECOMMENDED PRODUCTS (DYNAMIC) */}
            <h3 className="my-5 max-[768px]:my-2 text-base font-medium">
              Explore care for your routine
            </h3>

            {dynamicProducts.length === 0 && (
              <p className="text-sm text-[#806D5B]">
                No product recommendations available yet.
              </p>
            )}

            {dynamicProducts.map((product) => {
              const productKey = String(product._id || product.productname || "");
              const isAdded = addedProducts.includes(productKey);

              return (
                <div
                  key={product._id || product.productname}
                  className="border-b border-[#E2D4C3] py-5 max-[768px]:py-4 max-[550px]:py-3"
                >
                  <h4 className="text-sm font-semibold">
                    {product.productname}
                  </h4>

                  <div className="mt-3 flex items-start justify-between gap-4">
                    <p className="flex-1 text-xs leading-5 text-[#806D5B]">
                      {product.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleAddToBag(product)}
                      disabled={isAdded}
                      className={`shrink-0 border px-4 py-3 text-xs transition ${isAdded
                        ? "border-black bg-black text-white"
                        : "border-[#A58B70] bg-transparent text-[#3F352D] hover:bg-[#F2EAE0]"
                        }`}
                    >
                      {isAdded ? "ADDED TO CART ✓" : "ADD TO BAG"}
                    </button>
                  </div>

                  <p className="mt-3 text-sm">
                    ₹{product.final_price || product.price}
                  </p>

                  {product.reason && (
                    <p className="mt-1 text-xs leading-5 text-[#806D5B] italic">
                      {product.reason}
                    </p>
                  )}

                  {product.usage && (
                    <p className="mt-1 text-xs leading-5 text-[#806D5B]">
                      Usage: {product.usage}
                    </p>
                  )}
                </div>
              );
            })}

            {disclaimer && (
              <p className="mt-3 text-xs leading-5 text-[#806D5B]">
                {disclaimer}
              </p>
            )}

            {hairCondition && hairCondition !== "Not assessed" && (
              <div className="mt-2 border-l border-[#A58B70] pl-3 text-xs leading-5 text-[#806D5B]">
                Hair condition: {hairCondition}
              </div>
            )}

            <div className="mt-2 border-l border-[#A58B70] pl-3 text-xs leading-5 text-[#806D5B]">
              These are cosmetic care suggestions, not a diagnosis. For
              persistent irritation or scalp symptoms, consult a qualified
              professional.
            </div>
          </main>

          {/* PROFILE FOOTER (unchanged) */}
          <footer className="flex shrink-0 items-center justify-between gap-4 bg-[#FCFAF6] px-6 py-5 sm:px-8">
            <button
              type="button"
              onClick={handleEditAnswers}
              className="text-sm underline underline-offset-4"
            >
              Edit answers
            </button>
          </footer>
        </>
      ) : (
        <>
          {/* QUESTIONNAIRE (unchanged) */}
          <main className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 max-[768px]:px-3 max-[768px]:pb-6">
            {step === 1 && (
              <>
                <p className="mb-6 max-[768px]:mb-4 text-sm leading-6 text-[#806D5B]">
                  Tell us how your skin feels during an ordinary day.
                </p>

                <div className="space-y-8">
                  {skinQuestions.map((item, index) => (
                    <section key={item.question}>
                      <h3 className="mb-5 text-[15px] font-medium leading-6">
                        {item.question}
                        <span className="ml-1 text-red-600">*</span>
                      </h3>

                      <div className="space-y-7">
                        {item.options.map((option) => (
                          <label
                            key={option}
                            className={`flex min-h-12 cursor-pointer items-center gap-3 border px-4 py-3 text-sm mb-3 transition ${answers[`1-${index}`] === option
                              ? "border-[#72543D] bg-[#F5EEE5]"
                              : "border-[#E2D4C3] hover:bg-[#F8F3EC]"
                              }`}
                          >
                            <input
                              type="radio"
                              name={`skin-question-${index}`}
                              checked={answers[`1-${index}`] === option}
                              onChange={() => handleAnswer(index, option)}
                              className="h-[18px] w-[18px] shrink-0 accent-[#72543D]"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className="mb-8 text-sm leading-6 text-[#806D5B]">
                  Tell us about your natural hair and everyday routine.
                </p>

                <div className="space-y-8">
                  {hairQuestions.map((item, index) => (
                    <section key={item.question}>
                      <h3 className="mb-5 text-[15px] font-medium leading-6">
                        {item.question}
                        <span className="ml-1 text-red-600">*</span>
                      </h3>

                      <div className="space-y-7">
                        {item.options.map((option) => (
                          <label
                            key={option}
                            className={`flex min-h-12 cursor-pointer items-center gap-3 border px-4 py-3 text-sm  mb-3 transition ${answers[`2-${index}`] === option
                              ? "border-[#72543D] bg-[#F5EEE5]"
                              : "border-[#E2D4C3] hover:bg-[#F8F3EC]"
                              }`}
                          >
                            <input
                              type="radio"
                              name={`hair-question-${index}`}
                              checked={answers[`2-${index}`] === option}
                              onChange={() => handleAnswer(index, option)}
                              className="h-[18px] w-[18px] shrink-0 accent-[#72543D]"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <p className="mb-6 text-sm leading-7 max-[550px]:leading-5 text-[#806D5B]">
                  Upload a clear face image or short video in natural light, with your face
                  and hair visible. The AI analyzes selected video frames.
                </p>

                <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden border border-[#E2D4C3] bg-[#EAE0D0] sm:min-h-[320px]">
                  {cameraOpen ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full max-h-[400px] w-full object-cover"
                    />
                  ) : photo ? (
                    isVideoFile(photo.file) ? (
                      <video
                        src={photo.url}
                        controls
                        playsInline
                        className="h-full max-h-[400px] w-full object-contain"
                      />
                    ) : (
                      <img
                        src={photo.url}
                        alt="Your portrait"
                        className="h-full max-h-[400px] w-full object-contain"
                      />
                    )
                  ) : (
                    <div className="flex flex-col items-center text-center text-[#A58B70]">
                      <Camera size={38} strokeWidth={1.8} />

                      <h3 className="mt-2 font-serif text-3xl text-[#72543D]">
                        Your portrait
                      </h3>

                      <p className="mt-1 text-sm">
                        Take a photo or upload an image or video.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  {cameraOpen ? (
                    <>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex items-center gap-2 border border-[#A58B70] px-5 py-3 text-sm transition hover:bg-[#F2EAE0]"
                      >
                        <Camera size={17} />
                        Capture photo
                      </button>

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="border border-[#A58B70] px-5 py-3 text-sm transition hover:bg-[#F2EAE0]"
                      >
                        Cancel camera
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex items-center gap-2 border border-[#A58B70] px-5 py-3 text-sm transition hover:bg-[#F2EAE0]"
                      >
                        <Camera size={17} />
                        Use camera
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 border border-[#A58B70] px-5 py-3 text-sm transition hover:bg-[#F2EAE0]"
                      >
                        <Upload size={17} />
                        Upload image or video
                      </button>
                    </>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm,video/x-m4v,video/x-msvideo,video/x-matroska,video/3gpp,.mov,.mp4,.webm,.m4v,.avi,.mkv,.3gp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <p className="mt-2 text-center text-xs text-[#806D5B]">
                    Images up to 10 MB · Videos up to 50 MB (AI samples the first 12 seconds)
                  </p>
                </div>

                {photo && !cameraOpen && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="mt-3 block w-full text-center text-xs underline underline-offset-4"
                  >
                    Remove photo
                  </button>
                )}

                {cameraError && (
                  <p className="mt-3 text-center text-sm text-red-700">
                    {cameraError}
                  </p>
                )}

                <p className="mt-6 text-xs leading-5 max-[550px]:leading-4 text-[#806D5B] ">
                  Beige does not save the upload to your account. It is sent to the
                  AI provider only when you request an AI feature.
                </p>

              </>
            )}
          </main>

          {/* QUESTIONNAIRE FOOTER (unchanged) */}
          <footer className="sticky bottom-0 z-10 flex shrink-0 items-center justify-between bg-[#FCFAF6] px-6 py-5 max-[768px]:px-3 max-[768px]:pb-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 text-sm underline underline-offset-4 transition hover:text-[#72543D]"
              >
                <ArrowLeft size={15} />
                Back
              </button>
            ) : (
              <span />
            )}

            {/* <button
              type="button"
              onClick={handleContinue}
              className="bg-[#72543D] px-7 py-4 max-[768px]:px-3 max-[768px]:py-3 text-xs text-white transition hover:bg-[#5D4330]"
            >
              {step === 1
                ? "Continue to hair test"
                : step === 2
                  ? "Continue to photo"
                  : "View my care profile"}
            </button> */}



            <button
              type="button"
              onClick={handleContinue}
              disabled={loading}
              className={`bg-[#72543D] px-7 py-4 max-[768px]:px-3 max-[768px]:py-3 text-xs text-white transition hover:bg-[#5D4330] flex items-center justify-center gap-2 ${loading ? "cursor-not-allowed opacity-70" : ""
                }`}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Analyzing your skin...
                </>
              ) : step === 1 ? (
                "Continue to hair test"
              ) : step === 2 ? (
                "Continue to photo"
              ) : (
                "View my care profile"
              )}
            </button>




          </footer>
        </>
      )}
    </div>
  );
}

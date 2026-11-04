
import { useEffect, useRef, useState } from "react";
import {
  X,
  GripHorizontal,
  Check,
  Camera,
  Upload,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

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

const recommendedProducts = [
  {
    name: "Beige Gentle Face Cleanser",
    description:
      "Explore an everyday cleanser; confirm the formula suits your skin and avoid products that irritate it.",
    price: 599,
  },
  {
    name: "Beige Everyday Face Cream",
    description:
      "Explore moisturizing care that feels comfortable for your skin.",
    price: 799,
  },
  {
    name: "Beige Daily Care Shampoo",
    description:
      "Explore shampoo options for your daily hair care needs.",
    price: 799,
  },
  {
    name: "Beige Everyday Conditioner",
    description:
      "Explore conditioning care that fits your natural hair pattern and routine.",
    price: 849,
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

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

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
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOpen]);

  // Capture photo
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

  // Upload photo
  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setCameraError("Please select a valid image.");
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

  // Remove photo
  const removePhoto = () => {
    if (photo?.url) {
      URL.revokeObjectURL(photo.url);
    }

    setPhoto(null);
  };

  // Back navigation
  const handleBack = () => {


    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  // Continue / View profile
 // Continue / View profile
const handleContinue = () => {


  // STEP 1: Validate skin questions
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

  // STEP 2: Validate hair questions
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

  // STEP 3: Photo is optional
  stopCamera();
  setShowProfile(true);
};

  // Edit answers
  const handleEditAnswers = () => {
    setShowProfile(false);
    setStep(1);

  };

  // Skin type calculation
  const getSkinType = () => {
    if (answers["1-0"] === "Oily") return "Oily";

    if (answers["1-0"] === "Tight or dry") return "Dry";

    if (answers["1-0"] === "Dry in some areas, oily in others") {
      return "Combination";
    }

    if (answers["1-2"] === "Often") return "Sensitive";

    return "Balanced / normal";
  };

  // Add recommendation to cart
  const handleAddToBag = (productName) => {
    if (addedProducts.includes(productName)) return;

    if (!onAdd) {
      toast.error("Cart is not connected.");
      return;
    }

    const success = onAdd(productName);

    if (success) {
      setAddedProducts((prev) => [...prev, productName]);
    }
  };

  // Hair information
  const hairType = answers["2-0"] || "Not assessed";
  const scalpType = answers["2-1"] || "Not assessed";
  const treatedHair = answers["2-3"] === "Yes";

  return (
    <div className="flex max-h-[90vh] flex-col overflow-hidden bg-[#FCFAF6] text-[#3F352D]">

      {/* HEADER */}
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

        {/* PROGRESS */}
        {!showProfile && (
          <div className="flex items-center justify-between border-t border-[#E2D4C3] py-5">
            {["Skin test", "Hair test", "Your photo"].map((label, index) => {
              const number = index + 1;
              const active = step === number;
              const completed = step > number;

              return (
                <div
                  key={label}
                  className={`flex items-center gap-2 text-xs max-[768px]:text-[10px] max-[768px]:gap-1 ${
                    active || completed
                      ? "font-medium text-[#72543D]"
                      : "text-[#A58B70]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 max-[768px]:h-5 max-[768px]:w-5 items-center justify-center rounded-full border ${
                      active || completed
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

      {/* CARE PROFILE */}
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
                  Skin type · from answers
                </p>

                <h3 className="mt-3 text-[20px] max-[768px]:text-[18px] max-[550px]:text-[16px]  font-semibold leading-6">
                  {getSkinType()}
                </h3>
              </div>

              <div className="border border-[#E2D4C3] bg-[#F5EEE2] p-4 max-[881px]:p-3">
                <p className="text-xs text-[#806D5B]">
                  Hair type · from answers
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
                  Face shape · photo estimate
                </p>

                <h3 className="mt-3 text-[20px] max-[768px]:text-[18px] max-[550px]:text-[16px]  font-semibold leading-6">
                  Not assessed
                </h3>

                <p className="mt-3 text-xs text-[#806D5B]">
                  Photo analysis not run
                </p>
              </div>
            </div>

            <p className="text-sm leading-6 text-[#806D5B] mt-2">
              This care profile is based on your answers. Photos alone cannot
              confirm oil balance, sensitivity or scalp condition.
            </p>

            <div className="mt-5 border border-[#E2D4C3] bg-[#F0E6D6] px-4 py-4 text-sm leading-6 text-[#806D5B]">
              Face-shape estimation and AI try-on will become available
              when the store&apos;s AI service is activated.
            </div>

            {/* RECOMMENDATIONS */}
            <h3 className="my-5 max-[768px]:my-2 text-base font-medium">
              Explore care for your routine
            </h3>

            {recommendedProducts.map((product) => {
              const isAdded = addedProducts.includes(product.name);

              return (
                <div
                  key={product.name}
                  className="border-b border-[#E2D4C3] py-5 max-[768px]:py-4 max-[550px]:py-3"
                >
                  <h4 className="text-sm font-semibold">
                    {product.name}
                  </h4>

                  <div className="mt-3 flex items-start justify-between gap-4">
                    <p className="flex-1 text-xs leading-5 text-[#806D5B]">
                      {product.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleAddToBag(product.name)}
                      disabled={isAdded}
                      className={`shrink-0 border px-4 py-3 text-xs transition ${
                        isAdded
                          ? "border-black bg-black text-white"
                          : "border-[#A58B70] bg-transparent text-[#3F352D] hover:bg-[#F2EAE0]"
                      }`}
                    >
                      {isAdded ? "ADDED TO CART ✓" : "ADD TO BAG"}
                    </button>
                  </div>

                  <p className="mt-3 text-sm">
                    ₹{product.price}
                  </p>
                </div>
              );
            })}

            <p className="mt-3 text-xs leading-5 text-[#806D5B]">
              Products are illustrative samples. Suitability depends on the final
              ingredients and your individual response; these are suggestions,
              not a confirmed formulation match.
            </p>

            {treatedHair && (
              <div className="mt-2 border-l border-[#A58B70] pl-3 text-xs leading-5 text-[#806D5B]">
                You reported treated hair. Check that the final shampoo and
                conditioner are suitable for treated hair.
              </div>
            )}

            <div className="mt-2 border-l border-[#A58B70] pl-3 text-xs leading-5 text-[#806D5B]">
              These are cosmetic care suggestions, not a diagnosis. For
              persistent irritation or scalp symptoms, consult a qualified
              professional.
            </div>
          </main>

          {/* PROFILE FOOTER */}
          <footer className="flex shrink-0 items-center justify-between gap-4 bg-[#FCFAF6] px-6 py-5 sm:px-8">
            <button
              type="button"
              onClick={handleEditAnswers}
              className="text-sm underline underline-offset-4"
            >
              Edit answers
            </button>

            <button
              type="button"
              onClick={() => toast.info("AI try-on is not activated yet.")}
              className="bg-[#72543D] px-6 py-4 text-xs text-white transition hover:bg-[#5D4330]"
            >
              Try lip colour & foundation
            </button>
          </footer>
        </>
      ) : (
        <>
          {/* QUESTIONNAIRE */}
          <main className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 max-[768px]:px-3 max-[768px]:pb-6">



            {/* STEP 1 - SKIN TEST */}
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
                            className={`flex min-h-12 cursor-pointer items-center gap-3 border px-4 py-3 text-sm mb-3 transition ${
                              answers[`1-${index}`] === option
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

            {/* STEP 2 - HAIR TEST */}
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
                            className={`flex min-h-12 cursor-pointer items-center gap-3 border px-4 py-3 text-sm  mb-3 transition ${
                              answers[`2-${index}`] === option
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

            {/* STEP 3 - PHOTO */}
            {step === 3 && (
              <>
                <p className="mb-6 text-sm leading-7 max-[550px]:leading-5 text-[#806D5B]">
                  Use a clear front-facing photo in natural light, with your face
                  and hair visible. For try-on, avoid filters and heavy makeup.
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
                    <img
                      src={photo.url}
                      alt="Your portrait"
                      className="h-full max-h-[400px] w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center text-[#A58B70]">
                      <Camera size={38} strokeWidth={1.8} />

                      <h3 className="mt-2 font-serif text-3xl text-[#72543D]">
                        Your portrait
                      </h3>

                      <p className="mt-1 text-sm">
                        Take a photo or upload one from your device.
                      </p>
                    </div>
                  )}
                </div>

                {/* PHOTO CONTROLS */}
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
                        Upload photo
                      </button>
                    </>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
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
                  Beige does not save the photo to your account. It is sent to the
                  AI provider only when you request an AI feature.
                </p>

                <div className="mt-2 max-[550px]:leading-5 border border-[#E2D4C3] bg-[#F0E6D6] px-4 py-4 text-sm leading-6 max-[550px]:text-[14px] text-[#806D5B]">
                  AI photo features are awaiting activation. The skin and hair
                  questionnaire still gives you a care profile.
                </div>
              </>
            )}
          </main>

          {/* QUESTIONNAIRE FOOTER */}
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

            <button
              type="button"
              onClick={handleContinue}
              className="bg-[#72543D] px-7 py-4 max-[768px]:px-3 max-[768px]:py-3 text-xs text-white transition hover:bg-[#5D4330]"
            >
              {step === 1
                ? "Continue to hair test"
                : step === 2
                ? "Continue to photo"
                : "View my care profile"}
            </button>
          </footer>
        </>
      )}
    </div>
  );
}

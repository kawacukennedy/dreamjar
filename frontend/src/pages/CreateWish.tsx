import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useAnalytics } from "../hooks/useAnalytics";
import { useOfflineStorage } from "../hooks/useOfflineStorage";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import Button from "../components/Button";
import Input from "../components/Input";

const DREAM_TEMPLATES = [
  {
    title: "Run a Marathon",
    description: "Complete a full marathon (42.195km) in under 4 hours...",
    category: "Health & Fitness",
    stakeAmount: "100",
  },
  {
    title: "Learn Guitar",
    description: "Master 10 songs on guitar within 6 months...",
    category: "Arts & Music",
    stakeAmount: "50",
  },
  {
    title: "Write a Novel",
    description: "Complete a 50,000-word novel within 12 months...",
    category: "Creative",
    stakeAmount: "200",
  },
  {
    title: "Learn a New Language",
    description: "Achieve conversational fluency in Spanish within 6 months...",
    category: "Education",
    stakeAmount: "75",
  },
];

function CreateWish() {
  const [isWizardOpen, setIsWizardOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    visibility: "public" as "public" | "private" | "friends",
    proofMethod: "media" as "media" | "gps" | "github" | "strava" | "custom",
    stakeAmount: "",
    deadline: "",
    impactAllocationOnFail: 50,
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const { token } = useAuth();
  const { addToast } = useToast();
  const { trackWishCreate } = useAnalytics();
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();

  // Auto-save draft
  const { value: draft, setValue: saveDraft } = useOfflineStorage({
    key: "dreamDraft",
    defaultValue: null,
  });

  // Load draft on mount
  useEffect(() => {
    if (draft) {
      setForm(draft);
      addToast("Draft loaded from previous session", "info");
    }
  }, [draft, addToast]);

  // Auto-save form changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (form.title || form.description) {
        saveDraft(form);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [form, saveDraft]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.title.trim()) newErrors.title = "Title is required";
      if (!form.description.trim())
        newErrors.description = "Description is required";
      if (!form.category) newErrors.category = "Category is required";
    } else if (step === 2) {
      // Proof method validation
    } else if (step === 3) {
      if (!form.stakeAmount || parseFloat(form.stakeAmount) <= 0)
        newErrors.stakeAmount = "Valid stake amount required";
      if (!form.deadline) newErrors.deadline = "Deadline is required";
      else if (new Date(form.deadline) <= new Date())
        newErrors.deadline = "Deadline must be in the future";
    } else if (step === 4) {
      if (!form.termsAccepted) newErrors.terms = "You must accept the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const applyTemplate = (template: (typeof DREAM_TEMPLATES)[0]) => {
    setForm((prev) => ({
      ...prev,
      title: template.title,
      description: template.description,
      category: template.category,
      stakeAmount: template.stakeAmount,
    }));
    setShowTemplates(false);
    addToast("Template applied! Customize as needed.", "success");
  };

  const handleSubmit = async () => {
    if (!token) {
      addToast("Please connect your wallet first", "warning");
      return;
    }
    if (!validateStep(4)) return;

    setLoading(true);
    const data = {
      title: form.title,
      description: form.description,
      stakeAmountMicroTon: parseFloat(form.stakeAmount) * 1000000000,
      goalDeadline: new Date(form.deadline).toISOString(),
      proofMethod: form.proofMethod,
      visibility: form.visibility,
      impactAllocation: {
        on_fail_percent: form.impactAllocationOnFail,
        beneficiary: "DAO",
      },
    };

    try {
      // Mock TON Connect transaction
      const transaction = {
        validUntil: Date.now() + 1000000,
        messages: [
          {
            address: "mock_contract_address",
            amount: data.stakeAmountMicroTon.toString(),
          },
        ],
      };

      await tonConnectUI.sendTransaction(transaction);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/wishes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        trackWishCreate(data);
        saveDraft(null);
        addToast("Dream created successfully!", "success");
        setIsWizardOpen(false);
        navigate(`/wish/${result.wishId}`);
      } else {
        const errorData = await response.json();
        addToast(errorData.message || "Failed to create dream", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("Failed to create dream", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Dream Title *
              </label>
              <Input
                type="text"
                placeholder="e.g., Run a Marathon"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                error={errors.title}
                maxLength={120}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description *
              </label>
              <textarea
                placeholder="Describe your goal in detail..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-32 resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {form.description.length}/2000 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select a category</option>
                <option value="Health & Fitness">🏃 Health & Fitness</option>
                <option value="Arts & Music">🎨 Arts & Music</option>
                <option value="Education">📚 Education</option>
                <option value="Travel">✈️ Travel</option>
                <option value="Career">💼 Career</option>
                <option value="Personal">🌟 Personal</option>
                <option value="Other">📌 Other</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Visibility
              </label>
              <select
                value={form.visibility}
                onChange={(e) =>
                  setForm({ ...form, visibility: e.target.value as any })
                }
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="public">
                  🌍 Public - Anyone can see and support
                </option>
                <option value="friends">
                  👥 Friends - Only friends can see
                </option>
                <option value="private">🔒 Private - Only you can see</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-4">
                How will you prove completion?
              </label>
              <div className="space-y-3">
                {[
                  {
                    value: "media",
                    label: "📸 Media Upload",
                    desc: "Photos/videos of your progress",
                  },
                  {
                    value: "gps",
                    label: "📍 GPS Location",
                    desc: "Location-based proof (e.g., running routes)",
                  },
                  {
                    value: "github",
                    label: "💻 GitHub Commits",
                    desc: "Code repository activity",
                  },
                  {
                    value: "strava",
                    label: "🏃 Strava Activity",
                    desc: "Fitness tracking data",
                  },
                  {
                    value: "custom",
                    label: "✨ Custom Proof",
                    desc: "Other verification method",
                  },
                ].map((method) => (
                  <label
                    key={method.value}
                    className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      type="radio"
                      name="proofMethod"
                      value={method.value}
                      checked={form.proofMethod === method.value}
                      onChange={(e) =>
                        setForm({ ...form, proofMethod: e.target.value as any })
                      }
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {method.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">
                📋 Instructions for {form.proofMethod}:
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {form.proofMethod === "media" &&
                  "Upload photos/videos showing your progress and final completion."}
                {form.proofMethod === "gps" &&
                  "Share location data proving you reached your destination."}
                {form.proofMethod === "github" &&
                  "Link your repository and show commit history."}
                {form.proofMethod === "strava" &&
                  "Connect your Strava account to verify activities."}
                {form.proofMethod === "custom" &&
                  "Describe how community will verify your achievement."}
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Stake Amount (TON) *
              </label>
              <Input
                type="number"
                placeholder="0.1"
                step="0.01"
                min="0.01"
                value={form.stakeAmount}
                onChange={(e) =>
                  setForm({ ...form, stakeAmount: e.target.value })
                }
                error={errors.stakeAmount}
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 0.01 TON • This amount will be locked until completion
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Suggested Stakes
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1000, 5000, 10000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        stakeAmount: (amount / 1000000).toString(),
                      })
                    }
                    className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                  >
                    {(amount / 1000000).toFixed(2)} TON
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Deadline *
              </label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                error={errors.deadline}
                min={
                  new Date(Date.now() + 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 24 hours from now, max 2 years
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Impact Allocation on Failure: {form.impactAllocationOnFail}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.impactAllocationOnFail}
                onChange={(e) =>
                  setForm({
                    ...form,
                    impactAllocationOnFail: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                If you fail, this percentage goes to public impact pool
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-3">📋 Review Your Dream</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Title:</strong> {form.title}
                </p>
                <p>
                  <strong>Category:</strong> {form.category}
                </p>
                <p>
                  <strong>Proof Method:</strong> {form.proofMethod}
                </p>
                <p>
                  <strong>Stake:</strong> {form.stakeAmount} TON
                </p>
                <p>
                  <strong>Deadline:</strong>{" "}
                  {new Date(form.deadline).toLocaleDateString()}
                </p>
                <p>
                  <strong>Impact Allocation:</strong>{" "}
                  {form.impactAllocationOnFail}% on failure
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={form.termsAccepted}
                onChange={(e) =>
                  setForm({ ...form, termsAccepted: e.target.checked })
                }
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  Terms of Service
                </a>{" "}
                and understand that my stake will be locked until completion or
                failure verification.
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-sm">{errors.terms}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Button
          onClick={() => setIsWizardOpen(true)}
          className="w-full text-xl py-4"
        >
          🚀 Create Your Dream
        </Button>
      </div>

      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title={`Create Wish - Step ${currentStep} of 4`}
        size="lg"
        preventClose={loading}
      >
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            {["Goal", "Proof", "Stake", "Confirm"].map((step, index) => (
              <div
                key={step}
                className={`flex-1 text-center text-sm ${
                  index + 1 <= currentStep
                    ? "text-primary font-medium"
                    : "text-gray-400"
                }`}
              >
                {index + 1}. {step}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStepContent()}</div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="secondary"
            onClick={prevStep}
            disabled={currentStep === 1 || loading}
          >
            ← Back
          </Button>

          {currentStep < 4 ? (
            <Button onClick={nextStep}>Next →</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading || !token}>
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Creating...
                </>
              ) : (
                "🚀 Create on TON"
              )}
            </Button>
          )}
        </div>

        {!token && (
          <p className="text-orange-600 text-sm mt-4 text-center">
            Please connect your wallet to create a dream
          </p>
        )}
      </Modal>

      {/* Templates Modal */}
      <Modal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        title="Choose a Template"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {DREAM_TEMPLATES.map((template, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:border-primary cursor-pointer"
              onClick={() => applyTemplate(template)}
            >
              <h3 className="font-semibold mb-2">{template.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {template.description}
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-primary">{template.category}</span>
                <span>{template.stakeAmount} TON</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default CreateWish;

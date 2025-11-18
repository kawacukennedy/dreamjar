import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useAnalytics } from "../hooks/useAnalytics";
import { useOfflineStorage } from "../hooks/useOfflineStorage";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import { CATEGORIES } from "../contexts/SearchContext";

const DREAM_TEMPLATES = [
  {
    title: "Run a Marathon",
    description:
      "Complete a full marathon (42.195km) in under 4 hours. I'll train consistently for 6 months, building up my endurance and speed through structured running plans.",
    category: "Health & Fitness",
    stakeAmount: "100",
  },
  {
    title: "Learn Guitar",
    description:
      "Master 10 songs on guitar within 6 months. I'll practice daily, take online lessons, and perform for friends by the deadline.",
    category: "Arts & Music",
    stakeAmount: "50",
  },
  {
    title: "Write a Novel",
    description:
      "Complete a 50,000-word novel within 12 months. I'll write 1,000 words per day and share progress updates weekly.",
    category: "Creative",
    stakeAmount: "200",
  },
  {
    title: "Learn a New Language",
    description:
      "Achieve conversational fluency in Spanish within 6 months through daily practice, language exchange, and immersion activities.",
    category: "Education",
    stakeAmount: "75",
  },
];

function CreateWish() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    stakeAmount: "",
    deadline: "",
    validatorMode: "community",
    category: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [autoSaved, setAutoSaved] = useState(false);

  const { token } = useAuth();
  const { addToast } = useToast();
  const { trackWishCreate } = useAnalytics();
  const navigate = useNavigate();

  // Auto-save draft
  const { value: draft, setValue: saveDraft } = useOfflineStorage({
    key: "dreamDraft",
    defaultValue: null,
  });

  // Load draft on mount
  useEffect(() => {
    if (draft && !form.title) {
      setForm(draft);
      addToast("Draft loaded from previous session", "info");
    }
  }, [draft, addToast]);

  // Auto-save form changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (form.title || form.description) {
        saveDraft(form);
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2000);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [form, saveDraft]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.stakeAmount || parseFloat(form.stakeAmount) <= 0)
      newErrors.stakeAmount = "Valid stake amount required";
    if (!form.deadline) newErrors.deadline = "Deadline is required";
    else if (new Date(form.deadline) <= new Date())
      newErrors.deadline = "Deadline must be in the future";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const applyTemplate = (template: (typeof DREAM_TEMPLATES)[0]) => {
    setForm((prev) => ({
      ...prev,
      ...template,
    }));
    setShowTemplates(false);
    addToast("Template applied! Customize as needed.", "success");
  };

  const clearDraft = () => {
    saveDraft(null);
    setForm({
      title: "",
      description: "",
      stakeAmount: "",
      deadline: "",
      validatorMode: "community",
      category: "",
    });
    addToast("Draft cleared", "info");
  };

  const getFormProgress = () => {
    let completed = 0;
    if (form.title.trim()) completed++;
    if (form.description.trim()) completed++;
    if (form.stakeAmount && parseFloat(form.stakeAmount) > 0) completed++;
    if (form.deadline && new Date(form.deadline) > new Date()) completed++;
    if (form.category) completed++;
    return (completed / 5) * 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      addToast("Please connect your wallet first", "warning");
      return;
    }
    if (!validateForm()) return;

    setLoading(true);
    const data = {
      ...form,
      stakeAmount: parseFloat(form.stakeAmount) * 1000000000, // to nanotons
      deadline: new Date(form.deadline).toISOString(),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wish`, {
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
        saveDraft(null); // Clear draft on success
        addToast("Dream created successfully!", "success");
        navigate(`/wish/${result.wishJar._id}`);
      } else {
        const errorData = await response.json();
        addToast(
          errorData.message || "Failed to create dream. Please try again.",
          "error",
        );
      }
    } catch (error) {
      console.error(error);
      addToast("Failed to create dream. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const estimatedGas = parseFloat(form.stakeAmount || "0") * 0.01; // Mock gas estimate

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Your Dream</h1>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {autoSaved && (
            <span className="text-sm text-green-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Auto-saved
            </span>
          )}
          <button
            onClick={() => setShowTemplates(true)}
            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Use Template
          </button>
          {draft && (
            <button
              onClick={clearDraft}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Clear Draft
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Form Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(getFormProgress())}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${getFormProgress()}%` }}
          />
        </div>
      </div>

      {/* Live Preview */}
      <div
        className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg mb-6"
        role="region"
        aria-labelledby="preview-heading"
      >
        <h2 id="preview-heading" className="text-lg font-semibold mb-4">
          Live Preview
        </h2>
        <div
          className="border rounded p-4 bg-gray-50 dark:bg-gray-700"
          role="region"
          aria-labelledby="dream-preview"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 id="dream-preview" className="font-bold text-lg flex-1">
              {form.title || "Your Dream Title"}
            </h3>
            {form.category && (
              <span className="text-xs bg-primary text-white px-2 py-1 rounded-full ml-2">
                {form.category}
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
            {form.description || "Describe your dream here..."}
          </p>
          <div className="mt-4 flex flex-col sm:flex-row sm:justify-between text-sm space-y-1 sm:space-y-0">
            <span aria-label={`Stake amount: ${form.stakeAmount || "0"} TON`}>
              💰 Stake: {form.stakeAmount || "0"} TON
            </span>
            <span
              aria-label={`Deadline: ${form.deadline ? new Date(form.deadline).toLocaleDateString() : "Not set"}`}
            >
              📅 Deadline:{" "}
              {form.deadline
                ? new Date(form.deadline).toLocaleDateString()
                : "Not set"}
            </span>
            <span aria-label={`Validation mode: ${form.validatorMode}`}>
              🗳️{" "}
              {form.validatorMode === "community"
                ? "Community Voting"
                : "Designated Validators"}
            </span>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg space-y-6"
        role="form"
        aria-labelledby="create-form-heading"
        noValidate
      >
        <h2 id="create-form-heading" className="sr-only">
          Create Dream Form
        </h2>
        <div>
          <label
            htmlFor="dream-title"
            className="block text-sm font-medium mb-2"
          >
            Dream Title{" "}
            <span className="text-red-500" aria-label="required">
              *
            </span>
          </label>
          <input
            id="dream-title"
            type="text"
            placeholder="e.g., Run a Marathon"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
              errors.title ? "border-red-500" : ""
            }`}
            required
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <p
              id="title-error"
              className="text-red-500 text-sm mt-1"
              role="alert"
            >
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="dream-description"
            className="block text-sm font-medium mb-2"
          >
            Dream Description{" "}
            <span className="text-red-500" aria-label="required">
              *
            </span>
          </label>
          <textarea
            id="dream-description"
            placeholder="Describe your goal in detail..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 h-32 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none ${
              errors.description ? "border-red-500" : ""
            }`}
            required
            aria-required="true"
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description ? "description-error" : "description-help"
            }
          />
          <p id="description-help" className="text-sm text-gray-500 mt-1">
            Provide details about your dream to help others understand and
            support it.
          </p>
          {errors.description && (
            <p
              id="description-error"
              className="text-red-500 text-sm mt-1"
              role="alert"
            >
              {errors.description}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="stake-amount"
            className="block text-sm font-medium mb-2"
          >
            Stake Amount (TON){" "}
            <span className="text-red-500" aria-label="required">
              *
            </span>
          </label>
          <input
            id="stake-amount"
            type="number"
            placeholder="0.1"
            step="0.01"
            min="0.01"
            value={form.stakeAmount}
            onChange={(e) => setForm({ ...form, stakeAmount: e.target.value })}
            className={`w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
              errors.stakeAmount ? "border-red-500" : ""
            }`}
            required
            aria-required="true"
            aria-invalid={!!errors.stakeAmount}
            aria-describedby={errors.stakeAmount ? "stake-error" : "stake-help"}
          />
          <p id="stake-help" className="text-sm text-gray-500 mt-1">
            This is the amount you'll stake on your dream. Minimum 0.01 TON.
          </p>
          {errors.stakeAmount && (
            <p
              id="stake-error"
              className="text-red-500 text-sm mt-1"
              role="alert"
            >
              {errors.stakeAmount}
            </p>
          )}
          {form.stakeAmount && !errors.stakeAmount && (
            <p className="text-sm text-green-600 mt-1" aria-live="polite">
              Estimated network fee: ~{estimatedGas.toFixed(3)} TON
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="dream-deadline"
            className="block text-sm font-medium mb-2"
          >
            Dream Deadline{" "}
            <span className="text-red-500" aria-label="required">
              *
            </span>
          </label>
          <input
            id="dream-deadline"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className={`w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
              errors.deadline ? "border-red-500" : ""
            }`}
            required
            aria-required="true"
            aria-invalid={!!errors.deadline}
            aria-describedby={
              errors.deadline ? "deadline-error" : "deadline-help"
            }
            min={
              new Date(Date.now() + 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            }
          />
          <p id="deadline-help" className="text-sm text-gray-500 mt-1">
            Choose when you plan to complete your dream. Must be at least 24
            hours from now.
          </p>
          {errors.deadline && (
            <p
              id="deadline-error"
              className="text-red-500 text-sm mt-1"
              role="alert"
            >
              {errors.deadline}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="dream-category"
            className="block text-sm font-medium mb-2"
          >
            Category
          </label>
          <select
            id="dream-category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            aria-describedby="category-help"
          >
            <option value="">Select a category (optional)</option>
            <option value="Health & Fitness">Health & Fitness</option>
            <option value="Arts & Music">Arts & Music</option>
            <option value="Education">Education</option>
            <option value="Travel">Travel</option>
            <option value="Career">Career</option>
            <option value="Personal">Personal</option>
            <option value="Other">Other</option>
          </select>
          <p id="category-help" className="text-sm text-gray-500 mt-1">
            Categorizing helps others find dreams they're interested in
            supporting.
          </p>
        </div>

        <div>
          <label
            htmlFor="validation-mode"
            className="block text-sm font-medium mb-2"
          >
            Validation Mode
          </label>
          <select
            id="validation-mode"
            value={form.validatorMode}
            onChange={(e) =>
              setForm({ ...form, validatorMode: e.target.value })
            }
            className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            aria-describedby="validation-help"
          >
            <option value="community">Community Voting</option>
            <option value="designatedValidators">Designated Validators</option>
          </select>
          <p id="validation-help" className="text-sm text-gray-500 mt-1">
            Community voting allows anyone to vote on your proof. Designated
            validators require specific people to approve.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full bg-primary text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:focus:ring-gray-400"
          aria-describedby={!token ? "wallet-required" : undefined}
        >
          {loading && <LoadingSpinner className="mr-2" aria-hidden="true" />}
          {loading ? "Creating Your Dream..." : "Create Dream"}
        </button>
        {!token && (
          <p
            id="wallet-required"
            className="text-sm text-orange-600 mt-2"
            role="alert"
          >
            Please connect your wallet to create a dream.
          </p>
        )}
      </form>

      {/* Templates Modal */}
      <Modal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        title="Choose a Dream Template"
        size="lg"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {DREAM_TEMPLATES.map((template, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => applyTemplate(template)}
            >
              <h3 className="font-semibold text-lg mb-2">{template.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                {template.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary font-medium">
                  {template.category}
                </span>
                <span className="text-gray-500">
                  {template.stakeAmount} TON
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Templates help you get started quickly. You can customize all
            details after applying a template.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default CreateWish;

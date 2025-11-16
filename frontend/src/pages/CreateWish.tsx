import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";

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
  const { token } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("Please connect your wallet first");
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
        addToast("Dream created successfully!", "success");
        navigate("/");
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Create Your Dream</h1>

      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6"
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
          <h3 id="dream-preview" className="font-bold text-lg">
            {form.title || "Your Dream Title"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {form.description || "Describe your dream here..."}
          </p>
          <div className="mt-4 flex justify-between text-sm">
            <span aria-label={`Stake amount: ${form.stakeAmount || "0"} TON`}>
              Stake: {form.stakeAmount || "0"} TON
            </span>
            <span
              aria-label={`Deadline: ${form.deadline ? new Date(form.deadline).toLocaleDateString() : "Not set"}`}
            >
              Deadline:{" "}
              {form.deadline
                ? new Date(form.deadline).toLocaleDateString()
                : "Not set"}
            </span>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-4"
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
    </div>
  );
}

export default CreateWish;

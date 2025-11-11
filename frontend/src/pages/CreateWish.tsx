import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { api } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

function CreateWish() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    stakeAmount: "",
    deadline: "",
    validatorMode: "community",
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
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create Your Dream</h2>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div className="border rounded p-4 bg-gray-50 dark:bg-gray-700">
          <h4 className="font-bold text-lg">
            {form.title || "Your Dream Title"}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {form.description || "Describe your dream here..."}
          </p>
          <div className="mt-4 flex justify-between text-sm">
            <span>Stake: {form.stakeAmount || "0"} TON</span>
            <span>
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
      >
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            placeholder="e.g., Run a Marathon"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
          {errors.title && (
            <p className="text-danger text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description *
          </label>
          <textarea
            placeholder="Describe your goal in detail..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600 h-32"
            required
          />
          {errors.description && (
            <p className="text-danger text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Stake Amount (TON) *
          </label>
          <input
            type="number"
            placeholder="0.1"
            step="0.01"
            min="0.01"
            value={form.stakeAmount}
            onChange={(e) => setForm({ ...form, stakeAmount: e.target.value })}
            className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
          {errors.stakeAmount && (
            <p className="text-danger text-sm mt-1">{errors.stakeAmount}</p>
          )}
          {form.stakeAmount && (
            <p className="text-sm text-gray-500 mt-1">
              Estimated gas: ~{estimatedGas.toFixed(3)} TON
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Deadline *</label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
            required
          />
          {errors.deadline && (
            <p className="text-danger text-sm mt-1">{errors.deadline}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Validation Mode
          </label>
          <select
            value={form.validatorMode}
            onChange={(e) =>
              setForm({ ...form, validatorMode: e.target.value })
            }
            className="w-full p-3 border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="community">Community Voting</option>
            <option value="designatedValidators">Designated Validators</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white p-3 rounded hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center"
        >
          {loading && <LoadingSpinner className="mr-2" />}
          {loading ? "Creating..." : "Create Dream"}
        </button>
      </form>
    </div>
  );
}

export default CreateWish;

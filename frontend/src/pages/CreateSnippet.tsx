import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";

type ValidationErrors = {
  FieldErrors?: {
    Title?: string;
    Content?: string;
    Expires?: string;
  };
};

export default function CreateSnippet() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expires, setExpires] = useState(7);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    try {
      const res = await apiFetch<{ id: number }>("/snippet/create", "POST", {
        title,
        content,
        expires,
      });
      navigate(`/snippet/${res.id}`);
    } catch (err: any) {
      if (err?.FieldErrors) {
        setErrors(err);
      } else {
        setServerError(err?.message || "Something went wrong");
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Create Snippet</h1>
        <p className="text-sm text-gray-500 mt-1">
          Share a piece of code with your team
        </p>
      </div>

      {serverError && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-md mb-6">
          {serverError}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            {errors.FieldErrors?.Title && (
              <p className="text-red-500 text-xs mb-1">{errors.FieldErrors.Title}</p>
            )}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Auth middleware in Go"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            {errors.FieldErrors?.Content && (
              <p className="text-red-500 text-xs mb-1">{errors.FieldErrors.Content}</p>
            )}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Paste your code here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires
            </label>
            {errors.FieldErrors?.Expires && (
              <p className="text-red-500 text-xs mb-1">{errors.FieldErrors.Expires}</p>
            )}
            <select
              value={expires}
              onChange={(e) => setExpires(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={1}>1 Day</option>
              <option value={7}>1 Week</option>
              <option value={365}>1 Year</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Create Snippet
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
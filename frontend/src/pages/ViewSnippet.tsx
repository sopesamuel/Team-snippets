import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

type Snippet = {
  ID: number;
  Title: string;
  Content: string;
  Created: string;
  Expires: string;
};

type User = {
  ID: number;
  Name: string;
  Email: string;
};

type ShareResponse = {
  message: string;
};

export default function ViewSnippet() {
  const { id } = useParams();
  const { user } = useAuth();

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [sharedWithID, setSharedWithID] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    apiFetch<Snippet>(`/snippet/view/${id}`)
      .then((data) => setSnippet(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleOpenModal() {
    setShowShareModal(true);
    setShareMessage("");
    setShareError("");
    try {
      const data = await apiFetch<User[]>("/users");
      setUsers((data ?? []).filter((u) => u.ID !== user?.ID));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    setShareMessage("");
    setShareError("");
    try {
      await apiFetch<ShareResponse>("/snippet/share", "POST", {
        snippet_id: Number(id),
        shared_with_id: Number(sharedWithID),
      });
      setShareMessage("Snippet shared successfully!");
      setSharedWithID("");
    } catch (err: any) {
      setShareError(err?.message || "Something went wrong");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Snippet not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{snippet.Title}</h1>
          <div className="flex gap-4 mt-1">
            <span className="text-xs text-gray-400">
              Created: {new Date(snippet.Created).toLocaleDateString()}
            </span>
            <span className="text-xs text-gray-400">
              Expires: {new Date(snippet.Expires).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Share
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <pre className="p-6 text-sm font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap">
          {snippet.Content}
        </pre>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              Share Snippet
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose a teammate to share this snippet with
            </p>

            {shareMessage && (
              <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-md mb-4">
                {shareMessage}
              </div>
            )}
            {shareError && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-md mb-4">
                {shareError}
              </div>
            )}

            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Share with
                </label>
                <select
                  value={sharedWithID}
                  onChange={(e) => setSharedWithID(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a teammate</option>
                  {users.map((u) => (
                    <option key={u.ID} value={u.ID}>
                      {u.Name} ({u.Email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={!sharedWithID}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
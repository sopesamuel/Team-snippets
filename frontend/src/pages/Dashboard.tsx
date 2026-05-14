import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

type Snippet = {
  ID: number;
  Title: string;
  Content: string;
  Created: string;
  Expires: string;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [sharedSnippets, setSharedSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [latest, shared] = await Promise.all([
          apiFetch<Snippet[]>("/"),
          apiFetch<Snippet[]>("/snippet/shared"),
        ]);
        setSnippets(latest ?? []);
        setSharedSnippets(shared ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.Name} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here's what's happening on your team
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Latest Snippets
        </h2>
        {snippets.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-10 text-center text-gray-400 text-sm">
            No snippets yet.{" "}
            <Link to="/snippet/create" className="text-indigo-600 hover:underline">
              Create one
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {snippets.map((s) => (
              <Link
                key={`latest-${s.ID}`}
                to={`/snippet/${s.ID}`}
                className="block bg-white border border-gray-200 rounded-xl px-6 py-4 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{s.Title}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(s.Created).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 truncate">{s.Content}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Shared With Me
        </h2>
        {sharedSnippets.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-10 text-center text-gray-400 text-sm">
            Nothing shared with you yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sharedSnippets.map((s) => (
              <Link
                key={`latest-${s.ID}`}
                to={`/snippet/${s.ID}`}
                className="block bg-white border border-gray-200 rounded-xl px-6 py-4 hover:border-indigo-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{s.Title}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(s.Created).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1 truncate">{s.Content}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

type LoginResponse = {
  message: string;
};

type ValidationErrors = {
  FieldErrors?: {
    Email?: string;
    Password?: string;
  };
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    try {
      await apiFetch<LoginResponse>("/user/login", "POST", { email, password });
      const user = await apiFetch<{ ID: number; Name: string; Email: string; Created: string }>("/account/view");
      login(user);
      navigate("/dashboard");
    } catch (err: any) {
      if (err?.FieldErrors) {
        setErrors(err);
      } else {
        setServerError(err?.message || "Something went wrong");
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Login to your TeamSnippet account</p>

        {serverError && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-md mb-4">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            {errors.FieldErrors?.Email && (
              <p className="text-red-500 text-xs mb-1">{errors.FieldErrors.Email}</p>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            {errors.FieldErrors?.Password && (
              <p className="text-red-500 text-xs mb-1">{errors.FieldErrors.Password}</p>
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
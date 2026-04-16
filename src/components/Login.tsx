import React, { useState } from "react";
import { motion } from "framer-motion"; // Note: changed from motion/react to framer-motion (standard)
import {
  Leaf,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { User } from "../types";

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(""); // This is 'name' in backend
  const [role, setRole] = useState<"admin" | "user">("user");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Corrected endpoints to match the backend /api prefix
      const endpoint = isRegister ? "/api/register" : "/api/login";

      // 2. Map 'displayName' state to the 'name' field the backend expects
      const body = isRegister
        ? { name: displayName, email, password, role }
        : { email, password };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Important for cookies (JWT in HttpOnly cookie)
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (isRegister) {
        setIsRegister(false);
        setError("Registration successful! Please login.");
        // Clear name field after successful registration
        setDisplayName("");
      } else {
        // 3. Store the JWT token and User object
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Trigger the parent's login state update
        onLogin(data.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-green-600 rounded-2xl mb-4 shadow-lg shadow-green-600/20">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            AgriMart
          </h1>
          <p className="text-slate-500 mt-2">
            {isRegister
              ? "Create your account"
              : "Welcome back! Please enter your details."}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          {error && (
            <div
              className={`mb-6 p-3 rounded-xl text-sm font-medium ${
                error.includes("successful")
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                role === "user"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              User
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                role === "admin"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="ml-1 text-green-600 font-bold hover:underline"
              >
                {isRegister ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Star,
  User,
} from "lucide-react";
import {
  loginUser,
  registerUser,
  clearAuthError,
} from "../redux/slices/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const { error: authError, actionLoading } = useSelector((state) => state.auth);

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (authError) dispatch(clearAuthError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      dispatch(
        registerUser({
          full_name: formData.full_name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        })
      );
    } else {
      dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
        })
      );
    }
  };

  return (
    <div className="min-h-screen text-black flex flex-col md:flex-row relative bg-slate-50 overflow-hidden">
      {/* Background Graphic */}
      <img
        src="/bgImage.png"
        alt="Background"
        className="absolute top-0 left-0 -z-10 w-full h-full object-cover"
      />

      {/* Left Branding Section */}
      <div className="flex-1 flex flex-col items-start justify-between p-6 md:p-12 lg:pl-32 z-10">
        <img src="/logo.svg" alt="PingUp Logo" className="h-11 object-contain cursor-pointer" />

        <div className="my-auto py-10 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <img src="/group_users.png" className="h-8 md:h-9" alt="Users" />
            <div>
              <div className="flex gap-0.5">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 text-transparent fill-amber-500"
                    />
                  ))}
              </div>
              <p className="text-xs text-indigo-900/80 font-medium">Used by 12K+ developers</p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-900 bg-clip-text text-transparent leading-tight">
            More than just friends truly connect
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-indigo-900/80 mt-4 leading-relaxed max-w-md">
            Connect with a vibrant global community of creators, builders, and dreamers on PingUp.
          </p>
        </div>

        <p className="text-xs text-indigo-900/50">
          © {new Date().getFullYear()} PingUp. All rights reserved.
        </p>
      </div>

      {/* Right Auth Form Section */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8 lg:pr-32 z-10">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 p-6 sm:p-9 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              {isSignUp
                ? "Enter your details to join the PingUp community"
                : "Enter your credentials to access your account"}
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs sm:text-sm animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="e.g. John Warren"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Username</label>
                  <div className="relative">
                    <span className="text-gray-400 font-bold text-sm absolute left-3.5 top-1/2 -translate-y-1/2">
                      @
                    </span>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="john_warren"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email / Username for Login */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                {isSignUp ? "Email Address" : "Email or Username"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={isSignUp ? "email" : "text"}
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={isSignUp ? "you@example.com" : "email or username"}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert("Password reset link will be sent to your registered email.")}
                    className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-gray-400 hover:text-gray-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isSignUp ? "Creating account..." : "Signing in..."}</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <div className="text-center pt-2 border-t border-gray-100 text-xs sm:text-sm text-gray-600">
            {isSignUp ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    if (authError) dispatch(clearAuthError());
                  }}
                  className="font-semibold text-indigo-600 hover:underline cursor-pointer ml-1"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    if (authError) dispatch(clearAuthError());
                  }}
                  className="font-semibold text-indigo-600 hover:underline cursor-pointer ml-1"
                >
                  Sign Up
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

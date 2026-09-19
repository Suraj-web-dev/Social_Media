import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
  Sparkles,
} from 'lucide-react'
import {
  loginUser,
  registerUser,
  clearAuthError,
} from '../redux/slices/authSlice'
import { motion } from 'framer-motion'

const Login = () => {
  const dispatch = useDispatch()
  const { error: authError, actionLoading } = useSelector((state) => state.auth)

  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (authError) dispatch(clearAuthError())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSignUp) {
      dispatch(
        registerUser({
          full_name: formData.full_name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        })
      )
    } else {
      dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
        })
      )
    }
  }

  return (
    <div className='min-h-screen flex flex-col lg:flex-row relative bg-[#090D16] text-white overflow-hidden'>
      {/* Dynamic Ambient Background Glows */}
      <div className='absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none' />
      <div className='absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/25 rounded-full blur-[120px] pointer-events-none' />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none' />

      {/* Left Branding Section */}
      <div className='flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-20 z-10'>
        <div>
          <img
            src='/logo.svg'
            alt='PingUp Logo'
            className='h-10 object-contain cursor-pointer'
          />
        </div>

        <div className='my-auto py-10 max-w-xl space-y-6'>
          <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-indigo-300'>
            <Sparkles className='w-4 h-4 text-amber-400' />
            <span>Next-Gen Social Network</span>
          </div>

          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight'>
            Connect Beyond <br />
            <span className='gradient-text'>Boundaries.</span>
          </h1>

          <p className='text-base sm:text-lg text-slate-300 leading-relaxed max-w-lg'>
            Share stories, discover trending creators, express through reels, and stay connected with custom privacy circles.
          </p>

          <div className='flex items-center gap-3 pt-2'>
            <img src='/group_users.png' className='h-8' alt='Users' />
            <div>
              <div className='flex gap-0.5'>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className='size-3.5 text-transparent fill-amber-400'
                    />
                  ))}
              </div>
              <p className='text-xs text-slate-400 font-medium'>
                Joined by 12,000+ creators worldwide
              </p>
            </div>
          </div>
        </div>

        <p className='text-xs text-slate-500'>
          © {new Date().getFullYear()} PingUp Inc. All rights reserved.
        </p>
      </div>

      {/* Right Auth Card Section */}
      <div className='flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-20 z-10'>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className='w-full max-w-md glass-card rounded-3xl p-6 sm:p-9 space-y-6 shadow-2xl border border-white/10'
        >
          {/* Header */}
          <div className='text-center space-y-2'>
            <h2 className='text-2xl sm:text-3xl font-extrabold text-white tracking-tight'>
              {isSignUp ? 'Create your Account' : 'Welcome Back'}
            </h2>
            <p className='text-xs sm:text-sm text-slate-400'>
              {isSignUp
                ? 'Join thousands of creators sharing their moments'
                : 'Enter your credentials to continue'}
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='flex items-center gap-2 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-2xl text-xs font-semibold'
            >
              <AlertCircle className='w-4 h-4 shrink-0 text-rose-400' />
              <span>{authError}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {isSignUp && (
              <>
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-slate-300'>
                    Full Name
                  </label>
                  <div className='relative'>
                    <User className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
                    <input
                      type='text'
                      name='full_name'
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder='John Warren'
                      className='w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition'
                    />
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-slate-300'>
                    Username
                  </label>
                  <div className='relative'>
                    <span className='text-slate-400 font-bold text-sm absolute left-3.5 top-1/2 -translate-y-1/2'>
                      @
                    </span>
                    <input
                      type='text'
                      name='username'
                      value={formData.username}
                      onChange={handleChange}
                      placeholder='john_warren'
                      className='w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition'
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email / Username */}
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold text-slate-300'>
                {isSignUp ? 'Email Address' : 'Email or Username'}
              </label>
              <div className='relative'>
                <Mail className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
                <input
                  type={isSignUp ? 'email' : 'text'}
                  name='email'
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={
                    isSignUp ? 'you@example.com' : 'email or username'
                  }
                  className='w-full pl-10 pr-4 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition'
                />
              </div>
            </div>

            {/* Password */}
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <label className='text-xs font-semibold text-slate-300'>
                  Password
                </label>
              </div>
              <div className='relative'>
                <Lock className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='••••••••'
                  className='w-full pl-10 pr-10 py-2.5 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='p-1 text-slate-400 hover:text-white absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer'
                >
                  {showPassword ? (
                    <EyeOff className='w-4 h-4' />
                  ) : (
                    <Eye className='w-4 h-4' />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={actionLoading}
              className='w-full mt-3 py-3 px-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50'
            >
              {actionLoading ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  <span>
                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                  </span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className='w-4 h-4' />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className='text-center pt-3 border-t border-white/10 text-xs sm:text-sm text-slate-400'>
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button
                  type='button'
                  onClick={() => {
                    setIsSignUp(false)
                    if (authError) dispatch(clearAuthError())
                  }}
                  className='font-bold text-indigo-400 hover:underline cursor-pointer ml-1'
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  type='button'
                  onClick={() => {
                    setIsSignUp(true)
                    if (authError) dispatch(clearAuthError())
                  }}
                  className='font-bold text-indigo-400 hover:underline cursor-pointer ml-1'
                >
                  Sign Up
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login

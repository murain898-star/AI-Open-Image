import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { LogIn, Sparkles, AlertCircle, Mail, Lock } from 'lucide-react';

export function LoginView() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if we are returning from a redirect login
    if (auth) {
      getRedirectResult(auth)
        .then((result) => {
          if (result) {
            // Successfully logged in via redirect
            setError(null);
          }
          setIsLoading(false);
        })
        .catch((err: any) => {
          console.error("Redirect sign-in error:", err);
          handleAuthError(err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleAuthError = (err: any) => {
    if (err.code === 'auth/unauthorized-domain') {
      setError(`Domain (${window.location.hostname}) is not authorized. Add it in Firebase Console > Authentication > Settings > Authorized domains.`);
    } else if (err.code === 'auth/popup-closed-by-user') {
      setError("Sign-in popup was closed. Please try again or use the redirect option.");
    } else if (err.code === 'auth/popup-blocked') {
      setError("Sign-in popup was blocked by your browser. Please allow popups or use the redirect option.");
    } else if (err.code === 'auth/email-already-in-use') {
      setError("This email is already registered. Please sign in instead.");
    } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      setError("Invalid email or password.");
    } else if (err.code === 'auth/weak-password') {
      setError("Password should be at least 6 characters.");
    } else if (err.code === 'auth/user-not-found') {
      setError("No account found with this email. Please sign up.");
    } else if (err.code === 'auth/operation-not-allowed') {
      setError("Email/Password login is not enabled. Please enable it in Firebase Console > Authentication > Sign-in method.");
    } else {
      setError(`Error (${err.code || 'Unknown'}): ${err.message || "An error occurred during sign in."}`);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase auth is not initialized.");
      return;
    }
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    
    setError(null);
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error("Email auth error:", err);
      handleAuthError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginPopup = async () => {
    if (!auth) {
      setError("Firebase auth is not initialized. Please check your configuration.");
      return;
    }
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Error signing in with Google Popup:", err);
      handleAuthError(err);
    }
  };

  const handleLoginRedirect = async () => {
    if (!auth) {
      setError("Firebase auth is not initialized.");
      return;
    }
    setError(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      console.error("Error signing in with Google Redirect:", err);
      handleAuthError(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 dark:bg-gray-900 p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="p-8 text-center">
          <div className="relative mx-auto mb-6 w-24 h-24">
            <img 
              src="/logo.png" 
              alt="AI Open Image Logo" 
              className="w-full h-full object-contain rounded-2xl shadow-sm"
              onError={(e) => {
                // Fallback if logo.png is not found
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('logo-fallback');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div id="logo-fallback" className="hidden w-full h-full bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl items-center justify-center shadow-inner transition-colors">
              <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight transition-colors">AI Open Image</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors">Sign in to create your cinematic fashion masterpieces.</p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl flex items-start text-left gap-3 transition-colors">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300 break-words">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
          ) : (
            <>
              <form onSubmit={handleEmailAuth} className="space-y-4 mb-6 text-left">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address" 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (min 6 chars)" 
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
                >
                  {isSubmitting ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </button>
              </form>

              <div className="flex items-center gap-2 mb-6">
                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1 transition-colors"></div>
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider transition-colors">Or continue with</span>
                <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1 transition-colors"></div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleLoginPopup}
                  className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3.5 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google (Popup)
                </button>
                
                <button
                  onClick={handleLoginRedirect}
                  className="w-full flex items-center justify-center gap-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-6 py-3.5 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Google (Redirect)
                </button>
              </div>

              <div className="mt-6 text-center">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </>
          )}
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-4 border-t border-gray-100 dark:border-gray-700 text-center transition-colors">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors">
            If popup fails (especially on mobile), try the Redirect option.
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono transition-colors">
            Project: {auth?.app.options.projectId || 'Loading...'}
          </p>
        </div>
      </div>
    </div>
  );
}

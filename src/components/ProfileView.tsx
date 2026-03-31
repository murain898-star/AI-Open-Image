import React, { useState, useEffect } from 'react';
import { User, Mail, Clock, Edit2, Check, X, LogOut, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { AppState } from '../types';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

interface ProfileViewProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function ProfileView({ state, setState }: ProfileViewProps) {
  const currentUser = auth?.currentUser;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.displayName || 'Fashion Creator');
  const [email, setEmail] = useState(currentUser?.email || 'user@example.com');
  const [loading, setLoading] = useState(false);
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    const date = new Date();
    setCreatedAt(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setTimeout(() => {
      setIsEditing(false);
      setLoading(false);
    }, 500);
  };

  const handleSignOut = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  };

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">User Profile</h1>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="bg-indigo-600 h-32 relative">
            <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md transition-colors">
              <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center overflow-hidden transition-colors">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-16 pb-8 px-8">
            <div className="flex items-start justify-between">
              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-indigo-600 outline-none bg-transparent px-1 py-0.5 transition-colors"
                      autoFocus
                    />
                    <button onClick={handleSave} disabled={loading} className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setIsEditing(false)} disabled={loading} className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">{name}</h2>
                    <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 transition-colors">
                  <Mail className="w-4 h-4" /> {email}
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 flex items-center gap-2 text-gray-500 dark:text-gray-400 w-fit transition-colors">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Member Since: {createdAt || 'Loading...'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Branding Section */}
        <div className="mt-16 mb-8 flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300">
          <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200/50 dark:shadow-none mb-4 transform hover:scale-105 transition-transform">
            <ImageIcon className="w-8 h-8 text-white" />
            <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
          </div>
          <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
            AI OPEN IMAGE
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium tracking-wide">
            Next-Gen AI Generation
          </p>
        </div>
      </div>
    </div>
  );
}

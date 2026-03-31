import React from 'react';
import { Home, Settings, User, Wand2, Video, Image as ImageIcon, CreditCard } from 'lucide-react';
import { auth } from '../lib/firebase';

interface NavigationRailProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function NavigationRail({ currentView, setCurrentView }: NavigationRailProps) {
  const currentUser = auth?.currentUser;
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'create', icon: Wand2, label: 'Create' },
    { id: 'video', icon: Video, label: 'Video' },
    { id: 'pricing', icon: CreditCard, label: 'Pricing' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-20 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-6 justify-between z-20 shrink-0 transition-colors">
      <div className="space-y-8 w-full flex flex-col items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none mb-4">
          <ImageIcon className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex flex-col gap-4 w-full px-3">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors ${
                  isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={item.label}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full px-3">
        <button
          onClick={() => setCurrentView('profile')}
          className={`flex flex-col items-center justify-center p-3 rounded-xl transition-colors w-full ${
            currentView === 'profile' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="Profile"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center overflow-hidden">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { User, Mail, CreditCard, Calendar, Clock, Edit2, Check, X, LogOut, Loader2, Key, ExternalLink, Lock, MessageSquare, Settings, Youtube } from 'lucide-react';
import { AppState, ApiProvider } from '../types';
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
  
  const [keys, setKeys] = useState({
    google: ''
  });
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportName, setSupportName] = useState('');
  const [supportAddress, setSupportAddress] = useState('');
  const [supportContact, setSupportContact] = useState('');

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Name: ${supportName}%0D%0AAddress: ${supportAddress}%0D%0AContact Number: ${supportContact}`;
    window.location.href = `mailto:app@example.com?subject=Support Request&body=${body}`;
    alert('Support request prepared! If your email client did not open, please email us directly at app@example.com');
    setShowSupportForm(false);
    setSupportName('');
    setSupportAddress('');
    setSupportContact('');
  };

  useEffect(() => {
    const date = new Date();
    setCreatedAt(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    
    setKeys({
      google: localStorage.getItem('custom_gemini_api_key') || ''
    });

    const expiry = localStorage.getItem('api_access_expiry');
    if (expiry) {
      const expiryDate = new Date(parseInt(expiry, 10));
      if (expiryDate > new Date()) {
        setHasPaid(true);
        setSubscriptionExpiry(expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
      } else {
        localStorage.removeItem('api_access_expiry');
        setHasPaid(false);
      }
    }
  }, []);

  const handlePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      
      localStorage.setItem('api_access_expiry', expiryDate.getTime().toString());
      setHasPaid(true);
      setSubscriptionExpiry(expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
      setIsProcessingPayment(false);
      alert('Payment successful! You have 1 month of access. You can now add your API key.');
    }, 1500);
  };

  const handleSaveKey = () => {
    if (keys.google.trim()) localStorage.setItem('custom_gemini_api_key', keys.google.trim());
    else localStorage.removeItem('custom_gemini_api_key');
    
    setIsEditingKey(false);
  };

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

  const providerLinks = {
    google: 'https://aistudio.google.com/app/apikey'
  };

  const providerNames = {
    google: 'Google AI Studio (Gemini/Veo)'
  };

  const activeKey = keys[state.apiProvider];

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

            <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-8 transition-colors">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Custom API Key Access
              </h3>
              
              {!hasPaid ? (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-6 text-center transition-colors">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors">Unlock API Key Feature</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto space-y-4 transition-colors">
                    <p>
                      Generate unlimited images and videos for free without any credits by using your own API key!
                    </p>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800 shadow-sm text-left transition-colors">
                      <div className="flex justify-between mb-2">
                        <span>Subscription (1 Month)</span>
                        <span>₹5999.00</span>
                      </div>
                      <div className="flex justify-between mb-3 text-gray-500 dark:text-gray-400 transition-colors">
                        <span>GST (18%)</span>
                        <span>₹1079.82</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-700 pt-3 transition-colors">
                        <span>Total Amount</span>
                        <span>₹7078.82</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay ₹7078.82
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                      Use your own API key to generate images for free. Your key is stored locally in your browser.
                    </p>
                    {subscriptionExpiry && (
                      <span className="text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full transition-colors">
                        Valid until: {subscriptionExpiry}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">AI Provider</label>
                    <div className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white transition-colors">
                      Google AI Studio (Gemini/Veo)
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4 transition-colors">
                    {isEditingKey ? (
                      <div className="flex flex-col gap-3">
                        <input 
                          type="password" 
                          value={keys[state.apiProvider]}
                          onChange={(e) => setKeys({ ...keys, [state.apiProvider]: e.target.value })}
                          placeholder={`Enter your ${providerNames[state.apiProvider]} API Key`}
                          className="w-full text-sm font-mono text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg outline-none bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 transition-colors"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button onClick={handleSaveKey} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                            Save Key
                          </button>
                          <button onClick={() => {
                            setKeys({
                              google: localStorage.getItem('custom_gemini_api_key') || ''
                            });
                            setIsEditingKey(false);
                          }} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${activeKey ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white transition-colors">
                            {activeKey ? `${providerNames[state.apiProvider]} Key Active` : `No ${providerNames[state.apiProvider]} Key`}
                          </span>
                        </div>
                        <button 
                          onClick={() => setIsEditingKey(true)} 
                          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
                        >
                          {activeKey ? 'Change Key' : 'Add Key'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white transition-colors">Need an API Key?</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">Generate a new API key from {providerNames[state.apiProvider]}.</p>
                    </div>
                    <a 
                      href={providerLinks[state.apiProvider]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-4 py-2 rounded-lg transition-colors"
                    >
                      Generate API Key <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm transition-colors">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 transition-colors">
                      <Youtube className="w-5 h-5 text-red-500" /> How to create an API Key
                    </h4>
                    <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4 transition-colors">
                      <li>Click the <strong>"Generate API Key"</strong> button above.</li>
                      <li>Sign in with your Google Account.</li>
                      <li>Click on <strong>"Create API key"</strong> in the new project.</li>
                      <li>Copy the generated key and paste it in the field above.</li>
                    </ol>
                    <a 
                      href="https://www.youtube.com/results?search_query=how+to+create+google+ai+studio+gemini+api+key" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-4 py-2 rounded-lg transition-colors"
                    >
                      Watch Video Tutorial on YouTube <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-8 transition-colors">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 transition-colors">
                <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Contact Support
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 transition-colors">
                Need help setting up your API key? We can create and configure it for you. 
                <br/>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 transition-colors">Note: A service charge of ₹500 applies for API key creation requests.</span>
              </p>
              
              {!showSupportForm ? (
                <button
                  onClick={() => setShowSupportForm(true)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-6 rounded-xl shadow-sm transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </button>
              ) : (
                <form onSubmit={handleSupportSubmit} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-100 dark:border-gray-700 space-y-4 transition-colors">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Name</label>
                    <input
                      type="text"
                      required
                      value={supportName}
                      onChange={(e) => setSupportName(e.target.value)}
                      className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Address</label>
                    <textarea
                      required
                      value={supportAddress}
                      onChange={(e) => setSupportAddress(e.target.value)}
                      className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none transition-colors"
                      placeholder="Your address"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Contact Number</label>
                    <input
                      type="tel"
                      required
                      value={supportContact}
                      onChange={(e) => setSupportContact(e.target.value)}
                      className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-colors"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-3 text-sm text-indigo-800 dark:text-indigo-300 flex items-start gap-2 transition-colors">
                    <div className="mt-0.5">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <p>
                      <strong>Note:</strong> If you are requesting us to create and set up an API key for you, a service charge of <strong>₹500</strong> will apply.
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Submit Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSupportForm(false)}
                      className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, Star, Crown, Info, ChevronRight, Briefcase, Building2, Smartphone, ShieldCheck, Loader2, Image as ImageIcon, Wand2 } from 'lucide-react';

interface PricingViewProps {
  onPurchaseSuccess?: (credits: number) => void;
}

export function PricingView({ onPurchaseSuccess }: PricingViewProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('100');

  const loadRazorpay = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-checkout-js') || window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-js';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async (name: string, price: number, credits: number) => {
    try {
      setIsProcessing(true);
      setPaymentError(null);
      setPaymentSuccessMessage(null);
      
      if (price === 0) {
        if (onPurchaseSuccess) {
          onPurchaseSuccess(credits);
        }
        setPaymentSuccessMessage(`Success! ${credits} Free Credits have been successfully added to your account.`);
        setIsProcessing(false);
        return;
      }
      
      const isLoaded = await loadRazorpay();
      
      if (!isLoaded || !window.Razorpay) {
        setPaymentError("Razorpay SDK is blocked. Please disable any ad-blockers, or try opening this app in a new tab by clicking the 'Open in New Tab' icon.");
        setIsProcessing(false);
        return;
      }
      
      // Create order via our backend
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: price * 100, // Amount in paise
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
        })
      });
      
      let orderData;
      try {
        const textRes = await res.text();
        orderData = JSON.parse(textRes);
      } catch (e) {
        throw new Error(`Server returned invalid response (Status ${res.status}). Ensure your server is running and Environment Variables (API Keys) are set in the deployed app.`);
      }
      
      if (!res.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const options = {
        key: orderData.key_id, // Key ID securely retrieved from backend
        amount: orderData.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: orderData.currency,
        name: "AI Open Image",
        description: `Purchase ${name}`,
        order_id: orderData.order_id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            let verifyData;
            try {
              const verifyTextRes = await verifyRes.text();
              verifyData = JSON.parse(verifyTextRes);
            } catch (e) {
              throw new Error(`Server returned invalid response. Ensure your environment variables are configured. Status: ${verifyRes.status}`);
            }
            
            if (verifyRes.ok && verifyData.status === 'success') {
              // Success!
              if (onPurchaseSuccess) {
                onPurchaseSuccess(credits);
              }
              setPaymentSuccessMessage(`Payment successful! Credits added: ${credits}`);
            } else {
              setPaymentError(verifyData.error || 'Payment verification failed');
            }
          } catch (err: any) {
            console.log('Verification failed', err.message);
            setPaymentError('Failed to verify payment');
          } finally {
             setIsProcessing(false);
          }
        },
        prefill: {
          // Leaving these blank or providing real data is better for Live Mode
          // as Razorpay risk engine might block fake emails like user@example.com
        },
        notes: {
          address: "AI Open Image Studio"
        },
        theme: {
          color: "#4f46e5"
        }
      };
      
      console.log(`[DEBUG] Initializing Razorpay Checkout with Key: ${options.key}`);
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
         console.log('Payment failed', response.error);
         setPaymentError(`Payment failed: ${response.error.description}`);
         setIsProcessing(false);
      });
      rzp1.open();

    } catch (error: any) {
      console.log(error);
      setPaymentError(error.message || 'Payment initiation failed');
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      name: "Basic",
      icon: Zap,
      price: 100,
      credits: 12,
      color: "blue",
      features: [
        "12 Credits",
        "4K Image Generation",
        "Standard Generation Speed",
        "Basic Support"
      ]
    },
    {
      name: "Basic Plus",
      icon: Star,
      price: 200,
      credits: 25,
      color: "blue",
      features: [
        "25 Credits",
        "4K Image Generation",
        "Standard Generation Speed",
        "Basic Support"
      ]
    },
    {
      name: "Basic Pro",
      icon: Zap,
      price: 500,
      credits: 62,
      color: "blue",
      features: [
        "62 Credits",
        "4K Image Generation",
        "Standard Generation Speed",
        "Basic Support"
      ]
    },
    {
      name: "Premium",
      icon: Crown,
      price: 1000,
      credits: 125,
      color: "indigo",
      popular: true,
      features: [
        "125 Credits",
        "4K & 8K Upscaling",
        "Priority Speed",
        "Premium Support"
      ]
    },
    {
      name: "Premium Plus",
      icon: Crown,
      price: 2000,
      credits: 250,
      color: "indigo",
      features: [
        "250 Credits",
        "4K & 8K Upscaling",
        "Priority Speed",
        "Premium Support"
      ]
    },
    {
      name: "Premium Pro",
      icon: Crown,
      price: 3000,
      credits: 375,
      color: "indigo",
      features: [
        "375 Credits",
        "4K & 8K Upscaling",
        "Priority Speed",
        "Premium Support"
      ]
    },
    {
      name: "Business",
      icon: Briefcase,
      price: 5000,
      credits: 625,
      color: "purple",
      features: [
        "625 Credits",
        "API Access",
        "Highest Speed",
        "Dedicated Account Manager"
      ]
    },
    {
      name: "Business Plus",
      icon: Briefcase,
      price: 10000,
      credits: 1250,
      color: "purple",
      features: [
        "1250 Credits",
        "API Access",
        "Highest Speed",
        "Dedicated Account Manager"
      ]
    },
    {
      name: "Business Pro",
      icon: Briefcase,
      price: 15000,
      credits: 1875,
      color: "purple",
      features: [
        "1875 Credits",
        "API Access",
        "Highest Speed",
        "Dedicated Account Manager"
      ]
    }
  ];

  const topUps = [
    { credits: 12, price: 100 },
    { credits: 25, price: 200 },
    { credits: 62, price: 500 },
    { credits: 125, price: 1000 }
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {paymentError && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-6 py-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold">Payment Setup Issue</h4>
                <p className="text-sm">{paymentError}. <br/><strong>Note:</strong> Your Razorpay API keys configured in .env might be invalid or not working. Please update them.</p>
              </div>
            </div>
            <button onClick={() => setPaymentError(null)} className="text-red-500 hover:text-red-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {paymentSuccessMessage && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-6 py-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Check className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold">Success</h4>
                <p className="text-sm">{paymentSuccessMessage}</p>
              </div>
            </div>
            <button onClick={() => setPaymentSuccessMessage(null)} className="text-green-600 hover:text-green-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Choose a subscription plan or buy credits as you go.
          </p>
        </div>

        {/* Trial Plan Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl p-1 shadow-lg">
          <div className="bg-white dark:bg-gray-800 rounded-[23px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-sm font-bold mb-4">
                <Zap className="w-4 h-4" /> Try Before You Buy
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">5 Credits Free Trial</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                Not sure yet? Get 5 Free Credits to try our premium AI generation. Try before you buy!
              </p>
              <button 
                onClick={() => initiatePayment('Trial Plan', 0, 5)}
                disabled={isProcessing}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 text-lg"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : '5 Credits Free to Trial - Start Now'}
              </button>
            </div>
            
            <div className="w-full md:w-1/2 lg:w-5/12">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur text-white text-xs px-2 py-1 rounded font-medium">Tutorial</div>
                <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 mix-blend-overlay"></div>
                   <div className="flex items-center gap-4 w-full px-6">
                      <div className="flex-1 h-32 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center p-2 text-center shadow-sm relative">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">1. Upload Photo</span>
                      </div>
                      <div className="w-8 flex justify-center">
                        <ChevronRight className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 h-32 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center p-2 text-center shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 opacity-20"></div>
                        <Wand2 className="w-8 h-8 text-indigo-500 mb-1 relative z-10" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-300 relative z-10">2. Generate AI</span>
                      </div>
                   </div>
                </div>
                <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mt-3">See how it works instantly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Cost Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">How Credits Work</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Image Generation</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex justify-between"><span>Low Res (Draft)</span> <span className="font-medium text-green-600 dark:text-green-400">Free (0 Credits)</span></li>
                <li className="flex justify-between"><span>4K / Ultra</span> <span className="font-medium">1 Credit</span></li>
                <li className="flex justify-between"><span>Gigapixel (8K)</span> <span className="font-medium">2 Credits</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Video Generation (Veo)</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex justify-between"><span>Any Resolution</span> <span className="font-medium">1 Credit / sec</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Poster & Catalogue</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex justify-between"><span>Poster</span> <span className="font-medium">13 Credits</span></li>
                <li className="flex justify-between"><span>Catalogue</span> <span className="font-medium">2 Credits / Page</span></li>
                <li className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  Total Cost = Poster: 13 Credits | Catalogue: Number of Pages × 2 Credits
                </li>
                <li className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  1 Credit = ₹8
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'monthly' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'yearly' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Yearly Billing
            </button>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="flex flex-wrap justify-center gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div 
                key={plan.name} 
                className={`relative w-full max-w-[340px] bg-white dark:bg-gray-800 rounded-3xl p-8 border-2 transition-all hover:shadow-xl ${
                  plan.popular 
                    ? 'border-indigo-500 dark:border-indigo-400 shadow-lg shadow-indigo-100 dark:shadow-none md:scale-105 z-10' 
                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  plan.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                  plan.color === 'indigo' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                  plan.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                  plan.color === 'amber' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">₹{plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 text-center">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{plan.credits}</span>
                  <span className="text-gray-600 dark:text-gray-300 font-medium ml-2">Credits included</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => initiatePayment(plan.name, plan.price, plan.credits)}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                  }`}
                >
                  Choose {plan.name}
                </button>
              </div>
            );
          })}
        </div>

        {/* Top-up Plans */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Need more credits?</h3>
            <p className="text-gray-500 dark:text-gray-400">Buy credits as you go. No expiration date.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topUps.map((topUp, i) => (
              <div key={i} onClick={() => !isProcessing && initiatePayment(`${topUp.credits} Credits Top-up`, topUp.price, topUp.credits)} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 transition-colors group flex flex-col items-center text-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-500 dark:hover:border-indigo-400 cursor-pointer'}`}>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{topUp.credits} Credits</h4>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg mb-4">₹{topUp.price}</p>
                <button className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1">
                  Buy Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Payment Amount */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 max-w-xl mx-auto shadow-sm">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Custom Amount</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter a custom amount in Rupees (minimum ₹100) to test the integration or pay a specific amount.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
              <input
                type="number"
                min="100"
                step="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold text-lg"
                placeholder="Amount in ₹ (Rupees)"
              />
            </div>
            <button
              onClick={() => {
                const amt = parseInt(customAmount);
                if (amt >= 100) {
                  initiatePayment(`Custom Payment (₹${amt})`, amt, Math.max(1, Math.floor(amt / 10)));
                } else {
                  setPaymentError('Minimum amount is ₹100');
                }
              }}
              disabled={isProcessing}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[140px] shadow-sm hover:shadow-md"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay Now'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

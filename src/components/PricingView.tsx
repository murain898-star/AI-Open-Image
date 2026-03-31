import React, { useState } from 'react';
import { CreditCard, Check, Zap, Star, Crown, Info, ChevronRight, Briefcase, Building2 } from 'lucide-react';

export function PricingView() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: "Starter",
      icon: Zap,
      price: billingCycle === 'monthly' ? 200 : 2400,
      credits: 20,
      color: "blue",
      features: [
        "20 Credits per month",
        "~20 Standard Images",
        "OR ~4 HD Videos (720p)",
        "Standard Generation Speed",
        "Basic Support"
      ]
    },
    {
      name: "Pro",
      icon: Star,
      price: billingCycle === 'monthly' ? 500 : 6000,
      credits: 50,
      color: "indigo",
      popular: true,
      features: [
        "50 Credits per month",
        "~50 Standard Images",
        "OR ~10 HD Videos (720p)",
        "Fast Generation Speed",
        "Priority Support",
        "Access to 4K & Ultra Models"
      ]
    },
    {
      name: "Elite",
      icon: Crown,
      price: billingCycle === 'monthly' ? 1000 : 12000,
      credits: 100,
      color: "purple",
      features: [
        "100 Credits per month",
        "~100 Standard Images",
        "OR ~20 HD Videos (720p)",
        "Fastest Generation Speed",
        "24/7 Premium Support",
        "Access to Gigapixel & 4K Video"
      ]
    },
    {
      name: "Business",
      icon: Briefcase,
      price: billingCycle === 'monthly' ? 5000 : 60000,
      credits: 500,
      color: "amber",
      features: [
        "500 Credits per month",
        "~500 Standard Images",
        "OR ~100 HD Videos (720p)",
        "Priority Queue Processing",
        "Dedicated Account Manager",
        "Commercial API Access"
      ]
    },
    {
      name: "Enterprise",
      icon: Building2,
      price: billingCycle === 'monthly' ? 10000 : 120000,
      credits: 1000,
      color: "emerald",
      features: [
        "1000 Credits per month",
        "~1000 Standard Images",
        "OR ~200 HD Videos (720p)",
        "Highest Priority Queue",
        "24/7 Phone Support",
        "Custom Model Fine-tuning"
      ]
    }
  ];

  const topUps = [
    { credits: 5, price: 50 },
    { credits: 25, price: 250 },
    { credits: 50, price: 500 },
    { credits: 100, price: 1000 }
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Choose a subscription plan or buy credits as you go.
          </p>
        </div>

        {/* Credit Cost Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">How Credits Work</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Image Generation</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex justify-between"><span>Low Res (Draft)</span> <span className="font-medium text-green-600 dark:text-green-400">Free (0 Credits)</span></li>
                <li className="flex justify-between"><span>Standard / HD</span> <span className="font-medium">1 Credit (₹10)</span></li>
                <li className="flex justify-between"><span>FHD / 2K</span> <span className="font-medium">2 Credits (₹20)</span></li>
                <li className="flex justify-between"><span>4K / Ultra</span> <span className="font-medium">3-4 Credits (₹30-₹40)</span></li>
                <li className="flex justify-between"><span>Gigapixel</span> <span className="font-medium">5 Credits (₹50)</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">Video Generation (Veo)</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex justify-between"><span>720p Video</span> <span className="font-medium">3 Credits (₹30)</span></li>
                <li className="flex justify-between"><span>1080p Video</span> <span className="font-medium">5 Credits (₹50)</span></li>
                <li className="flex justify-between"><span>4K Ultra Master</span> <span className="font-medium">10 Credits (₹100)</span></li>
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

                <button className={`w-full py-3 rounded-xl font-bold transition-colors ${
                  plan.popular
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                }`}>
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
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer group flex flex-col items-center text-center">
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

      </div>
    </div>
  );
}

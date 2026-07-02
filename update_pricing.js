const fs = require('fs');
let content = fs.readFileSync('src/components/PricingView.tsx', 'utf8');

const newPlans = `  const plans = [
    { name: "Basic", icon: Zap, price: 100, credits: Math.floor(100 / 8), color: "blue", features: ["12 Credits", "4K Image Generation", "Standard Generation Speed", "Basic Support"] },
    { name: "Basic Plus", icon: Star, price: 200, credits: Math.floor(200 / 8), color: "blue", features: ["25 Credits", "4K Image Generation", "Standard Generation Speed", "Basic Support"] },
    { name: "Basic Pro", icon: Zap, price: 500, credits: Math.floor(500 / 8), color: "blue", features: ["62 Credits", "4K Image Generation", "Standard Generation Speed", "Basic Support"] },
    { name: "Premium", icon: Crown, price: 1000, credits: Math.floor(1000 / 8), color: "indigo", popular: true, features: ["125 Credits", "4K & 8K Upscaling", "Priority Speed", "Premium Support"] },
    { name: "Premium Plus", icon: Crown, price: 2000, credits: Math.floor(2000 / 8), color: "indigo", features: ["250 Credits", "4K & 8K Upscaling", "Priority Speed", "Premium Support"] },
    { name: "Premium Pro", icon: Crown, price: 3000, credits: Math.floor(3000 / 8), color: "indigo", features: ["375 Credits", "4K & 8K Upscaling", "Priority Speed", "Premium Support"] },
    { name: "Business", icon: Building2, price: 5000, credits: Math.floor(5000 / 8), color: "purple", features: ["625 Credits", "API Access", "Highest Speed", "Dedicated Account Manager"] },
    { name: "Business Plus", icon: Building2, price: 10000, credits: Math.floor(10000 / 8), color: "purple", features: ["1250 Credits", "API Access", "Highest Speed", "Dedicated Account Manager"] },
    { name: "Business Pro", icon: Building2, price: 15000, credits: Math.floor(15000 / 8), color: "purple", features: ["1875 Credits", "API Access", "Highest Speed", "Dedicated Account Manager"] }
  ];

  const topUps = [
    { credits: Math.floor(100 / 8), price: 100 },
    { credits: Math.floor(200 / 8), price: 200 },
    { credits: Math.floor(500 / 8), price: 500 },
    { credits: Math.floor(1000 / 8), price: 1000 }
  ];`;

content = content.replace(/const plans = \[[\s\S]*?const topUps = \[[\s\S]*?\];/m, newPlans);
fs.writeFileSync('src/components/PricingView.tsx', content);

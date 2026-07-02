const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update userCredits initialization
content = content.replace(/const \[userCredits, setUserCredits\] = useState<number>\(0\);/, `const [userCredits, setUserCredits] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('fashion_ai_credits');
      if (stored !== null) return parseInt(stored);
      localStorage.setItem('fashion_ai_credits', '5');
      return 5;
    } catch (e) {
      return 5;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fashion_ai_credits', userCredits.toString());
    } catch (e) {}
  }, [userCredits]);`);

// Update cost calculation 1
content = content.replace(/const baseCost = newState\.outputFormat === 'video'[\s\S]*?newState\.quality === 'Ultra' \? 4 : 5\);/, `const baseCost = newState.outputFormat === 'video' 
        ? 5 
        : (newState.quality === 'Gigapixel' ? 2 : 1);`);

// Update cost calculation 2
content = content.replace(/const baseCost = currentState\.outputFormat === 'video'[\s\S]*?currentState\.quality === 'Ultra' \? 4 : 5\);/, `const baseCost = currentState.outputFormat === 'video' 
        ? 5 
        : (currentState.quality === 'Gigapixel' ? 2 : 1);`);

fs.writeFileSync('src/App.tsx', content);

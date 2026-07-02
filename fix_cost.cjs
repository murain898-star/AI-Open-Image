const fs = require('fs');

// Fix Sidebar.tsx
let sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/const baseCost = state\.outputFormat === 'video' \s*\?\s*5\s*:/g, `const baseCost = state.outputFormat === 'video' 
                ? 1 
                :`);
fs.writeFileSync('src/components/Sidebar.tsx', sidebar);

// Fix App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/const baseCost = newState\.outputFormat === 'video' \s*\?\s*5\s*:/g, `const baseCost = newState.outputFormat === 'video' 
        ? 1 
        :`);
app = app.replace(/const baseCost = currentState\.outputFormat === 'video' \s*\?\s*5\s*:/g, `const baseCost = currentState.outputFormat === 'video' 
        ? 1 
        :`);
fs.writeFileSync('src/App.tsx', app);

const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// The Full Body toggle was added, but presets are managed via Omit<AppState, ...> in types.ts
// `PresetState` already uses Omit which includes fullBody. So presets should work.

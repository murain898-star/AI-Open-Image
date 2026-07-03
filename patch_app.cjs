const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove fullBody: true,
code = code.replace(/    fullBody: true,\n/g, "");

fs.writeFileSync('src/App.tsx', code);

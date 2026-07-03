const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

code = code.replace(/                  \{\(state\.customUnit === 'inches' \|\| state\.customUnit === 'cm'\) && \([\s\S]*?                  \)\}/m, '');

fs.writeFileSync('src/components/Sidebar.tsx', code);

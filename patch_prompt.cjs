const fs = require('fs');
let code = fs.readFileSync('src/services/aiService.ts', 'utf8');

code = code.replace(
  /  let baseSubject = state\.fullBody \? `full-body head-to-toe fashion catalog photo of a \$\{state\.gender\.toLowerCase\(\)\} model` : `fashion catalog photo of a \$\{state\.gender\.toLowerCase\(\)\} model`;\n  \/\/ STRICT FULL-LENGTH FRAME REQUIREMENT/m,
  \`  let baseSubject = \\\`full-body head-to-toe fashion catalog photo of a \${state.gender.toLowerCase()} model\\\`;
  
  let prompt = \\\`\${baseSubject} \${poseDescription}\\\`;
  
  // INJECT MANDATORY PREFIX
  prompt = \\\`MANDATORY: full body, head-to-toe visible, complete model silhouette. \\\` + prompt;

  // STRICT FULL-LENGTH FRAME REQUIREMENT\`
);

fs.writeFileSync('src/services/aiService.ts', code);

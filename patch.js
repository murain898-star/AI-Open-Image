const fs = require('fs');
let code = fs.readFileSync('src/services/aiService.ts', 'utf8');
const lines = code.split('\n');
const replacement = `  } else {
    prompt += \`\\n\\nCRITICAL CAMERA & FRAMING REQUIREMENT: YOU MUST GENERATE A WIDE SHOT / FULL-BODY PHOTOGRAPH. 
The camera MUST be zoomed out and positioned far away (at least 15-20 feet) so that the ENTIRE model is visible from the very top of their head to the bottom of their shoes/feet.
COMPOSITION RULES:
1. THIS IS A WIDE SHOT. Zoom the camera out significantly.
2. The entire body from head to toe MUST be 100% visible inside the image.
3. There MUST be empty background space/floor visible below the model's feet.
4. There MUST be empty background space/sky visible above the model's head.
5. DO NOT copy the zoom level or crop of the reference image. The reference is ONLY for the outfit design.
STRICT EXCLUSIONS (FAILURE CONDITIONS):
- DO NOT generate a half-body shot.
- DO NOT generate a waist-up shot.
- DO NOT cut off the legs or feet. If the feet are missing from the image, you have failed the prompt.
- Both feet must be clearly visible, resting on the ground/street.\`;
  }`;
lines.splice(453, 15, replacement);
fs.writeFileSync('src/services/aiService.ts', lines.join('\n'));

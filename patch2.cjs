const fs = require('fs');
let code = fs.readFileSync('src/services/aiService.ts', 'utf8');

// replace the end of the prompt building
code = code.replace(
  /  if \(actualPose === 'Close-up'\) \{[\s\S]*?Both feet must be clearly visible, resting on the ground\/street\.\`;\n  \}/g,
  `  // STRICT FULL-LENGTH FRAME REQUIREMENT
  prompt += \`\\n\\n---\\n\`;
  if (actualPose === 'Close-up') {
    prompt += \`FINAL CRITICAL INSTRUCTION: You MUST generate a close-up or waist-up shot. DO NOT generate a full body image. Focus on the upper half of the body.\`;
  } else if ((state.creationType === 'Poster' && state.posterPages === 2) || state.creationType === 'Catalogue') {
    prompt += \`FINAL CRITICAL INSTRUCTION: For the main/inner pages, generate a complete FULL-LENGTH standing pose showing the entire body from head to toe. The feet, shoes, and full outfit hem MUST be completely visible in-frame.\`;
  } else {
    prompt += \`FINAL CRITICAL INSTRUCTION: YOU MUST GENERATE A FULL-BODY, HEAD-TO-TOE PHOTOGRAPH.
The camera MUST be zoomed out far enough so that the ENTIRE model is visible from the top of their head to the bottom of their shoes.
- You MUST show the shoes/feet.
- You MUST show the full legs.
- There MUST be empty floor space visible below the feet.
- Do NOT generate a half-body shot. Do NOT cut off the legs or feet.
If the reference image is cropped, ignore its crop and zoom out to show the full body.\`;
  }`
);

fs.writeFileSync('src/services/aiService.ts', code);

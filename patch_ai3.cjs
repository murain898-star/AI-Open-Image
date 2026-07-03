const fs = require('fs');
let code = fs.readFileSync('src/services/aiService.ts', 'utf8');

// Re-write the pose description section to force full body.
code = code.replace(
  /let poseDescription = state\.fullBody \?[\s\S]*?let baseSubject = state\.fullBody \?[\s\S]*?;`/m,
  `let poseDescription = \`in a full-length head-to-toe standing \${actualPose.toLowerCase()} pose\`;
  if (actualPose === 'Walking') {
    poseDescription = \`walking naturally in a full-length head-to-toe wide shot\`;
  } else if (actualPose === 'Dynamic') {
    poseDescription = \`in a dynamic full-length head-to-toe action pose\`;
  } else if (actualPose === 'Sitting') {
    poseDescription = \`in a full-body sitting pose, with the entire body from head to toe fully visible in the frame\`;
  } else if (actualPose === 'Fancy Pose') {
    poseDescription = fancyPoses[Math.floor(Math.random() * fancyPoses.length)];
  }

  let baseSubject = \`full-body head-to-toe fashion catalog photo of a \${state.gender.toLowerCase()} model\`;`
);

// Re-write the CRITICAL INSTRUCTION section.
code = code.replace(
  /  \/\/ STRICT FULL-LENGTH FRAME REQUIREMENT\n  prompt \+= `\\n\\n---\\n`;\n  if \(actualPose === 'Close-up'\) \{[\s\S]*?ignore its crop and zoom out to show the full body\.\`;\n    \}\n  \}/m,
  `  // STRICT FULL-LENGTH FRAME REQUIREMENT
  prompt += \`\\n\\n---\\n\`;
  if ((state.creationType === 'Poster' && state.posterPages === 2) || state.creationType === 'Catalogue') {
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

// Check if there are other aspectRatio checks
code = code.replace(
  /  if \(state\.aspectRatio !== '1:1' && state\.aspectRatio !== '3:4' && state\.aspectRatio !== '4:3' && state\.aspectRatio !== '9:16' && state\.aspectRatio !== '16:9'\) \{[\s\S]*?\} else \{[\s\S]*?\}\n    \}\n  \}/m,
  `  // Handle print sizes
  if (state.aspectRatio === 'Custom' || !state.aspectRatio || state.aspectRatio === 'Custom') {
    prompt += \`\\n\\nSIZE INSTRUCTION: Compose the image explicitly for a physical dimension of \${state.customWidth} \${state.customUnit || 'inches'} width by \${state.customHeight} \${state.customUnit || 'inches'} height at \${state.customDPI || 300} DPI. The aspect ratio of the generated image MUST strictly match \${state.customWidth}:\${state.customHeight}. Ensure the subject framing respects this exact proportional boundary.\`;
  }`
);

fs.writeFileSync('src/services/aiService.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/services/aiService.ts', 'utf8');

// Replace poseDescription block
code = code.replace(
  /let poseDescription = `in a full-length head-to-toe standing \$\{actualPose\.toLowerCase\(\)\} pose`;[\s\S]*?let baseSubject = `full-body head-to-toe fashion catalog photo of a \$\{state\.gender\.toLowerCase\(\)\} model`;/m,
  `let poseDescription = state.fullBody ? \`in a full-length head-to-toe standing \${actualPose.toLowerCase()} pose\` : \`in a \${actualPose.toLowerCase()} pose\`;
  if (actualPose === 'Walking') {
    poseDescription = state.fullBody ? \`walking naturally in a full-length head-to-toe wide shot\` : \`walking naturally\`;
  } else if (actualPose === 'Dynamic') {
    poseDescription = state.fullBody ? \`in a dynamic full-length head-to-toe action pose\` : \`in a dynamic action pose\`;
  } else if (actualPose === 'Sitting') {
    poseDescription = state.fullBody ? \`in a full-body sitting pose, with the entire body from head to toe fully visible in the frame\` : \`in a sitting pose\`;
  } else if (actualPose === 'Fancy Pose') {
    poseDescription = state.fullBody ? fancyPoses[Math.floor(Math.random() * fancyPoses.length)] : fancyPoses[Math.floor(Math.random() * fancyPoses.length)].replace(/ in a full-length head-to-toe standing view| in a full-length head-to-toe standing pose| fully visible from head to toe| in a full-body standing head-to-toe composition/g, '');
  } else if (actualPose === 'Close-up') {
    poseDescription = \`in a close-up, waist-up half-body pose highlighting the upper garment and face\`;
  }

  let baseSubject = state.fullBody ? \`full-body head-to-toe fashion catalog photo of a \${state.gender.toLowerCase()} model\` : \`fashion catalog photo of a \${state.gender.toLowerCase()} model\`;`
);

// Replace CRITICAL INSTRUCTION block
code = code.replace(
  /  \/\/ STRICT FULL-LENGTH FRAME REQUIREMENT\n  prompt \+= `\\n\\n---\\n`;\n  if \(actualPose === 'Close-up'\) \{[\s\S]*?ignore its crop and zoom out to show the full body\.\`;\n  \}/m,
  `  // STRICT FULL-LENGTH FRAME REQUIREMENT
  prompt += \`\\n\\n---\\n\`;
  if (actualPose === 'Close-up') {
    prompt += \`FINAL CRITICAL INSTRUCTION: You MUST generate a close-up or waist-up shot. DO NOT generate a full body image. Focus on the upper half of the body.\`;
  } else if (state.fullBody) {
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
    }
  }`
);

fs.writeFileSync('src/services/aiService.ts', code);

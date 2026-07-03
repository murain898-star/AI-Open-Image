const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

// Change AspectRatio to only Custom
code = code.replace(/export type AspectRatio = '1:1' \| '3:4' \| '4:3' \| '9:16' \| '16:9' \| '1:4' \| '1:8' \| '4:1' \| '8:1' \| '12x18' \| '6x9' \| '13x19' \| '9x12' \| '13x40' \| '13x30' \| '10x14' \| 'Custom';/, "export type AspectRatio = 'Custom';");

// Change Pose to remove Close-up
code = code.replace(/export type Pose = 'Standing' \| 'Sitting' \| 'Walking' \| 'Dynamic' \| 'Close-up' \| 'Fancy Pose';/, "export type Pose = 'Standing' \| 'Sitting' \| 'Walking' \| 'Dynamic' \| 'Fancy Pose';");

// Remove fullBody from AppState
code = code.replace(/  \/\/ Composition\n  fullBody: boolean;\n/g, "");

fs.writeFileSync('src/types.ts', code);

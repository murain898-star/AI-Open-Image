import fs from 'fs';

let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');
const patchTop = fs.readFileSync('patch_top.txt', 'utf-8');
const patchBottom = fs.readFileSync('patch_bottom.txt', 'utf-8');

const targetTop = `      <div className="p-6 flex-1 space-y-8 overflow-y-auto">
        {/* Advanced Fidelity Controls */}
        <div className="space-y-4">
          <div className="space-y-4 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/50 dark:border-indigo-800/30">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Denoising Strength</label>`;

const targetBottom = `                <Uploader label="Upload Outfit Image" image={state.outfitImage} onChange={img => updateState('outfitImage', img)} libraryType="outfit" />
              )}
            </>
          )}
        </div>

      </div>

      <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3 transition-colors shrink-0 mt-auto">`;

if (code.includes(targetTop)) {
    code = code.replace(targetTop, patchTop);
    console.log('Replaced top successfully.');
} else {
    console.log('Target top not found.');
}

if (code.includes(targetBottom)) {
    code = code.replace(targetBottom, patchBottom);
    console.log('Replaced bottom successfully.');
} else {
    console.log('Target bottom not found.');
}

fs.writeFileSync('src/components/Sidebar.tsx', code);

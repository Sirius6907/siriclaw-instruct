const fs = require('fs');
const path = require('path');

function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
        const fullPath = path.join(dir, file.name);
        if (file.name === 'node_modules' || file.name === 'dist') return;
        if (file.isDirectory()) {
            walk(fullPath);
        } else if (['.ts', '.js', '.tsx', '.jsx'].includes(path.extname(file.name))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            if (content.includes('SiriClaw-Instruct')) {
                // We want to replace it only if it's acting as a variable or class name part (no hyphens)
                // e.g. SiriClaw-InstructApp -> SiriClawInstructApp
                const newContent = content.replace(/SiriClaw-Instruct([A-Za-z_])/g, 'SiriClawInstruct$1')
                                          .replace(/([A-Za-z_])SiriClaw-Instruct/g, '$1SiriClawInstruct')
                                          .replace(/__SiriClaw-Instruct__/g, '__SIRICLAW_INSTRUCT__');
                
                if (newContent !== content) {
                    fs.writeFileSync(fullPath, newContent);
                    console.log('Fixed identifiers in: ' + fullPath);
                    changed = true;
                }
            }
        }
    });
}
console.log('Fixing hyphenated identifiers in UI...');
walk('./ui/src');
console.log('Done.');

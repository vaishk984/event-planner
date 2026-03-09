const fs = require('fs');
const path = require('path');

const dir = 'actions';
const files = fs.readdirSync(dir);

for (const file of files) {
    if (!file.endsWith('.ts')) continue;

    const fp = path.join(dir, file);
    let content = fs.readFileSync(fp, 'utf8');

    // Remove all existing 'use server' declarations and their variations
    content = content.replace(/['"]use server['"];?/g, '');

    // Trim any leading whitespace or newlines left behind
    content = content.trimStart();

    // Prepend exactly one 'use server' at the very top
    content = "'use server'\n" + content;

    fs.writeFileSync(fp, content, 'utf8');
    console.log('Sanitized:', file);
}

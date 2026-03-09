const fs = require('fs');
const path = require('path');

const actionsDir = path.join(__dirname, '../actions');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const regex = /const \{\s*data:\s*\{\s*session\s*\}\s*,\s*error:\s*authError\s*\}\s*=\s*await\s+supabase\.auth\.getSession\(\);?\s*const\s+user\s*=\s*session\?\.user;?\s*if\s*\(\s*authError\s*\|\|\s*!user\s*\)\s*\{\s*return\s*\{\s*error:\s*'Unauthorized'\s*\}\s*\}/g;

    const replacement = `const session = await getSession();
        if (!session) {
            return { error: 'Unauthorized' }
        }
        const user = { id: session.userId, email: session.email };`;

    if (regex.test(content)) {
        content = content.replace(regex, replacement);

        // Ensure getSession is imported
        if (!content.includes('import { getSession }')) {
            content = content.replace(/(import.*?\n)/, `$1import { getSession } from '@/lib/session'\n`);
        }

        fs.writeFileSync(filePath, content);
        console.log(`Updated auth check in: ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(actionsDir);

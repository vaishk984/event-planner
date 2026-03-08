import { promises as fs } from 'fs';
import path from 'path';

async function replaceInDirectory(dir: string) {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            await replaceInDirectory(fullPath);
        } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
            let content = await fs.readFile(fullPath, 'utf-8');
            let modified = false;

            // Pattern 1:
            // const { data: { user }, error: authError } = await supabase.auth.getUser()
            // -> const { data: { session }, error: authError } = await supabase.auth.getSession(); const user = session?.user;
            if (content.includes('const { data: { user }, error: authError } = await supabase.auth.getUser()')) {
                content = content.replace(
                    /const \{ data: \{ user \}, error: authError \} = await supabase\.auth\.getUser\(\)/g,
                    'const { data: { session }, error: authError } = await supabase.auth.getSession();\n        const user = session?.user;'
                );
                modified = true;
            }

            // Pattern 2:
            // const { data: { user } } = await supabase.auth.getUser()
            // -> const { data: { session } } = await supabase.auth.getSession(); const user = session?.user;
            if (content.includes('const { data: { user } } = await supabase.auth.getUser()')) {
                content = content.replace(
                    /const \{ data: \{ user \} \} = await supabase\.auth\.getUser\(\)/g,
                    'const { data: { session } } = await supabase.auth.getSession();\n    const user = session?.user;'
                );
                modified = true;
            }

            // Pattern 3:
            // const { data: { user }, error } = await supabase.auth.getUser()
            if (content.includes('const { data: { user }, error } = await supabase.auth.getUser()')) {
                content = content.replace(
                    /const \{ data: \{ user \}, error \} = await supabase\.auth\.getUser\(\)/g,
                    'const { data: { session }, error } = await supabase.auth.getSession();\n    const user = session?.user;'
                );
                modified = true;
            }

            if (modified) {
                await fs.writeFile(fullPath, content, 'utf-8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

async function main() {
    console.log('Starting global replacement of getUser() to getSession()...');

    const dirs = [
        path.join(process.cwd(), 'actions'),
        path.join(process.cwd(), 'app'),
        path.join(process.cwd(), 'lib')
    ];

    for (const dir of dirs) {
        try {
            await replaceInDirectory(dir);
        } catch (e) {
            console.error(`Error processing directory ${dir}:`, e);
        }
    }

    console.log('Done!');
}

main().catch(console.error);

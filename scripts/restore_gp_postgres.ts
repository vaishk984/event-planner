
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const dbUrl = process.env.DATABASE_URL; // Using connection string
// If DATABASE_URL is not set but we have Supabase URL/Key, we might need the direct connection string.
// Let's check .env.local via dotenv loading first. Usually, for Supabase, we need the connection pooler or direct DB URL.
// If not present, we can't use `postgres`.
// Checking env vars...

if (!dbUrl) {
    console.error('❌ Missing DATABASE_URL in .env.local. Cannot use postgres driver directly without it.');
    process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function restore() {
    console.log('🔄 Connecting to DB via Postgres driver...');

    try {
        const result = await sql`
            INSERT INTO vendors (
                company_name, category, description, location, price_range, rating, contact_number, email
            ) VALUES (
                'Grand Palace venue', 
                'venue', 
                'Luxury venue for grand weddings and events', 
                'Mumbai, India', 
                '$$$$', 
                4.8, 
                '+91 99999 99999', 
                'grandpalacevenue@planneros.com'
            )
            ON CONFLICT (company_name) DO UPDATE 
            SET email = EXCLUDED.email
            RETURNING id;
        `;

        console.log('✅ Success! Vendor ID:', result[0].id);
    } catch (e) {
        console.error('❌ SQL Error:', e);
    } finally {
        await sql.end();
    }
}

restore();

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    console.log('[debug-auth] Total cookies received:', allCookies.length)
    allCookies.forEach(c => {
        console.log(`[debug-auth] Cookie: ${c.name} = ${c.value.substring(0, 30)}...`)
    })

    const supabaseCookies = allCookies
        .filter(c => c.name.startsWith('sb-'))
        .map(c => ({ name: c.name, valueLength: c.value.length, preview: c.value.substring(0, 50) }))

    return NextResponse.json({
        totalCookies: allCookies.length,
        cookieNames: allCookies.map(c => c.name),
        supabaseCookies,
    })
}

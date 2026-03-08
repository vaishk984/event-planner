'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string || 'planner'
    const companyName = formData.get('company_name') as string
    const categoryId = formData.get('category_id') as string

    console.log('=== SIGNUP (signup.ts) ===')
    console.log('Role:', role)
    console.log('Category:', categoryId)

    if (!email || !password || !name) {
        return { error: 'All fields are required' }
    }

    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: name,
                role: role,
                company_name: companyName || name,
                category_id: categoryId,
            },
        },
    })

    if (error) {
        console.error('Signup error:', error.message)
        return { error: error.message }
    }

    if (!data.user) {
        return { error: 'Signup failed. Please try again.' }
    }

    // Create vendor record directly
    if (role === 'vendor') {
        console.log('Creating vendor record...')
        const { error: vendorError } = await supabase.from('vendors').insert({
            user_id: data.user.id,
            name: name,
            email: email,
            category: categoryId || 'other',
            status: 'active',
            is_verified: false,
        })

        if (vendorError) {
            console.error('Vendor creation error:', vendorError)
        } else {
            console.log('Vendor created successfully')
        }
    }

    revalidatePath('/', 'layout')
    console.log('Redirecting to:', `/${role}`)

    // Redirect based on role
    redirect(`/${role}`)
}

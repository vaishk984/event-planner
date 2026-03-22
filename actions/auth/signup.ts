'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logger'

const logger = createLogger('Signup')

export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string || 'planner'
    const companyName = formData.get('company_name') as string
    const categoryId = formData.get('category_id') as string

    logger.info('Signup initiated', { role, categoryId })

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
        logger.error('Signup failed', error)
        return { error: error.message }
    }

    if (!data.user) {
        return { error: 'Signup failed. Please try again.' }
    }

    // Create vendor record directly
    if (role === 'vendor') {
        logger.info('Creating vendor record')
        const { error: vendorError } = await supabase.from('vendors').insert({
            user_id: data.user?.id,
            name: name,
            email: email,
            category: categoryId || 'other',
            status: 'active',
            is_verified: false,
        })

        if (vendorError) {
            logger.error('Vendor creation failed', vendorError)
        } else {
            logger.info('Vendor created successfully')
        }
    }

    revalidatePath('/', 'layout')
    logger.info('Signup complete, redirecting', { role })

    // Redirect based on role
    redirect(`/${role}`)
}

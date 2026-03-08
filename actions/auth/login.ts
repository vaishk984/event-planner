'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Login with email and password
 */
export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error.message)
        return { error: error.message }
    }

    if (!data.user) {
        return { error: 'Login failed. Please try again.' }
    }

    // Get user profile to determine role
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, role_id')
        .eq('id', data.user.id)
        .single()

    // Check if user has a vendor record (direct check)
    const { data: vendorRecord } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', data.user.id)
        .single()

    // Determine role: check vendor record first, then role column, then default
    let role = 'planner'
    if (vendorRecord) {
        role = 'vendor'
    } else if (profile?.role) {
        role = profile.role
    }

    // Redirect based on role
    redirect(`/${role}`)
}

/**
 * Signup with email and password
 */
export async function signup(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as string || 'planner'
    const companyName = formData.get('company_name') as string
    const categoryId = formData.get('category_id') as string

    console.log('=== SIGNUP DEBUG ===')
    console.log('Role from form:', role)
    console.log('Email:', email)
    console.log('Name:', name)
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
                category_id: categoryId, // Pass to trigger
            },
        },
    })

    if (error) {
        console.error('Auth signup error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        return { error: error.message }
    }

    if (!data.user) {
        return { error: 'Signup failed. Please try again.' }
    }

    // Create vendor record directly (don't rely on trigger)
    if (role === 'vendor') {
        console.log('Creating vendor record for user:', data.user.id)
        console.log('Vendor data:', {
            user_id: data.user.id,
            company_name: name,
        })

        const { error: vendorError, data: vendorData } = await supabase.from('vendors').insert({
            user_id: data.user.id,
            company_name: name,
        }).select()

        if (vendorError) {
            console.error('❌ Vendor creation error:', vendorError)
            console.error('Error code:', vendorError.code)
            console.error('Error details:', vendorError.details)
            console.error('Error hint:', vendorError.hint)
            console.error('Error message:', vendorError.message)
        } else {
            console.log('✅ Vendor record created:', vendorData)
        }
    }

    console.log('Redirecting to:', `/${role}`)
    // Redirect to dashboard
    redirect(`/${role}`)
}

/**
 * Logout user
 */
export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // Clear any custom session cookies
    const cookieStore = await cookies()
    cookieStore.delete('session')

    redirect('/login')
}

/**
 * Get current session
 */
export async function getSession() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

/**
 * Get current user with profile
 */
export async function getCurrentUser() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return {
        ...user,
        profile,
    }
}

/**
 * Get planner profile
 */
export async function getPlannerProfile() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('planner_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return profile
}

/**
 * Update user profile
 */
export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const displayName = formData.get('display_name') as string
    const phone = formData.get('phone') as string
    const avatarUrl = formData.get('avatar_url') as string

    const { error } = await supabase
        .from('user_profiles')
        .update({
            display_name: displayName,
            phone: phone,
            avatar_url: avatarUrl,
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

/**
 * Update planner profile
 */
export async function updatePlannerProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const { error } = await supabase
        .from('planner_profiles')
        .update({
            company_name: formData.get('company_name') as string,
            phone: formData.get('phone') as string,
            city: formData.get('city') as string,
            state: formData.get('state') as string,
            experience_years: parseInt(formData.get('experience_years') as string) || 0,
            bio: formData.get('bio') as string,
            website: formData.get('website') as string,
            instagram_handle: formData.get('instagram_handle') as string,
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

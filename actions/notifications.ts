'use server'

import { createClient } from '@/lib/supabase/server'

export async function getNotifications() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return { notifications: [], unreadCount: 0 }

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

    if (error) {
        console.error('Error fetching notifications:', error)
        return { notifications: [], unreadCount: 0 }
    }

    const unreadCount = (data || []).filter(n => !n.is_read).length
    return { notifications: data || [], unreadCount }
}

export async function markNotificationRead(notificationId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

    if (error) {
        console.error('Error marking notification read:', error)
        return { error: 'Failed to update' }
    }
    return { success: true }
}

export async function markAllNotificationsRead() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return { error: 'Not authenticated' }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    if (error) {
        console.error('Error marking all read:', error)
        return { error: 'Failed to update' }
    }
    return { success: true }
}

export async function createNotification(params: {
    userId: string,
    eventId?: string,
    type: 'proposal_approved' | 'proposal_changes_requested' | 'booking_update' | 'new_intake' | 'general',
    title: string,
    message: string,
    link?: string,
}) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: params.userId,
            event_id: params.eventId || null,
            type: params.type,
            title: params.title,
            message: params.message,
            link: params.link || null,
        })

    if (error) {
        console.error('Error creating notification:', error)
        return { error: 'Failed to create notification' }
    }
    return { success: true }
}

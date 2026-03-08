import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

export default function ForgotPasswordPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Forgot Password?</CardTitle>
                <CardDescription>
                    Enter your email and we'll send you a reset link
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ForgotPasswordForm />
            </CardContent>
        </Card>
    )
}

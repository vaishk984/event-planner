import { LoginForm } from '@/components/auth/login-form'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

export default function LoginPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                    Sign in to your account to continue
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LoginForm />
            </CardContent>
        </Card>
    )
}

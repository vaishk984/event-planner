import { SignupForm } from '@/components/auth/signup-form'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

export default function SignupPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                    Get started with PlannerOS today
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SignupForm />
            </CardContent>
        </Card>
    )
}

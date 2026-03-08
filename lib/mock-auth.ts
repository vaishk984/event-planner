// Mock user database
export const MOCK_USERS = [
    {
        id: 'admin-001',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'admin',
        name: 'Super Admin'
    },
    {
        id: 'planner-001',
        email: 'planner@test.com',
        password: 'password123',
        role: 'planner',
        name: 'Test Planner'
    },
    {
        id: 'client-001',
        email: 'client@test.com',
        password: 'password123',
        role: 'client',
        name: 'Test Client'
    },
    {
        id: 'vendor-001',
        email: 'vendor@test.com',
        password: 'password123',
        role: 'vendor',
        name: 'Test Vendor'
    }
]

export function findUserByEmail(email: string) {
    return MOCK_USERS.find(user => user.email === email)
}

export function validateCredentials(email: string, password: string) {
    const user = findUserByEmail(email)
    return user && user.password === password ? user : null
}

/**
 * Health Check API Route
 *
 * GET /api/v1/health - API health check endpoint
 */

import { NextResponse } from 'next/server';
import { AppConfig } from '@/src/backend/config';

export async function GET() {
    try {
        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: AppConfig.version,
            environment: AppConfig.environment,
        });
    } catch (err) {
        console.error('Health check error:', err);
        return NextResponse.json(
            { status: 'unhealthy', error: err instanceof Error ? err.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

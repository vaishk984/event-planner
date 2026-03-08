/**
 * Vendor Controller
 * 
 * Handles API requests for vendor management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { vendorService, VendorResponseDto } from '../services';
import { CreateVendorSchema, UpdateVendorSchema, QueryVendorsSchema } from '../dto/request';
import { validateBody, validateQuery, validatePathParam } from '../middleware';
import { ApiResponse } from '../utils';
import { createLogger } from '../utils';

const logger = createLogger('VendorController');

export class VendorController {
    /**
     * GET /api/v1/vendors
     * Search/list vendors
     */
    async list(request: NextRequest): Promise<NextResponse> {
        const query = validateQuery(request, QueryVendorsSchema);
        const result = await vendorService.search(query);
        return ApiResponse.paginated(result.items, result.meta);
    }

    /**
     * GET /api/v1/vendors/:id
     * Get a single vendor
     */
    async getById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const vendor = await vendorService.getById(id);
        return ApiResponse.success(vendor);
    }

    /**
     * POST /api/v1/vendors
     * Create a new vendor profile
     */
    async create(request: NextRequest): Promise<NextResponse> {
        const body = await validateBody(request, CreateVendorSchema);

        // TODO: Get user ID from auth context
        const userId = 'demo-user-id';

        const vendor = await vendorService.create(body, userId);
        return ApiResponse.created(vendor);
    }

    /**
     * PUT /api/v1/vendors/:id
     * Update a vendor
     */
    async update(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        const body = await validateBody(request, UpdateVendorSchema);

        const vendor = await vendorService.update(id, body);
        return ApiResponse.success(vendor);
    }

    /**
     * DELETE /api/v1/vendors/:id
     * Delete a vendor
     */
    async delete(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        const id = validatePathParam(params.id, 'id', { uuid: true });
        await vendorService.delete(id);
        return ApiResponse.deleted(id);
    }

    /**
     * GET /api/v1/vendors/verified
     * Get all verified vendors
     */
    async getVerified(request: NextRequest): Promise<NextResponse> {
        const vendors = await vendorService.getVerified();
        return ApiResponse.success(vendors);
    }

    /**
     * GET /api/v1/vendors/me
     * Get current user's vendor profile
     */
    async getMyProfile(request: NextRequest): Promise<NextResponse> {
        // TODO: Get user ID from auth context
        const userId = 'demo-user-id';

        const vendor = await vendorService.getByUserId(userId);
        if (!vendor) {
            return ApiResponse.success(null, 'No vendor profile found');
        }
        return ApiResponse.success(vendor);
    }
}

export const vendorController = new VendorController();

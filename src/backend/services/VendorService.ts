/**
 * Vendor Service
 * 
 * Business logic for Vendor operations.
 */

import { VendorRepository, vendorRepository, VendorSearchCriteria } from '../repositories';
import { Vendor } from '../entities';
import { CreateVendorDto, UpdateVendorDto, QueryVendorsDto } from '../dto/request';
import { PaginatedResponseDto, createPaginatedResponse } from '../dto/response';
import { NotFoundException, BusinessException, ConflictException } from '../exceptions';
import { createLogger } from '../utils';

const logger = createLogger('VendorService');

// Vendor response DTO
export interface VendorResponseDto {
    id: string;
    userId?: string;

    companyName: string;
    category: string;
    description?: string;
    location: string;
    priceRange: { min: number; max: number };
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    imageUrl?: string;
    portfolioUrls: string[];
    priceLevel: 'budget' | 'mid-range' | 'premium';
    createdAt: string;
    updatedAt: string;
}

function toResponseDto(vendor: Vendor): VendorResponseDto {
    return {
        id: vendor.id,
        userId: vendor.userId,
        companyName: vendor.companyName,
        category: vendor.category,
        description: vendor.description,
        location: vendor.location,
        priceRange: vendor.priceRange,
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
        isVerified: vendor.isVerified,
        imageUrl: vendor.imageUrl,
        portfolioUrls: vendor.portfolioUrls,
        priceLevel: vendor.priceLevel,
        createdAt: vendor.createdAt.toISOString(),
        updatedAt: vendor.updatedAt.toISOString(),
    };
}

export class VendorService {
    constructor(private vendorRepo: VendorRepository = vendorRepository) { }

    async getById(id: string): Promise<VendorResponseDto> {
        const vendor = await this.vendorRepo.findByIdOrThrow(id);
        return toResponseDto(vendor);
    }

    async getByUserId(userId: string): Promise<VendorResponseDto | null> {
        const vendor = await this.vendorRepo.findByUserId(userId);
        return vendor ? toResponseDto(vendor) : null;
    }

    async search(query: QueryVendorsDto): Promise<PaginatedResponseDto<VendorResponseDto>> {
        const criteria: VendorSearchCriteria = {
            category: query.category,
            location: query.location,
            maxPrice: query.maxPrice,
            minRating: query.minRating,
            isVerified: query.isVerified,
        };

        const result = await this.vendorRepo.search(criteria, {
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy === 'rating' ? 'quality_score' : query.sortBy,
            sortOrder: query.sortOrder,
        });

        return createPaginatedResponse(
            result.data.map(toResponseDto),
            result.page,
            result.limit,
            result.total
        );
    }

    async create(dto: CreateVendorDto, userId: string): Promise<VendorResponseDto> {
        logger.info('Creating new vendor', { userId, companyName: dto.companyName });

        // Check if user already has a vendor profile
        const existing = await this.vendorRepo.findByUserId(userId);
        if (existing) {
            throw ConflictException.duplicate('Vendor', 'userId', userId);
        }

        const vendor = await this.vendorRepo.create({
            userId,
            companyName: dto.companyName,
            category: dto.category,
            description: dto.description,
            location: dto.location,
            priceRange: { min: dto.priceMin, max: dto.priceMax },
            rating: 0,
            reviewCount: 0,
            isVerified: false,
            imageUrl: dto.imageUrl,
            portfolioUrls: dto.portfolioUrls || [],
        } as unknown as Partial<Vendor>);

        logger.info('Vendor created', { vendorId: vendor.id });
        return toResponseDto(vendor);
    }

    async update(id: string, dto: UpdateVendorDto): Promise<VendorResponseDto> {
        await this.vendorRepo.findByIdOrThrow(id);

        const updateData: Partial<Vendor> = {};
        if (dto.companyName) updateData.companyName = dto.companyName;
        if (dto.category) updateData.category = dto.category;
        if (dto.description !== undefined) updateData.description = dto.description || undefined;
        if (dto.location) updateData.location = dto.location;
        if (dto.priceMin !== undefined || dto.priceMax !== undefined) {
            updateData.priceRange = {
                min: dto.priceMin || 0,
                max: dto.priceMax || 0,
            };
        }
        if (dto.imageUrl !== undefined) updateData.imageUrl = dto.imageUrl || undefined;
        if (dto.portfolioUrls) updateData.portfolioUrls = dto.portfolioUrls;

        const updated = await this.vendorRepo.update(id, updateData);
        logger.info('Vendor updated', { vendorId: id });
        return toResponseDto(updated);
    }

    async delete(id: string): Promise<void> {
        await this.vendorRepo.findByIdOrThrow(id);
        await this.vendorRepo.delete(id);
        logger.info('Vendor deleted', { vendorId: id });
    }

    async getVerified(): Promise<VendorResponseDto[]> {
        const vendors = await this.vendorRepo.findVerified();
        return vendors.map(toResponseDto);
    }
}

export const vendorService = new VendorService();

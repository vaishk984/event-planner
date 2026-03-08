/**
 * Task Service
 * 
 * Business logic for Task operations.
 */

import { TaskRepository, taskRepository } from '../repositories';
import { Task, TaskStatus } from '../entities';
import { CreateTaskDto, UpdateTaskDto, CompleteTaskDto, QueryTasksDto } from '../dto/request';
import { PaginatedResponseDto, createPaginatedResponse } from '../dto/response';
import { NotFoundException, BusinessException } from '../exceptions';
import { createLogger } from '../utils';

const logger = createLogger('TaskService');

// Task response DTO
export interface TaskResponseDto {
    id: string;
    eventId: string;
    vendorId: string;
    serviceId?: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    startTime?: string;
    endTime?: string;
    dueDate?: string;
    completedAt?: string;
    proofUrls: string[];
    notes?: string;
    isCompleted: boolean;
    isOverdue: boolean;
    createdAt: string;
    updatedAt: string;
}

function toResponseDto(task: Task): TaskResponseDto {
    return {
        id: task.id,
        eventId: task.eventId,
        vendorId: task.vendorId,
        serviceId: task.serviceId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startTime: task.startTime?.toISOString(),
        endTime: task.endTime?.toISOString(),
        dueDate: task.dueDate?.toISOString(),
        completedAt: task.completedAt?.toISOString(),
        proofUrls: task.proofUrls,
        notes: task.notes,
        isCompleted: task.isCompleted,
        isOverdue: task.isOverdue,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
    };
}

export class TaskService {
    constructor(private taskRepo: TaskRepository = taskRepository) { }

    async getById(id: string): Promise<TaskResponseDto> {
        const task = await this.taskRepo.findByIdOrThrow(id);
        return toResponseDto(task);
    }

    async getByEvent(eventId: string, query: QueryTasksDto): Promise<PaginatedResponseDto<TaskResponseDto>> {
        const result = await this.taskRepo.findByEventId(eventId, {
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });

        return createPaginatedResponse(
            result.data.map(toResponseDto),
            result.page,
            result.limit,
            result.total
        );
    }

    async getByVendor(vendorId: string, query: QueryTasksDto): Promise<PaginatedResponseDto<TaskResponseDto>> {
        const result = await this.taskRepo.findByVendorId(vendorId, {
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        });

        return createPaginatedResponse(
            result.data.map(toResponseDto),
            result.page,
            result.limit,
            result.total
        );
    }

    async getPending(vendorId: string): Promise<TaskResponseDto[]> {
        const tasks = await this.taskRepo.findPendingForVendor(vendorId);
        return tasks.map(toResponseDto);
    }

    async getOverdue(vendorId?: string): Promise<TaskResponseDto[]> {
        const tasks = await this.taskRepo.findOverdue(vendorId);
        return tasks.map(toResponseDto);
    }

    async create(dto: CreateTaskDto): Promise<TaskResponseDto> {
        logger.info('Creating new task', { eventId: dto.eventId, vendorId: dto.vendorId });

        const task = await this.taskRepo.create({
            eventId: dto.eventId,
            vendorId: dto.vendorId,
            serviceId: dto.serviceId,
            title: dto.title,
            description: dto.description,
            status: 'pending',
            priority: dto.priority,
            startTime: dto.startTime ? new Date(dto.startTime) : undefined,
            endTime: dto.endTime ? new Date(dto.endTime) : undefined,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            proofUrls: [],
        } as Partial<Task>);

        logger.info('Task created', { taskId: task.id });
        return toResponseDto(task);
    }

    async update(id: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
        const task = await this.taskRepo.findByIdOrThrow(id);

        if (task.isCompleted) {
            throw new BusinessException('Cannot update a completed task', 'TASK_COMPLETED');
        }

        const updated = await this.taskRepo.update(id, {
            ...dto,
            startTime: dto.startTime ? new Date(dto.startTime) : undefined,
            endTime: dto.endTime ? new Date(dto.endTime) : undefined,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        } as Partial<Task>);

        logger.info('Task updated', { taskId: id });
        return toResponseDto(updated);
    }

    async updateStatus(id: string, status: TaskStatus, reason?: string): Promise<TaskResponseDto> {
        const task = await this.taskRepo.findByIdOrThrow(id);

        if (!task.canTransitionTo(status)) {
            throw new BusinessException(
                `Cannot transition from '${task.status}' to '${status}'`,
                'INVALID_TRANSITION'
            );
        }

        // For rejections, save the reason
        if (status === 'rejected' && reason) {
            await this.taskRepo.update(id, { notes: reason } as Partial<Task>);
        }

        const updated = await this.taskRepo.updateStatus(id, status);
        logger.info('Task status updated', { taskId: id, oldStatus: task.status, newStatus: status });
        return toResponseDto(updated);
    }

    async complete(id: string, dto: CompleteTaskDto): Promise<TaskResponseDto> {
        const task = await this.taskRepo.findByIdOrThrow(id);

        if (task.status !== 'in_progress') {
            throw new BusinessException(
                'Task must be in progress to complete',
                'INVALID_STATE'
            );
        }

        // Add proof URLs
        await this.taskRepo.update(id, {
            proofUrls: [...task.proofUrls, ...dto.proofUrls],
            notes: dto.notes || task.notes,
        } as Partial<Task>);

        const updated = await this.taskRepo.updateStatus(id, 'completed');
        logger.info('Task completed', { taskId: id, proofCount: dto.proofUrls.length });
        return toResponseDto(updated);
    }

    async verify(id: string): Promise<TaskResponseDto> {
        const task = await this.taskRepo.findByIdOrThrow(id);

        if (task.status !== 'completed') {
            throw new BusinessException(
                'Task must be completed to verify',
                'INVALID_STATE'
            );
        }

        const updated = await this.taskRepo.updateStatus(id, 'verified');
        logger.info('Task verified', { taskId: id });
        return toResponseDto(updated);
    }

    async delete(id: string): Promise<void> {
        const task = await this.taskRepo.findByIdOrThrow(id);

        if (!['pending', 'rejected'].includes(task.status)) {
            throw new BusinessException(
                'Only pending or rejected tasks can be deleted',
                'CANNOT_DELETE'
            );
        }

        await this.taskRepo.delete(id);
        logger.info('Task deleted', { taskId: id });
    }
}

export const taskService = new TaskService();

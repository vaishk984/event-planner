/**
 * Dependency Injection Container
 * 
 * Simple IoC container for managing service instances.
 * Similar to Spring's ApplicationContext.
 * 
 * Usage:
 *   const eventService = Container.resolve(EventService);
 */

type Constructor<T = unknown> = new (...args: unknown[]) => T;
type Factory<T = unknown> = () => T;

interface ServiceRegistration<T = unknown> {
    factory: Factory<T>;
    singleton: boolean;
    instance?: T;
}

class DIContainer {
    private services = new Map<string, ServiceRegistration>();

    /**
     * Register a service with a factory function
     */
    register<T>(
        key: string,
        factory: Factory<T>,
        options: { singleton?: boolean } = {}
    ): void {
        this.services.set(key, {
            factory,
            singleton: options.singleton ?? true,
        });
    }

    /**
     * Register a class with automatic instantiation
     */
    registerClass<T>(
        key: string,
        ClassRef: Constructor<T>,
        dependencies: string[] = [],
        options: { singleton?: boolean } = {}
    ): void {
        this.register(
            key,
            () => {
                const deps = dependencies.map(dep => this.resolve(dep));
                return new ClassRef(...deps);
            },
            options
        );
    }

    /**
     * Resolve a service by key
     */
    resolve<T>(key: string): T {
        const registration = this.services.get(key);

        if (!registration) {
            throw new Error(`Service '${key}' is not registered in the container`);
        }

        // Return existing instance for singletons
        if (registration.singleton && registration.instance !== undefined) {
            return registration.instance as T;
        }

        // Create new instance
        const instance = registration.factory() as T;

        // Cache singleton instance
        if (registration.singleton) {
            registration.instance = instance;
        }

        return instance;
    }

    /**
     * Check if a service is registered
     */
    has(key: string): boolean {
        return this.services.has(key);
    }

    /**
     * Clear all registered services (useful for testing)
     */
    clear(): void {
        this.services.clear();
    }

    /**
     * Get all registered service keys
     */
    getRegisteredServices(): string[] {
        return Array.from(this.services.keys());
    }
}

// Export singleton container instance
export const Container = new DIContainer();

// Service registration keys (type-safe)
export const ServiceKeys = {
    // Repositories
    EventRepository: 'EventRepository',
    VendorRepository: 'VendorRepository',
    LeadRepository: 'LeadRepository',
    TaskRepository: 'TaskRepository',
    ProposalRepository: 'ProposalRepository',
    InvoiceRepository: 'InvoiceRepository',

    // Services
    EventService: 'EventService',
    VendorService: 'VendorService',
    LeadService: 'LeadService',
    TaskService: 'TaskService',
    ProposalService: 'ProposalService',
    InvoiceService: 'InvoiceService',
    AuthService: 'AuthService',

    // Controllers
    EventController: 'EventController',
    VendorController: 'VendorController',
    LeadController: 'LeadController',
    TaskController: 'TaskController',
} as const;

export type ServiceKey = typeof ServiceKeys[keyof typeof ServiceKeys];

// Database types (to be generated from Supabase)
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            // Will be auto-generated from Supabase
        }
    }
}

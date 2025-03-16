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
      events: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
          start_date: string
          end_date: string
        }
      }
      event_entries: {
        Row: {
          id: string
          event_id: string
          name: string
          email: string | null
          whatsapp_number: string
          address: string
          city: string
          pincode: number
          created_at: string
          updated_at: string
          qr_code_id: string
          request_ip_address: string
          request_user_agent: string
        }
        Insert: {
          id: string
          event_id: string
          name: string
          email?: string | null
          whatsapp_number: string
          address: string
          city: string
          pincode: number
          created_at?: string
          updated_at?: string
          qr_code_id: string
          request_ip_address: string
          request_user_agent: string
        }
      }
    }
  }
} 
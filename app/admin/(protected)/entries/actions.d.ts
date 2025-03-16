export type Entry = {
  id: string;
  event_id: string;
  event_name: string;
  name: string;
  email: string | null;
  whatsapp_number: string;
  address: string;
  city: string;
  pincode: string;
  qr_code_id: string | null;
  prize_id: string | null;
  prize_name: string | null;
  created_at: string;
};

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export function getEntries(
  params?: PaginationParams
): Promise<{ 
  data: Entry[]; 
  total: number; 
  page: number; 
  pageSize: number; 
  totalPages: number; 
}>; 
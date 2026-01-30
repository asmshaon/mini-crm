export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password?: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          accountNumber: string;
          phone: string;
          nominee: string | null;
          nid: string | null;
          status: "active" | "inactive" | "lead";
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          accountNumber: string;
          phone: string;
          nominee?: string | null;
          nid?: string | null;
          status?: "active" | "inactive" | "lead";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          accountNumber?: string;
          phone?: string;
          nominee?: string | null;
          nid?: string | null;
          status?: "active" | "inactive" | "lead";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
    };
  };
};

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
export type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];

export type CustomerStatus = "active" | "inactive" | "lead";

export interface CustomerFormData {
  name: string;
  accountNumber: string;
  phone: string;
  nominee?: string;
  nid?: string;
  status: CustomerStatus;
  notes?: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: User;
}

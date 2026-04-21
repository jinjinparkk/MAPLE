export interface Database {
  public: {
    Tables: {
      messages: {
        Row: {
          id: string;
          nickname: string;
          content: string;
          created_at: string;
          ip_hash: string | null;
        };
        Insert: {
          id?: string;
          nickname: string;
          content: string;
          created_at?: string;
          ip_hash?: string | null;
        };
        Update: {
          id?: string;
          nickname?: string;
          content?: string;
          created_at?: string;
          ip_hash?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export interface ChatMessage {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
}

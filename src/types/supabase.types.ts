// Supabase generated types placeholder
// Run: npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.types.ts
// until then this stub keeps TypeScript happy

export type Database = {
  public: {
    Tables: Record<string, {
      Row: Record<string, unknown>;
      Insert: Record<string, unknown>;
      Update: Record<string, unknown>;
    }>;
    Views: Record<string, { Row: Record<string, unknown> }>;
    Functions: Record<string, unknown>;
    Enums: Record<string, string>;
  };
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bookmarks: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      laureates: {
        Row: {
          biography: string | null
          birth_year: number
          category: Database["public"]["Enums"]["nobel_category"]
          created_at: string
          death_year: number | null
          first_name: string
          id: string
          institution: string
          last_name: string
          motivation: string
          nationality: string
          photo: string | null
          year: number
        }
        Insert: {
          biography?: string | null
          birth_year: number
          category: Database["public"]["Enums"]["nobel_category"]
          created_at?: string
          death_year?: number | null
          first_name: string
          id?: string
          institution?: string
          last_name: string
          motivation: string
          nationality: string
          photo?: string | null
          year: number
        }
        Update: {
          biography?: string | null
          birth_year?: number
          category?: Database["public"]["Enums"]["nobel_category"]
          created_at?: string
          death_year?: number | null
          first_name?: string
          id?: string
          institution?: string
          last_name?: string
          motivation?: string
          nationality?: string
          photo?: string | null
          year?: number
        }
        Relationships: []
      }
      lectures: {
        Row: {
          category: Database["public"]["Enums"]["nobel_category"]
          created_at: string
          description: string | null
          duration: string
          id: string
          speaker_name: string
          thumbnail: string | null
          title: string
          views: number
          year: number
        }
        Insert: {
          category: Database["public"]["Enums"]["nobel_category"]
          created_at?: string
          description?: string | null
          duration?: string
          id?: string
          speaker_name: string
          thumbnail?: string | null
          title: string
          views?: number
          year: number
        }
        Update: {
          category?: Database["public"]["Enums"]["nobel_category"]
          created_at?: string
          description?: string | null
          duration?: string
          id?: string
          speaker_name?: string
          thumbnail?: string | null
          title?: string
          views?: number
          year?: number
        }
        Relationships: []
      }
      mentor_chat_history: {
        Row: {
          created_at: string
          id: string
          mentor_name: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_name: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_name?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      research_papers: {
        Row: {
          abstract: string | null
          authors: string[]
          category: Database["public"]["Enums"]["nobel_category"]
          citations: number
          created_at: string
          doi: string | null
          id: string
          journal: string | null
          title: string
          year: number
        }
        Insert: {
          abstract?: string | null
          authors?: string[]
          category: Database["public"]["Enums"]["nobel_category"]
          citations?: number
          created_at?: string
          doi?: string | null
          id?: string
          journal?: string | null
          title: string
          year: number
        }
        Update: {
          abstract?: string | null
          authors?: string[]
          category?: Database["public"]["Enums"]["nobel_category"]
          citations?: number
          created_at?: string
          doi?: string | null
          id?: string
          journal?: string | null
          title?: string
          year?: number
        }
        Relationships: []
      }
      research_projects: {
        Row: {
          created_at: string
          discovery: string | null
          id: string
          name: string
          progress: number
          status: string
          topic: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discovery?: string | null
          id?: string
          name: string
          progress?: number
          status?: string
          topic?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discovery?: string | null
          id?: string
          name?: string
          progress?: number
          status?: string
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      scholar_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      study_room_messages: {
        Row: {
          created_at: string
          display_name: string
          id: string
          message: string
          room_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id?: string
          message: string
          room_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          message?: string
          room_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          action: string
          created_at: string
          id: string
          item_id: string | null
          item_type: string | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      nobel_category:
        | "Physics"
        | "Chemistry"
        | "Medicine"
        | "Literature"
        | "Peace"
        | "Economics"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      nobel_category: [
        "Physics",
        "Chemistry",
        "Medicine",
        "Literature",
        "Peace",
        "Economics",
      ],
    },
  },
} as const

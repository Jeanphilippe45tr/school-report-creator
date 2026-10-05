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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      classes: {
        Row: {
          created_at: string
          id: string
          level: string | null
          name: string
          owner_id: string
          school_year: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string | null
          name: string
          owner_id: string
          school_year: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string | null
          name?: string
          owner_id?: string
          school_year?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          coefficient: number
          created_at: string
          id: string
          owner_id: string
          report_card_id: string
          score: number | null
          subject_id: string
          teacher_comment: string | null
        }
        Insert: {
          coefficient?: number
          created_at?: string
          id?: string
          owner_id: string
          report_card_id: string
          score?: number | null
          subject_id: string
          teacher_comment?: string | null
        }
        Update: {
          coefficient?: number
          created_at?: string
          id?: string
          owner_id?: string
          report_card_id?: string
          score?: number | null
          subject_id?: string
          teacher_comment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_report_card_id_fkey"
            columns: ["report_card_id"]
            isOneToOne: false
            referencedRelation: "report_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bulletin_template: Json | null
          city: string | null
          country: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role_at_school: string | null
          school_address: string | null
          school_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bulletin_template?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role_at_school?: string | null
          school_address?: string | null
          school_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bulletin_template?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role_at_school?: string | null
          school_address?: string | null
          school_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      report_cards: {
        Row: {
          appreciation: string | null
          class_id: string
          class_size: number | null
          created_at: string
          general_average: number | null
          head_teacher_note: string | null
          id: string
          owner_id: string
          principal_note: string | null
          rank: number | null
          school_year: string
          student_id: string
          term: string
          updated_at: string
        }
        Insert: {
          appreciation?: string | null
          class_id: string
          class_size?: number | null
          created_at?: string
          general_average?: number | null
          head_teacher_note?: string | null
          id?: string
          owner_id: string
          principal_note?: string | null
          rank?: number | null
          school_year: string
          student_id: string
          term: string
          updated_at?: string
        }
        Update: {
          appreciation?: string | null
          class_id?: string
          class_size?: number | null
          created_at?: string
          general_average?: number | null
          head_teacher_note?: string | null
          id?: string
          owner_id?: string
          principal_note?: string | null
          rank?: number | null
          school_year?: string
          student_id?: string
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_cards_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_grades: {
        Row: {
          class_id: string
          id: string
          owner_id: string
          school_year: string
          score: number | null
          sequence: number
          student_id: string
          subject_id: string
          updated_at: string
        }
        Insert: {
          class_id: string
          id?: string
          owner_id: string
          school_year: string
          score?: number | null
          sequence: number
          student_id: string
          subject_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          id?: string
          owner_id?: string
          school_year?: string
          score?: number | null
          sequence?: number
          student_id?: string
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequence_grades_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          birth_date: string | null
          birth_place: string | null
          class_id: string
          created_at: string
          first_name: string
          gender: string | null
          id: string
          last_name: string
          matricule: string | null
          owner_id: string
          parent_name: string | null
          parent_phone: string | null
        }
        Insert: {
          birth_date?: string | null
          birth_place?: string | null
          class_id: string
          created_at?: string
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          matricule?: string | null
          owner_id: string
          parent_name?: string | null
          parent_phone?: string | null
        }
        Update: {
          birth_date?: string | null
          birth_place?: string | null
          class_id?: string
          created_at?: string
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          matricule?: string | null
          owner_id?: string
          parent_name?: string | null
          parent_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          class_id: string
          coefficient: number
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          class_id: string
          coefficient?: number
          created_at?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          class_id?: string
          coefficient?: number
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

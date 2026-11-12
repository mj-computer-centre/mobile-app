// Database types in the format produced by `supabase gen types typescript`.
// Regenerate after every migration once the Supabase project exists:
//   pnpm dlx supabase gen types typescript --project-id <id> --schema public > packages/shared/src/db/generated/database.types.ts
// Until then this file is maintained by hand and must match supabase/migrations exactly.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '13';
  };
  public: {
    Tables: {
      app_settings: {
        Row: {
          address: string | null;
          centre_name: string;
          email: string | null;
          facebook_url: string | null;
          id: number;
          instagram_url: string | null;
          map_url: string | null;
          phone: string | null;
          timings: string | null;
          updated_at: string;
          whatsapp: string | null;
          youtube_url: string | null;
        };
        Insert: {
          address?: string | null;
          centre_name?: string;
          email?: string | null;
          facebook_url?: string | null;
          id?: number;
          instagram_url?: string | null;
          map_url?: string | null;
          phone?: string | null;
          timings?: string | null;
          updated_at?: string;
          whatsapp?: string | null;
          youtube_url?: string | null;
        };
        Update: {
          address?: string | null;
          centre_name?: string;
          email?: string | null;
          facebook_url?: string | null;
          id?: number;
          instagram_url?: string | null;
          map_url?: string | null;
          phone?: string | null;
          timings?: string | null;
          updated_at?: string;
          whatsapp?: string | null;
          youtube_url?: string | null;
        };
        Relationships: [];
      };
      banners: {
        Row: {
          course_id: string | null;
          created_at: string;
          id: string;
          image_path: string;
          is_active: boolean;
          position: number;
          updated_at: string;
        };
        Insert: {
          course_id?: string | null;
          created_at?: string;
          id?: string;
          image_path: string;
          is_active?: boolean;
          position?: number;
          updated_at?: string;
        };
        Update: {
          course_id?: string | null;
          created_at?: string;
          id?: string;
          image_path?: string;
          is_active?: boolean;
          position?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'banners_course_id_fkey';
            columns: ['course_id'];
            isOneToOne: false;
            referencedRelation: 'courses';
            referencedColumns: ['id'];
          },
        ];
      };
      course_sections: {
        Row: {
          course_id: string;
          position: number;
          section_id: string;
        };
        Insert: {
          course_id: string;
          position: number;
          section_id: string;
        };
        Update: {
          course_id?: string;
          position?: number;
          section_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'course_sections_course_id_fkey';
            columns: ['course_id'];
            isOneToOne: false;
            referencedRelation: 'courses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'course_sections_section_id_fkey';
            columns: ['section_id'];
            isOneToOne: false;
            referencedRelation: 'sections';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'course_sections_section_id_fkey';
            columns: ['section_id'];
            isOneToOne: false;
            referencedRelation: 'section_usage';
            referencedColumns: ['section_id'];
          },
        ];
      };
      courses: {
        Row: {
          about_points: string[];
          created_at: string;
          duration_text: string;
          id: string;
          is_paid: boolean;
          is_published: boolean;
          original_price_paise: number | null;
          price_paise: number;
          short_description: string;
          sort_order: number;
          thumbnail_path: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          about_points?: string[];
          created_at?: string;
          duration_text?: string;
          id?: string;
          is_paid?: boolean;
          is_published?: boolean;
          original_price_paise?: number | null;
          price_paise?: number;
          short_description?: string;
          sort_order?: number;
          thumbnail_path?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          about_points?: string[];
          created_at?: string;
          duration_text?: string;
          id?: string;
          is_paid?: boolean;
          is_published?: boolean;
          original_price_paise?: number | null;
          price_paise?: number;
          short_description?: string;
          sort_order?: number;
          thumbnail_path?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          created_at: string;
          duration_seconds: number | null;
          id: string;
          kind: Database['public']['Enums']['lesson_kind'];
          notes_lesson_id: string | null;
          pdf_path: string | null;
          pdf_size_bytes: number | null;
          thumbnail_url: string | null;
          title: string;
          updated_at: string;
          youtube_video_id: string | null;
        };
        Insert: {
          created_at?: string;
          duration_seconds?: number | null;
          id?: string;
          kind: Database['public']['Enums']['lesson_kind'];
          notes_lesson_id?: string | null;
          pdf_path?: string | null;
          pdf_size_bytes?: number | null;
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string;
          youtube_video_id?: string | null;
        };
        Update: {
          created_at?: string;
          duration_seconds?: number | null;
          id?: string;
          kind?: Database['public']['Enums']['lesson_kind'];
          notes_lesson_id?: string | null;
          pdf_path?: string | null;
          pdf_size_bytes?: number | null;
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string;
          youtube_video_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lessons_notes_lesson_id_fkey';
            columns: ['notes_lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          city: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          interested_course_id: string | null;
          phone: string | null;
          profile_completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          city?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          interested_course_id?: string | null;
          phone?: string | null;
          profile_completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          city?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          interested_course_id?: string | null;
          phone?: string | null;
          profile_completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_interested_course_id_fkey';
            columns: ['interested_course_id'];
            isOneToOne: false;
            referencedRelation: 'courses';
            referencedColumns: ['id'];
          },
        ];
      };
      section_lessons: {
        Row: {
          lesson_id: string;
          position: number;
          section_id: string;
        };
        Insert: {
          lesson_id: string;
          position: number;
          section_id: string;
        };
        Update: {
          lesson_id?: string;
          position?: number;
          section_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'section_lessons_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'section_lessons_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lesson_usage';
            referencedColumns: ['lesson_id'];
          },
          {
            foreignKeyName: 'section_lessons_section_id_fkey';
            columns: ['section_id'];
            isOneToOne: false;
            referencedRelation: 'sections';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'section_lessons_section_id_fkey';
            columns: ['section_id'];
            isOneToOne: false;
            referencedRelation: 'section_usage';
            referencedColumns: ['section_id'];
          },
        ];
      };
      sections: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      staff: {
        Row: {
          added_by: string | null;
          created_at: string;
          role: Database['public']['Enums']['staff_role'];
          user_id: string;
        };
        Insert: {
          added_by?: string | null;
          created_at?: string;
          role: Database['public']['Enums']['staff_role'];
          user_id: string;
        };
        Update: {
          added_by?: string | null;
          created_at?: string;
          role?: Database['public']['Enums']['staff_role'];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      lesson_usage: {
        Row: {
          attached_to_video_count: number | null;
          lesson_id: string | null;
          section_count: number | null;
        };
        Relationships: [];
      };
      section_usage: {
        Row: {
          course_count: number | null;
          section_id: string | null;
        };
        Relationships: [];
      };
      staff_directory: {
        Row: {
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          role: Database['public']['Enums']['staff_role'] | null;
          user_id: string | null;
        };
        Relationships: [];
      };
      student_directory: {
        Row: {
          city: string | null;
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string | null;
          interested_course_id: string | null;
          interested_course_title: string | null;
          phone: string | null;
          profile_completed_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      add_staff_by_email: {
        Args: { p_email: string; p_role: Database['public']['Enums']['staff_role'] };
        Returns: {
          added_by: string | null;
          created_at: string;
          role: Database['public']['Enums']['staff_role'];
          user_id: string;
        };
      };
      admin_dashboard_stats: {
        Args: never;
        Returns: {
          courses_published: number;
          courses_total: number;
          lessons_total: number;
          students_last_7_days: number;
          students_total: number;
        }[];
      };
      attach_lesson: {
        Args: { p_lesson_id: string; p_section_id: string };
        Returns: number;
      };
      attach_lessons: {
        Args: { p_lesson_ids: string[]; p_section_id: string };
        Returns: number;
      };
      attach_section: {
        Args: { p_course_id: string; p_section_id: string };
        Returns: number;
      };
      detach_lesson: {
        Args: { p_lesson_id: string; p_section_id: string };
        Returns: undefined;
      };
      detach_section: {
        Args: { p_course_id: string; p_section_id: string };
        Returns: undefined;
      };
      remove_staff: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      reorder_course_sections: {
        Args: { p_course_id: string; p_section_ids: string[] };
        Returns: undefined;
      };
      reorder_section_lessons: {
        Args: { p_lesson_ids: string[]; p_section_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      lesson_kind: 'video' | 'pdf';
      staff_role: 'owner' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

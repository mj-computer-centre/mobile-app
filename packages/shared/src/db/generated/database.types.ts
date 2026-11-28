// Database types in the format produced by `supabase gen types typescript`.
// Regenerate after every migration:
//   pnpm dlx supabase gen types typescript --project-id <id> --schema public > packages/shared/src/db/generated/database.types.ts
// When that is not possible (no access to the project) update it by hand: it must match
// supabase/migrations exactly. Columns of functions that return a table are typed as not null
// here, as the generator does; mappers in src treat the ones that can be null as nullable.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '13';
  };
  public: {
    Tables: {
      ai_image_usage: {
        Row: {
          day: string;
          pictures: number;
        };
        Insert: {
          day: string;
          pictures?: number;
        };
        Update: {
          day?: string;
          pictures?: number;
        };
        Relationships: [];
      };
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
          play_store_url: string | null;
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
          play_store_url?: string | null;
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
          play_store_url?: string | null;
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
      test_answer_keys: {
        Row: {
          correct_option: number;
          explanation: string;
          question_id: string;
        };
        Insert: {
          correct_option: number;
          explanation?: string;
          question_id: string;
        };
        Update: {
          correct_option?: number;
          explanation?: string;
          question_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'test_answer_keys_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: true;
            referencedRelation: 'test_questions';
            referencedColumns: ['id'];
          },
        ];
      };
      test_answers: {
        Row: {
          answered_at: string;
          attempt_id: string;
          question_id: string;
          selected_option: number;
        };
        Insert: {
          answered_at?: string;
          attempt_id: string;
          question_id: string;
          selected_option: number;
        };
        Update: {
          answered_at?: string;
          attempt_id?: string;
          question_id?: string;
          selected_option?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'test_answers_attempt_id_fkey';
            columns: ['attempt_id'];
            isOneToOne: false;
            referencedRelation: 'test_attempts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'test_answers_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'test_questions';
            referencedColumns: ['id'];
          },
        ];
      };
      test_attempts: {
        Row: {
          deadline_at: string;
          id: string;
          is_late: boolean;
          started_at: string;
          submitted_at: string | null;
          test_id: string;
          user_id: string;
        };
        Insert: {
          deadline_at: string;
          id?: string;
          is_late?: boolean;
          started_at?: string;
          submitted_at?: string | null;
          test_id: string;
          user_id: string;
        };
        Update: {
          deadline_at?: string;
          id?: string;
          is_late?: boolean;
          started_at?: string;
          submitted_at?: string | null;
          test_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'test_attempts_test_id_fkey';
            columns: ['test_id'];
            isOneToOne: false;
            referencedRelation: 'tests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'test_attempts_test_id_fkey';
            columns: ['test_id'];
            isOneToOne: false;
            referencedRelation: 'test_usage';
            referencedColumns: ['test_id'];
          },
        ];
      };
      test_questions: {
        Row: {
          created_at: string;
          id: string;
          marks: number;
          options: string[];
          position: number;
          prompt: string;
          test_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          marks?: number;
          options: string[];
          position: number;
          prompt: string;
          test_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          marks?: number;
          options?: string[];
          position?: number;
          prompt?: string;
          test_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'test_questions_test_id_fkey';
            columns: ['test_id'];
            isOneToOne: false;
            referencedRelation: 'tests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'test_questions_test_id_fkey';
            columns: ['test_id'];
            isOneToOne: false;
            referencedRelation: 'test_usage';
            referencedColumns: ['test_id'];
          },
        ];
      };
      tests: {
        Row: {
          allow_late: boolean;
          course_id: string | null;
          created_at: string;
          created_by: string | null;
          description: string;
          duration_minutes: number;
          ends_at: string;
          id: string;
          is_published: boolean;
          pass_percent: number | null;
          show_review: boolean;
          starts_at: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          allow_late?: boolean;
          course_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string;
          duration_minutes: number;
          ends_at: string;
          id?: string;
          is_published?: boolean;
          pass_percent?: number | null;
          show_review?: boolean;
          starts_at: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          allow_late?: boolean;
          course_id?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string;
          duration_minutes?: number;
          ends_at?: string;
          id?: string;
          is_published?: boolean;
          pass_percent?: number | null;
          show_review?: boolean;
          starts_at?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tests_course_id_fkey';
            columns: ['course_id'];
            isOneToOne: false;
            referencedRelation: 'courses';
            referencedColumns: ['id'];
          },
        ];
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
      test_usage: {
        Row: {
          attempt_count: number | null;
          question_count: number | null;
          test_id: string | null;
          total_marks: number | null;
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
          attempts_total: number;
          courses_published: number;
          courses_total: number;
          lessons_total: number;
          students_last_7_days: number;
          students_total: number;
          tests_published: number;
          tests_total: number;
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
      delete_test_question: {
        Args: { p_question_id: string };
        Returns: undefined;
      };
      detach_lesson: {
        Args: { p_lesson_id: string; p_section_id: string };
        Returns: undefined;
      };
      detach_section: {
        Args: { p_course_id: string; p_section_id: string };
        Returns: undefined;
      };
      import_test_questions: {
        Args: { p_questions: Json; p_test_id: string };
        Returns: number;
      };
      my_tests: {
        Args: never;
        Returns: {
          allow_late: boolean;
          attempt_deadline_at: string;
          attempt_id: string;
          attempt_is_late: boolean;
          attempt_started_at: string;
          attempt_submitted_at: string;
          course_id: string;
          course_title: string;
          description: string;
          duration_minutes: number;
          ends_at: string;
          id: string;
          pass_percent: number;
          question_count: number;
          score: number;
          server_now: string;
          show_review: boolean;
          starts_at: string;
          title: string;
          total_marks: number;
        }[];
      };
      public_course_outline: {
        Args: { p_course_id: string };
        Returns: {
          duration_seconds: number;
          lesson_kind: Database['public']['Enums']['lesson_kind'];
          lesson_position: number;
          lesson_title: string;
          unit_description: string;
          unit_position: number;
          unit_title: string;
        }[];
      };
      public_site_stats: {
        Args: never;
        Returns: {
          courses: number;
          notes: number;
          tests: number;
          videos: number;
        }[];
      };
      public_upcoming_tests: {
        Args: never;
        Returns: {
          course_title: string;
          duration_minutes: number;
          ends_at: string;
          id: string;
          question_count: number;
          server_now: string;
          starts_at: string;
          title: string;
        }[];
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
      reorder_test_questions: {
        Args: { p_question_ids: string[]; p_test_id: string };
        Returns: undefined;
      };
      save_test_answers: {
        Args: { p_answers: Json; p_attempt_id: string };
        Returns: undefined;
      };
      save_test_question: {
        Args: {
          p_correct_option: number;
          p_explanation?: string;
          p_marks?: number;
          p_options: string[];
          p_prompt: string;
          p_question_id: string | null;
          p_test_id: string;
        };
        Returns: string;
      };
      start_test: {
        Args: { p_test_id: string };
        Returns: {
          deadline_at: string;
          id: string;
          is_late: boolean;
          started_at: string;
          submitted_at: string | null;
          test_id: string;
          user_id: string;
        };
      };
      submit_test: {
        Args: { p_answers?: Json; p_attempt_id: string };
        Returns: {
          deadline_at: string;
          id: string;
          is_late: boolean;
          started_at: string;
          submitted_at: string | null;
          test_id: string;
          user_id: string;
        };
      };
      test_attempt_review: {
        Args: { p_attempt_id: string };
        Returns: {
          correct_option: number;
          explanation: string;
          marks: number;
          options: string[];
          prompt: string;
          question_id: string;
          question_position: number;
          selected_option: number;
        }[];
      };
      test_attempt_summary: {
        Args: { p_attempt_id: string };
        Returns: {
          answered_count: number;
          attempt_id: string;
          correct_count: number;
          deadline_at: string;
          is_finished: boolean;
          is_late: boolean;
          question_count: number;
          rank: number;
          rank_out_of: number;
          review_available: boolean;
          score: number;
          server_now: string;
          started_at: string;
          submitted_at: string;
          test_id: string;
          time_taken_seconds: number;
          total_marks: number;
          user_id: string;
        }[];
      };
      test_results: {
        Args: { p_test_id: string };
        Returns: {
          answered_count: number;
          attempt_id: string;
          correct_count: number;
          deadline_at: string;
          email: string;
          full_name: string;
          is_finished: boolean;
          is_late: boolean;
          phone: string;
          score: number;
          started_at: string;
          submitted_at: string;
          time_taken_seconds: number;
          user_id: string;
        }[];
      };
      use_ai_image_allowance: {
        Args: never;
        Returns: number;
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

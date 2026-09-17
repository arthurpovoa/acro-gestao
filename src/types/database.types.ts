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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      charges: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          project_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          project_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "charges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          city: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          joined_at: string | null
          name: string
          notes: string | null
          source: string | null
          status: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          joined_at?: string | null
          name: string
          notes?: string | null
          source?: string | null
          status?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          joined_at?: string | null
          name?: string
          notes?: string | null
          source?: string | null
          status?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          amount: number | null
          billing_type: string
          client_id: string
          created_at: string
          due_date: string | null
          id: string
          name: string
          notes: string | null
          service: string | null
          start_date: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          billing_type: string
          client_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          name: string
          notes?: string | null
          service?: string | null
          start_date?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          billing_type?: string
          client_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          service?: string | null
          start_date?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_contracts: {
        Row: {
          client_id: string
          created_at: string
          due_day: number
          end_date: string | null
          id: string
          monthly_amount: number
          notes: string | null
          service: string | null
          start_date: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          due_day: number
          end_date?: string | null
          id?: string
          monthly_amount: number
          notes?: string | null
          service?: string | null
          start_date: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          due_day?: number
          end_date?: string | null
          id?: string
          monthly_amount?: number
          notes?: string | null
          service?: string | null
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_payments: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          id: string
          paid_at: string | null
          payment_method: string | null
          reference_month: string
          user_id: string
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          reference_month: string
          user_id: string
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          reference_month?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "recurring_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          categorias: Json
          created_at: string
          formas_pagamento: Json
          id: string
          msg_avulso_a_vencer: string
          msg_avulso_atrasado: string
          msg_mensalidade: string
          servicos_avulsos: Json
          servicos_recorrentes: Json
          user_id: string
        }
        Insert: {
          categorias?: Json
          created_at?: string
          formas_pagamento?: Json
          id?: string
          msg_avulso_a_vencer?: string
          msg_avulso_atrasado?: string
          msg_mensalidade?: string
          servicos_avulsos?: Json
          servicos_recorrentes?: Json
          user_id: string
        }
        Update: {
          categorias?: Json
          created_at?: string
          formas_pagamento?: Json
          id?: string
          msg_avulso_a_vencer?: string
          msg_avulso_atrasado?: string
          msg_mensalidade?: string
          servicos_avulsos?: Json
          servicos_recorrentes?: Json
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          notes: string | null
          payment_method: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_charges: {
        Row: {
          amount: number | null
          client_id: string | null
          client_name: string | null
          description: string | null
          dias_atraso: number | null
          due_date: string | null
          id: string | null
          paid_at: string | null
          payment_method: string | null
          project_id: string | null
          project_name: string | null
          status: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      v_clients: {
        Row: {
          city: string | null
          contact_name: string | null
          em_aberto: number | null
          email: string | null
          id: string | null
          joined_at: string | null
          mensalidade_ativa: boolean | null
          name: string | null
          notes: string | null
          qtd_projetos_avulsos: number | null
          recebido_total: number | null
          source: string | null
          status: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Relationships: []
      }
      v_contract_totals: {
        Row: {
          contract_id: string | null
          recebido_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "recurring_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "v_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      v_contracts: {
        Row: {
          client_id: string | null
          client_name: string | null
          due_day: number | null
          end_date: string | null
          id: string | null
          meses_em_aberto: number | null
          monthly_amount: number | null
          recebido_total: number | null
          service: string | null
          situacao: string | null
          start_date: string | null
          user_id: string | null
          valor_em_aberto: number | null
          whatsapp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      v_project_totals: {
        Row: {
          project_id: string | null
          total_lancado: number | null
          total_recebido: number | null
        }
        Relationships: [
          {
            foreignKeyName: "charges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "v_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      v_projects: {
        Row: {
          amount: number | null
          billing_type: string | null
          client_id: string | null
          client_name: string | null
          due_date: string | null
          id: string | null
          name: string | null
          notes: string | null
          percentual_recebido: number | null
          saldo: number | null
          service: string | null
          start_date: string | null
          status: string | null
          total_lancado: number | null
          total_recebido: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      contract_months: {
        Args: { p_year: number }
        Returns: {
          contract_id: string
          due_date: string
          month: number
          reference_month: string
          status: string
          valor_pago: number
        }[]
      }
      dashboard: { Args: { p_year: number }; Returns: Json }
      f_contract_aberto: {
        Args: { p_contract_id: string }
        Returns: {
          meses_em_aberto: number
          valor_em_aberto: number
        }[]
      }
      f_contract_month_status: {
        Args: {
          p_due_date: string
          p_end_date: string
          p_monthly_amount: number
          p_start_date: string
          p_valor_pago: number
        }
        Returns: string
      }
      f_month_due_date: {
        Args: { p_due_day: number; p_month: number; p_year: number }
        Returns: string
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

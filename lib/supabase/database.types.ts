export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category_id: string | null;
          price_cents: number;
          compare_at_price_cents: number | null;
          short_description: string | null;
          description: string | null;
          sku: string | null;
          inventory_quantity: number;
          availability_status: "in_stock" | "sold_out" | "coming_soon";
          featured: boolean;
          status: Database["public"]["Enums"]["product_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category_id?: string | null;
          price_cents: number;
          compare_at_price_cents?: number | null;
          short_description?: string | null;
          description?: string | null;
          sku?: string | null;
          inventory_quantity?: number;
          availability_status?: "in_stock" | "sold_out" | "coming_soon";
          featured?: boolean;
          status?: Database["public"]["Enums"]["product_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          sku: string | null;
          inventory_quantity: number;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          sku?: string | null;
          inventory_quantity?: number;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      homepage_sections: {
        Row: {
          id: string;
          key: string;
          section_type: string;
          eyebrow: string | null;
          heading: string | null;
          body: string | null;
          cta_label: string | null;
          cta_href: string | null;
          image_path: string | null;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          section_type: string;
          eyebrow?: string | null;
          heading?: string | null;
          body?: string | null;
          cta_label?: string | null;
          cta_href?: string | null;
          image_path?: string | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["homepage_sections"]["Insert"]>;
        Relationships: [];
      };
      homepage_section_items: {
        Row: {
          id: string;
          section_id: string;
          key: string;
          eyebrow: string | null;
          title: string;
          subtitle: string | null;
          cta_label: string | null;
          cta_href: string | null;
          image_path: string | null;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          key: string;
          eyebrow?: string | null;
          title: string;
          subtitle?: string | null;
          cta_label?: string | null;
          cta_href?: string | null;
          image_path?: string | null;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["homepage_section_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "homepage_section_items_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "homepage_sections";
            referencedColumns: ["id"];
          },
        ];
      };
      staff_profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          role: Database["public"]["Enums"]["staff_role"];
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          role?: Database["public"]["Enums"]["staff_role"];
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["staff_profiles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      product_status: "draft" | "published" | "archived";
      staff_role: "owner" | "admin" | "editor";
      availability_status: "in_stock" | "sold_out" | "coming_soon";
    };
    CompositeTypes: Record<string, never>;
  };
};
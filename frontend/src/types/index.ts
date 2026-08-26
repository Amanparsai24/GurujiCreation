export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  created_at: string;
}

export interface Category {
  id: number;
  uuid?: string;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  parent_id?: number | null;
  status?: string;
  is_featured?: boolean;
  children?: Category[];
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size?: string;
  material?: string;
  additional_price: number;
  stock: number;
}

export interface Product {
  id: number;
  uuid?: string;
  category_id: number;
  name: string;
  description: string;
  base_price: string;
  customizable: boolean;
  image?: string;
  status: string;
  sku?: string;
  stock_quantity?: number;
  discount_price?: string;
  video_url?: string;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface Design {
  id?: number;
  user_id?: number;
  product_id: number;
  canvas_data: any;
  preview_image_url?: string;
  status: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  design_id?: number;
  quantity: number;
  price: string;
  product?: Product;
}

export interface Order {
  id: number;
  user_id?: number;
  total_amount: string;
  shipping_address: string;
  status: string;
  payment_status: string;
  payment_proof_url?: string;
  created_at: string;
  items?: OrderItem[];
  user?: User;
}

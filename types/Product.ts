import { ProductCategory } from "./ProductCategory";
export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    vendor: string;
    category: ProductCategory;
    imageUrl: string;    
    isActive: boolean;
    stock: number;
  }

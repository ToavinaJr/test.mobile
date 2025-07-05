// schemas/product/product-add.schema.ts
import { z } from 'zod';
import { ProductCategory } from '@/types/ProductCategory'; // Importez votre enum

export const addProductSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom du produit doit contenir au moins 2 caractères.")
    .max(100, "Le nom du produit ne doit pas dépasser 100 caractères.")
    .nonempty("Le nom du produit est requis.")
    .regex(/^[a-zA-Z0-9\s]+$/, "Le nom du produit ne doit pas contenir de caractères spéciaux."),

  description: z
    .string()
    .max(500, "La description ne doit pas dépasser 500 caractères.")
    .nonempty("La description du produit est requise."),

  price: z
    .number({
      invalid_type_error: "Le prix doit être un nombre.",
    })
    .positive("Le prix doit être un nombre positif."),

  stock: z
    .number({
      invalid_type_error: "Le stock doit être un nombre entier.",
    })
    .int("Le stock doit être un nombre entier.")
    .min(0, "Le stock ne peut pas être négatif."),

  vendor: z
    .string()
    .max(50, "Le nom du vendeur ne doit pas dépasser 50 caractères.")
    .nonempty("Le vendeur est requis."),

  category: z
    .string()
    .nonempty("La catégorie est requise.") 
    .pipe(z.nativeEnum(ProductCategory, {
      invalid_type_error: "La catégorie sélectionnée n'est pas valide."
    })),

  imageUrl: z
    .string()
    .nonempty("Une image est requise pour le produit."),

  isActive: z.boolean(),
});

export type AddProductFormInput = z.infer<typeof addProductSchema>;

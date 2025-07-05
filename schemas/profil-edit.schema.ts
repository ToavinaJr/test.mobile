import { z } from 'zod';

export const editProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(50, "Le nom ne doit pas dépasser 50 caractères.")
    .nonempty("Le nom est requis.")
    .regex(/^[a-zA-Z0-9\s]+$/, "Le nom ne doit pas contenir de caractères spéciaux."),
  email: z
    .string()
    .email("Veuillez entrer une adresse email valide.")
    .nonempty("L'email est requis."),
});

export type EditProfileFormInput = z.infer<typeof editProfileSchema>;

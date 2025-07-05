import { z } from 'zod';

export const signInSchema = z.object({
  email: z
    .string()
    .email("Veuillez entrer une adresse email valide.")
    .nonempty("L'email est requis."),
  password: z
  .string()
  .min(6, "Le mot de passe doit contenir au moins 6 caractères.")
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule.")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre.")
  .nonempty("Le mot de passe est requis."),
});

export type SignInFormInput = z.infer<typeof signInSchema>;
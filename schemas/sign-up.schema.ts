import { z } from "zod";

export const signUpFieldSchemas = {
  name: z
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères.")
    .nonempty("Le nom est requis."),
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
  confirmPassword: z.string().nonempty("Veuillez confirmer votre mot de passe."),
} as const;

const baseSignUpSchema = z.object(signUpFieldSchemas);

export const signUpSchema = baseSignUpSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  }
);

export type SignUpFormInput = z.infer<typeof baseSignUpSchema>;

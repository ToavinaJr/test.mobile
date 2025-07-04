import { z } from "zod";

<<<<<<< HEAD
=======
/* ─────────── SCHÉMAS DE CHAMP ─────────── */
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
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

<<<<<<< HEAD
const baseSignUpSchema = z.object(signUpFieldSchemas);

=======
/* ─────────── BASE (ZodObject) ─────────── */
const baseSignUpSchema = z.object(signUpFieldSchemas);

/* ─────────── SCHÉMA FINAL (ZodEffects) ─────────── */
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec
export const signUpSchema = baseSignUpSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  }
);

<<<<<<< HEAD
export type SignUpFormInput = z.infer<typeof baseSignUpSchema>;
=======
export type SignUpFormInput = z.infer<typeof baseSignUpSchema>;
>>>>>>> 2a4e9a485be7f9d00d276af3916835e61861d3ec

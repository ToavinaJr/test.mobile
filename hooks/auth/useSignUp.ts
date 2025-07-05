import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  SignUpFormInput,
  signUpFieldSchemas,
  signUpSchema,
} from "@/schemas/auth/auth-sign-up.schema";
import { signUpUser, clearAuthError, clearSignUpSuccess } from "@/store/auth-slice";
import { AppDispatch, RootState } from "@/store";
import { Keyboard } from 'react-native';

type FieldStatus = string | null | boolean;
type FormErrors = Record<keyof SignUpFormInput, FieldStatus>;

export const useSignUp = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSigningUp, signUpError, signUpSuccess } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState<SignUpFormInput>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Nettoie toutes les erreurs d'authentification précédentes et les indicateurs de succès
    // lors du montage du composant, garantissant un état propre pour une nouvelle inscription.
    dispatch(clearAuthError());
    dispatch(clearSignUpSuccess());
  }, [dispatch]);

  // Cette fonction `validateField` est une fonction de validation réutilisable
  // pour chaque champ individuel du formulaire d'inscription. Elle utilise les
  // schémas Zod définis dans `signUpFieldSchemas` pour valider chaque champ.
  // Un cas spécial est géré pour `confirmPassword` afin de s'assurer qu'il correspond
  // au champ `password` actuel du formulaire.
  const validateField = useCallback(
    (
      field: keyof SignUpFormInput,
      value: string,
      currentForm: SignUpFormInput
    ): string | null => {
      const check = signUpFieldSchemas[field].safeParse(value);
      if (!check.success) return check.error.errors[0].message;

      if (field === "confirmPassword" && value !== currentForm.password) {
        return "Les mots de passe ne correspondent pas.";
      }
      return null;
    },
    []
  );

  // La fonction `handleChange` est un gestionnaire générique pour la mise à jour
  // des champs du formulaire et la validation en temps réel.
  // Elle utilise une closure pour savoir quel champ est mis à jour.
  // Après la mise à jour du `form` et l'exécution de la validation du champ en cours,
  // elle vérifie également si `confirmPassword` doit être revalidé si le `password`
  // a changé, ou vice-versa, afin de maintenir la cohérence des messages d'erreur.
  const handleChange = useCallback(
    (field: keyof SignUpFormInput) => (value: string) => {
      const newForm = { ...form, [field]: value };
      setForm(newForm);

      const fieldError = validateField(field, value, newForm);

      const newErrors: FormErrors = { ...errors, [field]: fieldError };

      // Logique pour revalider `confirmPassword` si `password` change et vice-versa.
      // Cela assure que le message "Les mots de passe ne correspondent pas"
      // est mis à jour dynamiquement.
      if (field === "password" && newForm.confirmPassword !== "") {
        newErrors.confirmPassword = validateField(
          "confirmPassword",
          newForm.confirmPassword,
          newForm
        );
      } else if (field === "confirmPassword" && newForm.password !== "") {
        newErrors.confirmPassword = validateField(
          "confirmPassword",
          newForm.confirmPassword,
          newForm
        );
      }

      setErrors(newErrors);
      dispatch(clearAuthError()); // Efface les erreurs globales lors de la saisie.
    },
    [form, errors, validateField, dispatch]
  );

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  // La fonction `handleSubmit` gère la soumission finale du formulaire d'inscription.
  // Elle effectue une validation complète du schéma Zod pour tout le formulaire.
  // Si la validation échoue, elle met à jour les erreurs spécifiques pour chaque champ.
  // Si la validation réussit, elle dispatche l'action `signUpUser` de Redux.
  // Elle gère également les résultats de l'action Redux, qu'elle soit réussie ou rejetée.
  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    dispatch(clearAuthError());
    dispatch(clearSignUpSuccess());

    // Valide l'intégralité du formulaire contre le `signUpSchema` de Zod.
    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      const finalErrs: FormErrors = { ...errors };
      // Parcours les erreurs de validation Zod et met à jour l'état `errors`
      // pour afficher les messages spécifiques à chaque champ invalide.
      parsed.error.errors.forEach((e) => {
        finalErrs[e.path[0] as keyof SignUpFormInput] = e.message;
      });
      setErrors(finalErrs);
      return { success: false, error: "Veuillez corriger les champs en rouge." };
    }

    // Dispatche l'action asynchrone d'inscription de l'utilisateur.
    const resultAction = await dispatch(signUpUser(form));

    // Vérifie si l'action `signUpUser` a été rejetée (échec de l'inscription).
    if (signUpUser.rejected.match(resultAction)) {
      return { success: false, error: signUpError };
    }
    return { success: true };

  }, [form, errors, dispatch, signUpError]);

  return {
    form,
    errors,
    showPassword,
    showConfirmPassword,
    isSigningUp,
    signUpError,
    signUpSuccess,
    handleChange,
    toggleShowPassword,
    toggleShowConfirmPassword,
    handleSubmit,
  };
};
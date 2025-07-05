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
    dispatch(clearAuthError());
    dispatch(clearSignUpSuccess());
  }, [dispatch]);

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

  const handleChange = useCallback(
    (field: keyof SignUpFormInput) => (value: string) => {
      const newForm = { ...form, [field]: value };
      setForm(newForm);

      const fieldError = validateField(field, value, newForm);

      const newErrors: FormErrors = { ...errors, [field]: fieldError };

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
      dispatch(clearAuthError());
    },
    [form, errors, validateField, dispatch]
  );

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    dispatch(clearAuthError());
    dispatch(clearSignUpSuccess());

    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      const finalErrs: FormErrors = { ...errors };
      parsed.error.errors.forEach((e) => {
        finalErrs[e.path[0] as keyof SignUpFormInput] = e.message;
      });
      setErrors(finalErrs);
      return { success: false, error: "Veuillez corriger les champs en rouge." };
    }

    const resultAction = await dispatch(signUpUser(form));

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
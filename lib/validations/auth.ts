import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("כתובת מייל לא תקינה"),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const patientRegisterSchema = z
  .object({
    fullName: z.string().min(2, "שדה חובה"),
    email: z.string().email("כתובת מייל לא תקינה"),
    password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

export type PatientRegisterValues = z.infer<typeof patientRegisterSchema>;

export const practitionerRegisterSchema = z
  .object({
    fullName: z.string().min(2, "שדה חובה"),
    email: z.string().email("כתובת מייל לא תקינה"),
    password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
    confirmPassword: z.string(),
    phone: z.string().min(9, "מספר טלפון לא תקין"),
    gender: z.enum(["male", "female", "other"], { message: "יש לבחור מגדר" }),
    cities: z.array(z.string().min(1)).min(1, "יש לבחור לפחות מיקום קליניקה אחד"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

export type PractitionerRegisterValues = z.infer<typeof practitionerRegisterSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("כתובת מייל לא תקינה"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

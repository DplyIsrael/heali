import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("כתובת מייל לא תקינה"),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const patientRegisterSchema = z
  .object({
    fullName: z.string().trim().min(2, "שדה חובה").max(80, "שם ארוך מדי"),
    email: z.string().email("כתובת מייל לא תקינה"),
    password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים").max(72, "סיסמה ארוכה מדי"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

export type PatientRegisterValues = z.infer<typeof patientRegisterSchema>;

export const clinicAddressSchema = z.object({
  city: z.string().min(1, "יש לבחור עיר"),
  street: z.string().min(1, "יש להזין כתובת"),
});

export type ClinicAddress = z.infer<typeof clinicAddressSchema>;

export const practitionerRegisterSchema = z
  .object({
    fullName: z.string().trim().min(2, "שדה חובה").max(80, "שם ארוך מדי"),
    email: z.string().email("כתובת מייל לא תקינה"),
    password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים").max(72, "סיסמה ארוכה מדי"),
    confirmPassword: z.string(),
    phone: z.string().min(9, "מספר טלפון לא תקין"),
    gender: z.enum(["male", "female", "other"], { message: "יש לבחור מגדר" }),
    clinicAddresses: z.array(clinicAddressSchema),
    homeVisits: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  })
  .refine((data) => data.clinicAddresses.length > 0 || data.homeVisits, {
    message: "יש להוסיף לפחות מיקום קליניקה אחד או לסמן הגעה לבית הלקוח",
    path: ["clinicAddresses"],
  });

export type PractitionerRegisterValues = z.infer<typeof practitionerRegisterSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("כתובת מייל לא תקינה"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים").max(72, "סיסמה ארוכה מדי"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

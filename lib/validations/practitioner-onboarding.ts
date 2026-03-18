import { z } from "zod";

export const treatmentDomainsSchema = z.object({
  domainIds: z.array(z.string().uuid()).min(1, "יש לבחור לפחות תחום טיפול אחד"),
});

export type TreatmentDomainsValues = z.infer<typeof treatmentDomainsSchema>;

export const specialtiesSchema = z.object({
  specialtyIds: z.array(z.string().uuid()).min(1, "יש לבחור לפחות התמחות אחת"),
});

export type SpecialtiesValues = z.infer<typeof specialtiesSchema>;

export const pricingSchema = z.object({
  pricingModel: z.enum(["per_treatment", "per_hour", "per_package"], {
    error: "יש לבחור מודל תמחור",
  }),
  price: z.string().min(1, "שדה חובה").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    { message: "יש להזין מחיר תקין" }
  ),
});

export type PricingValues = z.infer<typeof pricingSchema>;

export const languagesSchema = z.object({
  languages: z.array(z.string()).min(1, "יש לבחור לפחות שפה אחת"),
});

export type LanguagesValues = z.infer<typeof languagesSchema>;

export const bioSchema = z.object({
  bio: z.string().min(50, "הביוגרפיה חייבת להכיל לפחות 50 תווים"),
  certificationDescription: z.string().optional(),
});

export type BioValues = z.infer<typeof bioSchema>;

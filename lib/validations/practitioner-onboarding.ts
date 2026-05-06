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
  pricingModel: z.enum(["per_treatment", "per_heali_package"], {
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

// Israeli mobile/landline without the leading 0. The +972 prefix is appended
// at submit time in the step component, so this only validates the local part.
const israeliLocalPhone = z
  .string()
  .min(1, "שדה חובה")
  .regex(/^[2-9]\d{8}$/, "מספר טלפון לא תקין");

export const clientInvoiceSlotSchema = z.object({
  fileUrl: z.string().url("יש להעלות קובץ"),
  fileName: z.string().min(1),
  clientName: z.string().min(1, "שדה חובה"),
  clientPhone: israeliLocalPhone,
});

export const clientInvoicesSchema = z.object({
  invoices: z.array(clientInvoiceSlotSchema).length(5, "יש להעלות 5 חשבוניות"),
});

export type ClientInvoiceSlot = z.infer<typeof clientInvoiceSlotSchema>;

export const bioSchema = z.object({
  bio: z.string().min(50, "הביוגרפיה חייבת להכיל לפחות 50 תווים"),
  certificationDescription: z.string().min(1, "שדה חובה"),
});

export type BioValues = z.infer<typeof bioSchema>;

import { z } from "zod";

export const personalDetailsSchema = z.object({
  fullName: z.string().min(2, "שדה חובה"),
  dateOfBirth: z.string().min(1, "שדה חובה"),
  gender: z.enum(["male", "female", "other"], {
    error: "יש לבחור מגדר",
  }),
  city: z.string().min(1, "שדה חובה"),
  phone: z.string().min(9, "מספר טלפון לא תקין"),
});

export type PersonalDetailsValues = z.infer<typeof personalDetailsSchema>;

export const questionnaireSchema = z.object({
  responses: z.record(z.string(), z.string()).refine(
    (val) => Object.keys(val).length > 0,
    { message: "יש לענות על לפחות שאלה אחת" }
  ),
});

export type QuestionnaireValues = z.infer<typeof questionnaireSchema>;

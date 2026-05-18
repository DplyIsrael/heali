"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { AuthLayout } from "@/components/shared/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import {
  practitionerRegisterSchema,
  type PractitionerRegisterValues,
} from "@/lib/validations/auth";
import { signUpPractitioner } from "../../auth/actions";

type ClinicAddress = { city: string; street: string };

// Israeli cities list for autocomplete
const ISRAEL_CITIES = [
  "תל אביב", "ירושלים", "חיפה", "ראשון לציון", "פתח תקווה", "אשדוד", "נתניה",
  "באר שבע", "בני ברק", "חולון", "רמת גן", "אשקלון", "רחובות", "בת ים", "הרצליה",
  "כפר סבא", "מודיעין", "רעננה", "הוד השרון", "רמלה", "לוד", "נצרת", "עפולה",
  "נהריה", "עכו", "קריית אתא", "קריית גת", "קריית מוצקין", "קריית ים", "קריית ביאליק",
  "אילת", "טבריה", "צפת", "כרמיאל", "עראבה", "אום אל-פחם", "סח׳נין", "טירה",
  "טייבה", "קלנסוה", "באקה אל-גרביה", "רהט", "דימונה", "ערד", "יקנעם", "מגדל העמק",
  "אור יהודה", "גבעתיים", "נשר", "טירת כרמל", "יבנה", "אור עקיבא", "קיסריה",
  "גבעת שמואל", "פרדס חנה-כרכור", "זכרון יעקב", "בנימינה", "חדרה", "שדרות",
  "קריית שמונה", "מעלות-תרשיחא", "מעלה אדומים", "ביתר עילית", "אלעד", "גבעת זאב",
  "בית שמש", "ראש העין", "שוהם", "גני תקווה", "קדימה-צורן", "כפר יונה",
  "נס ציונה", "גדרה", "קריית מלאכי", "עתלית", "זכרון", "פוריידיס",
];

const GENDER_OPTIONS = [
  { value: "male", label: "זכר" },
  { value: "female", label: "נקבה" },
  { value: "other", label: "אחר" },
];

export default function PractitionerRegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [canResume, setCanResume] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Clinic addresses state — multiple clinics, each with city + street
  const [addresses, setAddresses] = useState<ClinicAddress[]>([{ city: "", street: "" }]);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [homeVisits, setHomeVisits] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PractitionerRegisterValues>({
    resolver: zodResolver(practitionerRegisterSchema),
    defaultValues: { clinicAddresses: [{ city: "", street: "" }], homeVisits: false },
  });

  // Sync addresses state with form
  useEffect(() => {
    const valid = addresses.filter((a) => a.city.trim() && a.street.trim());
    setValue("clinicAddresses", valid, { shouldValidate: valid.length > 0 || homeVisits });
  }, [addresses, homeVisits, setValue]);

  useEffect(() => {
    setValue("homeVisits", homeVisits);
  }, [homeVisits, setValue]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateAddress = (index: number, patch: Partial<ClinicAddress>) => {
    setAddresses((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  };

  const addClinic = () => {
    setAddresses((prev) => [...prev, { city: "", street: "" }]);
  };

  const removeClinic = (index: number) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  const getCityResults = (input: string, currentIndex: number) => {
    if (!input.trim()) return [];
    const selectedCities = addresses
      .filter((_, i) => i !== currentIndex)
      .map((a) => a.city);
    return ISRAEL_CITIES.filter(
      (c) => c.includes(input) && !selectedCities.includes(c)
    ).slice(0, 8);
  };

  const selectedGender = watch("gender");

  const onSubmit = async (values: PractitionerRegisterValues) => {
    setIsLoading(true);
    setServerError("");
    setCanResume(false);

    const result = await signUpPractitioner(
      values.fullName,
      values.email,
      values.password,
      values.phone,
      values.clinicAddresses,
      values.homeVisits,
      values.gender
    );

    if (result.success) {
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } else {
      setServerError(result.error ?? "שגיאה לא צפויה");
      setCanResume(result.canResume ?? false);
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout progress={25}>
      <h1 className="text-[32px] md:text-[40px] font-semibold leading-tight text-foreground">
        שמחים שבחרת להצטרף אלינו!
      </h1>
      <p className="mt-2 text-[16px] md:text-[18px] font-light text-[#666]">
        זה יכול להיות מגע, איזון, או רגע אחד של שקט באמצע כל הרעש
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <FormField label="שם מלא" htmlFor="fullName" error={errors.fullName?.message} required>
          <Input id="fullName" placeholder="הקלד/י כאן..." {...register("fullName")} aria-invalid={!!errors.fullName} />
        </FormField>

        <FormField label="כתובת מייל" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" placeholder="הקלד/י כאן את כתובת המייל שלך" {...register("email")} aria-invalid={!!errors.email} />
        </FormField>

        <FormField label="סיסמה" htmlFor="password" error={errors.password?.message} required>
          <Input id="password" type="password" placeholder="הקלד/י כאן..." {...register("password")} aria-invalid={!!errors.password} />
        </FormField>

        <FormField label="אישור סיסמה" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
          <Input id="confirmPassword" type="password" placeholder="הקלד/י כאן..." {...register("confirmPassword")} aria-invalid={!!errors.confirmPassword} />
        </FormField>

        <FormField label="מספר נייד" htmlFor="phone" error={errors.phone?.message} required>
          <Input id="phone" type="tel" placeholder="הקלד/י כאן..." {...register("phone")} aria-invalid={!!errors.phone} />
        </FormField>

        {/* Gender */}
        <FormField label="מגדר" htmlFor="gender" error={errors.gender?.message} required>
          <div className="flex gap-3">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("gender", opt.value as "male" | "female" | "other", { shouldValidate: true })}
                className={`flex-1 rounded-[10px] border px-4 py-3 text-[15px] transition-colors ${
                  selectedGender === opt.value
                    ? "border-primary bg-primary/5 font-medium text-primary"
                    : "border-border-input bg-white text-foreground hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FormField>

        {/* Clinic addresses — multiple clinics, each with city + street */}
        <FormField
          label="מיקום קליניקה"
          htmlFor="clinic-0-city"
          error={errors.clinicAddresses?.message}
        >
          <div ref={dropdownRef} className="flex flex-col gap-3">
            {addresses.map((addr, index) => {
              const results = getCityResults(addr.city, index);
              const showDropdown = activeDropdown === index && results.length > 0;
              return (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-[12px] border border-border-input bg-white p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-muted-foreground">
                      קליניקה {index + 1}
                    </span>
                    {addresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeClinic(index)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="הסר קליניקה"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Input
                      id={`clinic-${index}-city`}
                      value={addr.city}
                      onChange={(e) => {
                        updateAddress(index, { city: e.target.value });
                        setActiveDropdown(index);
                      }}
                      onFocus={() => setActiveDropdown(index)}
                      placeholder="עיר"
                      autoComplete="off"
                    />
                    {showDropdown && (
                      <div className="absolute z-20 top-full mt-1 w-full bg-white border border-border rounded-[10px] shadow-lg max-h-[200px] overflow-y-auto">
                        {results.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              updateAddress(index, { city });
                              setActiveDropdown(null);
                            }}
                            className="w-full text-right px-4 py-2.5 text-[14px] hover:bg-muted/10 transition-colors"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Input
                    value={addr.street}
                    onChange={(e) => updateAddress(index, { street: e.target.value })}
                    placeholder="רחוב ומספר"
                    autoComplete="off"
                  />
                </div>
              );
            })}

            <button
              type="button"
              onClick={addClinic}
              className="flex items-center justify-center gap-2 rounded-[10px] border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-[14px] font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="size-4" />
              הוסף קליניקה נוספת
            </button>

            <label className="flex items-center gap-3 rounded-[10px] border border-border-input bg-white px-4 py-3 cursor-pointer hover:border-primary/40 transition-colors">
              <input
                type="checkbox"
                checked={homeVisits}
                onChange={(e) => setHomeVisits(e.target.checked)}
                className="size-4 accent-primary"
              />
              <span className="text-[14px] text-foreground">הגעה לבית הלקוח</span>
            </label>
          </div>
        </FormField>

        {serverError && (
          <div className="flex flex-col gap-2">
            <p className="text-[14px] text-destructive">{serverError}</p>
            {canResume && (
              <Button
                type="button"
                variant="secondary"
                className="w-full bg-accent/10 text-primary border border-primary/20"
                onClick={() => router.push("/login")}
              >
                התחבר והמשך הרשמה
              </Button>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <Spinner size="sm" className="border-white/30 border-t-white" />
            ) : (
              "המשך"
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="bg-[#F4F7F7]"
            onClick={() => router.push("/register")}
          >
            חזור
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

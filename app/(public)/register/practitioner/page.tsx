"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
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

  // City autocomplete state
  const [cities, setCities] = useState<string[]>([]);
  const [cityInput, setCityInput] = useState("");
  const [cityResults, setCityResults] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PractitionerRegisterValues>({
    resolver: zodResolver(practitionerRegisterSchema),
    defaultValues: { cities: [] },
  });

  // Sync cities state with form
  useEffect(() => {
    setValue("cities", cities, { shouldValidate: cities.length > 0 });
  }, [cities, setValue]);

  // Filter cities based on input
  useEffect(() => {
    if (cityInput.length >= 1) {
      const filtered = ISRAEL_CITIES.filter(
        (c) => c.includes(cityInput) && !cities.includes(c)
      ).slice(0, 8);
      setCityResults(filtered);
      setShowCityDropdown(filtered.length > 0);
    } else {
      setCityResults([]);
      setShowCityDropdown(false);
    }
  }, [cityInput, cities]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addCity = (city: string) => {
    if (!cities.includes(city)) {
      setCities((prev) => [...prev, city]);
    }
    setCityInput("");
    setShowCityDropdown(false);
  };

  const removeCity = (city: string) => {
    setCities((prev) => prev.filter((c) => c !== city));
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
      values.cities,
      values.gender
    );

    if (result.success) {
      router.push("/verify-email");
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

        {/* Clinic cities — multi-select autocomplete */}
        <FormField label="מיקום קליניקה" htmlFor="city" error={errors.cities?.message} required>
          <div ref={cityRef} className="relative">
            {/* Selected cities chips */}
            {cities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {cities.map((city) => (
                  <span
                    key={city}
                    className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-[13px]"
                  >
                    {city}
                    <button type="button" onClick={() => removeCity(city)} className="hover:text-destructive">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input */}
            <Input
              id="city"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && cityInput.trim()) {
                  e.preventDefault();
                  addCity(cityInput.trim());
                }
              }}
              placeholder="התחל/י להקליד שם עיר ובחר/י מהרשימה..."
              autoComplete="off"
            />

            {/* Autocomplete dropdown */}
            {showCityDropdown && (
              <div className="absolute z-20 top-full mt-1 w-full bg-white border border-border rounded-[10px] shadow-lg max-h-[200px] overflow-y-auto">
                {cityResults.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => addCity(city)}
                    className="w-full text-right px-4 py-2.5 text-[14px] hover:bg-muted/10 transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
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

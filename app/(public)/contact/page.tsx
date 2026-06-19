"use client";

import { useState } from "react";
import { Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";
import { sendContactMessage } from "./actions";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    const result = await sendContactMessage({ name, phone, email, message });
    if (result.success) {
      toast.success("ההודעה נשלחה בהצלחה!");
      setName(""); setPhone(""); setEmail(""); setMessage("");
    } else {
      toast.error(result.error ?? "שגיאה בשליחת ההודעה");
    }
    setIsSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-10 md:py-16">
        {/* Header text */}
        <div className="mb-10 text-right">
          <h1 className="text-[40px] md:text-[60px] lg:text-[70px] font-bold text-black leading-[1.1]">
            יצירת קשר
          </h1>
          <p className="mt-3 text-[28px] md:text-[40px] font-light text-black">
            אנחנו מאמינים בתקשורת פתוחה
          </p>
          <p className="mt-2 text-[16px] md:text-[18px] text-muted-foreground">
            מוזמנים ליצור קשר בכל נושא
          </p>
        </div>

        {/* Contact methods */}
        <div className="flex flex-wrap gap-3 mb-10">
          <a
            href="tel:054-8411474"
            className="flex items-center gap-2 h-[44px] px-5 rounded-full border border-border bg-white text-[16px] text-black hover:bg-muted/10 transition-colors"
          >
            <Phone className="size-4" />
            054-8411474
          </a>
          <a
            href="mailto:info@heali.co.il"
            className="flex items-center gap-2 h-[44px] px-5 rounded-full border border-border bg-white text-[16px] text-black hover:bg-muted/10 transition-colors"
          >
            <Mail className="size-4" />
            info@heali.co.il
          </a>
          <a
            href="https://wa.me/972512727631"
            target="_blank"
            className="flex items-center gap-2 h-[44px] px-5 rounded-full border border-border bg-white text-[16px] text-black hover:bg-muted/10 transition-colors"
          >
            <WhatsAppIcon className="size-4" />
            0503-822282
          </a>
        </div>

        {/* Contact form */}
        <div className="max-w-[600px]">
          <div className="rounded-[20px] bg-white border border-border shadow-sm p-6 md:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <FormField label="שם מלא" htmlFor="contactName" required>
                <Input
                  id="contactName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="הקלד/י כאן..."
                  required
                />
              </FormField>

              <FormField label="טלפון" htmlFor="contactPhone" required>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="הקלד/י כאן..."
                  required
                />
              </FormField>

              <FormField label="אימייל" htmlFor="contactEmail" required>
                <Input
                  id="contactEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="הקלד/י כאן..."
                  required
                />
              </FormField>

              <FormField label="הודעה" htmlFor="contactMessage" required>
                <textarea
                  id="contactMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="הקלד/י כאן..."
                  required
                  className="min-h-[141px] w-full rounded-[10px] border border-border-input bg-white px-3 py-2 text-[14px] resize-none"
                />
              </FormField>

              <Button
                type="submit"
                disabled={isSending}
                className="w-full h-[48px] rounded-full bg-accent text-black text-[16px]"
              >
                {isSending ? "שולח..." : "שליחה"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

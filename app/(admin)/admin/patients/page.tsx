"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

interface Patient {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("id, full_name, email, created_at")
        .eq("role", "patient")
        .order("created_at", { ascending: false });

      setPatients((data ?? []).map((u) => ({
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        createdAt: u.created_at,
      })));
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = patients.filter((p) =>
    !search || p.fullName.includes(search) || p.email.includes(search)
  );

  return (
    <div>
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-6">ניהול מטופלים</h1>

      <div className="relative max-w-[400px] mb-6">
        <Search className="absolute top-1/2 right-3 -translate-y-1/2 size-[18px] text-muted" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש..." className="pe-10 h-[50px]" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <div className="rounded-[12px] border border-border bg-white overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-border text-[13px] text-muted">
                <th className="text-right py-3 px-4 font-medium">שם</th>
                <th className="text-right py-3 px-4 font-medium">אימייל</th>
                <th className="text-right py-3 px-4 font-medium">תאריך הצטרפות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/5" onClick={() => window.location.href = `/admin/patients/${p.id}`}>
                  <td className="py-3 px-4 text-black font-medium text-primary underline">{p.fullName}</td>
                  <td className="py-3 px-4 text-muted">{p.email}</td>
                  <td className="py-3 px-4 text-muted">{new Date(p.createdAt).toLocaleDateString("he-IL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

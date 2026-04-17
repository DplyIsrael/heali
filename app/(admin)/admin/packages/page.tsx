"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ThreeDotsMenu } from "@/components/shared/three-dots-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const GRADIENTS: Record<string, string> = {
  teal: "from-[#21544E] to-[#2d7a6f]",
  green: "from-[#166534] to-[#22c55e]",
  purple: "from-[#581c87] to-[#a855f7]",
  orange: "from-[#9a3412] to-[#f97316]",
};
const THEMES = Object.keys(GRADIENTS);

interface Pkg { id: string; name: string; description: string; numTreatments: number; pricePerTreatment: number; gradientTheme: string; }

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [num, setNum] = useState("5");
  const [price, setPrice] = useState("100");
  const [theme, setTheme] = useState("teal");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("treatment_packages").select("*").order("created_at", { ascending: false });
    setPackages((data ?? []).map((p) => ({
      id: p.id, name: p.name, description: p.description ?? "", numTreatments: p.num_treatments,
      pricePerTreatment: Number(p.price_per_treatment), gradientTheme: p.gradient_theme,
    })));
    setIsLoading(false);
  };

  useEffect(() => { void loadData(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("יש להזין שם חבילה"); return; }
    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("treatment_packages").insert({
      name, description: desc || null, num_treatments: Number(num) || 5,
      price_per_treatment: price, gradient_theme: theme,
    });
    if (error) toast.error("שגיאה ביצירת חבילה");
    else { toast.success("חבילה נוצרה"); setShowCreate(false); setName(""); setDesc(""); loadData(); }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const supabase = createClient();
    await supabase.from("treatment_packages").delete().eq("id", deleteTarget);
    toast.success("חבילה נמחקה"); setDeleteTarget(null); loadData();
  };

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;

  const totalPackages = packages.length;
  const totalTreatments = packages.reduce((s, p) => s + p.numTreatments, 0);
  const avgPrice = packages.length > 0 ? Math.round(packages.reduce((s, p) => s + p.pricePerTreatment, 0) / packages.length) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] md:text-[36px] font-bold text-black">חבילות טיפול</h1>
        <Button onClick={() => setShowCreate(true)} className="bg-accent text-black"><Plus className="size-4 me-1" /> הוספת חבילה חדשה</Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-[12px] border border-border bg-white p-4 text-center">
          <p className="text-[13px] text-muted">סה״כ חבילות</p>
          <p className="text-[24px] font-bold text-black">{totalPackages}</p>
        </div>
        <div className="rounded-[12px] border border-border bg-white p-4 text-center">
          <p className="text-[13px] text-muted">סה״כ טיפולים בחבילות</p>
          <p className="text-[24px] font-bold text-black">{totalTreatments}</p>
        </div>
        <div className="rounded-[12px] border border-border bg-white p-4 text-center">
          <p className="text-[13px] text-muted">מחיר ממוצע לטיפול</p>
          <p className="text-[24px] font-bold text-black">₪{avgPrice}</p>
        </div>
        <div className="rounded-[12px] border border-border bg-white p-4 text-center">
          <p className="text-[13px] text-muted">חבילות נמכרו</p>
          <p className="text-[24px] font-bold text-black">0</p>
        </div>
      </div>

      {packages.length === 0 ? (
        <p className="text-center text-muted py-20">אין חבילות עדיין</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`rounded-[20px] bg-gradient-to-br ${GRADIENTS[pkg.gradientTheme] ?? GRADIENTS.teal} p-6 text-white shadow-lg relative`}>
              <div className="absolute top-3 left-3">
                <ThreeDotsMenu className="text-white" items={[{ label: "מחיקת חבילה", onClick: () => setDeleteTarget(pkg.id), destructive: true }]} />
              </div>
              <div className="size-[40px] rounded-[10px] bg-white/20 flex items-center justify-center mb-3"><span className="text-[18px]">✦</span></div>
              <h3 className="text-[18px] font-bold mb-1">{pkg.name}</h3>
              <p className="text-[13px] text-white/80 mb-3 line-clamp-2">{pkg.description}</p>
              <p className="text-[22px] font-bold">₪{pkg.pricePerTreatment} <span className="text-[13px] font-normal text-white/70">לטיפול</span></p>
              <p className="text-[13px] text-white/70">{pkg.numTreatments} טיפולים</p>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] rounded-[16px] bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[22px] font-bold text-black">חבילה חדשה</h2>
              <button onClick={() => setShowCreate(false)}><X className="size-5 text-muted" /></button>
            </div>
            <div className="flex flex-col gap-4">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם החבילה" />
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="תיאור החבילה" className="min-h-[80px] rounded-[10px] border border-border-input px-3 py-2 text-[14px] resize-none" />
              <Input value={num} onChange={(e) => setNum(e.target.value)} placeholder="כמות טיפולים" type="number" />
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="מחיר לטיפול" type="number" />
              <div className="flex flex-col gap-1">
                <label className="text-[14px] text-black">ערכת נושא</label>
                <div className="flex gap-2">
                  {THEMES.map((t) => (
                    <button key={t} onClick={() => setTheme(t)}
                      className={`size-[36px] rounded-full bg-gradient-to-br ${GRADIENTS[t]} border-2 ${theme === t ? "border-black" : "border-transparent"}`} />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} disabled={isSaving} className="bg-accent text-black">{isSaving ? <Spinner size="sm" /> : "יצירה"}</Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog open onOpenChange={() => setDeleteTarget(null)} title="מחיקת חבילה" description="האם למחוק חבילה זו?" confirmLabel="מחיקה" onConfirm={handleDelete} destructive />
      )}
    </div>
  );
}

"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ThreeDotsMenu } from "@/components/shared/three-dots-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  pointsAmount: number;
  fieldOfKnowledge: string;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Form
  const [name, setName] = useState("");
  const [points, setPoints] = useState("0");
  const [field, setField] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);

  const loadData = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("categories").select("*").order("created_at", { ascending: false });
    setCategories((data ?? []).map((c) => ({
      id: c.id, name: c.name, pointsAmount: c.points_amount, fieldOfKnowledge: c.field_of_knowledge ?? "", createdAt: c.created_at,
    })));
    setIsLoading(false);
  };

  useEffect(() => { void loadData(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("יש להזין שם קטגוריה"); return; }
    setIsSaving(true);
    const supabase = createClient();
    if (editTarget) {
      await supabase.from("categories").update({
        name, points_amount: Number(points) || 0, field_of_knowledge: field || null, updated_at: new Date().toISOString(),
      }).eq("id", editTarget.id);
      toast.success("קטגוריה עודכנה");
    } else {
      const { error } = await supabase.from("categories").insert({
        name, points_amount: Number(points) || 0, field_of_knowledge: field || null,
      });
      if (error) { toast.error("שגיאה ביצירת קטגוריה"); setIsSaving(false); return; }
      toast.success("קטגוריה נוצרה");
    }
    setShowCreate(false); setName(""); setPoints("0"); setField(""); setEditTarget(null); loadData();
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", deleteTarget);
    if (error) toast.error("שגיאה במחיקת קטגוריה");
    else { toast.success("קטגוריה נמחקה"); loadData(); }
    setDeleteTarget(null);
  };

  const filtered = categories.filter((c) => !search || c.name.includes(search));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] md:text-[36px] font-bold text-black">קטגוריות</h1>
        <Button onClick={() => setShowCreate(true)} className="bg-accent text-black"><Plus className="size-4 me-1" /> הוספת קטגוריה</Button>
      </div>

      <div className="relative max-w-[400px] mb-6">
        <Search className="absolute top-1/2 right-3 -translate-y-1/2 size-[18px] text-muted" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש..." className="pe-10 h-[50px]" />
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner /></div> : (
        <div className="rounded-[12px] border border-border bg-white overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead><tr className="border-b border-border text-[13px] text-muted">
              <th className="text-right py-3 px-4 font-medium">שם</th>
              <th className="text-right py-3 px-4 font-medium">נקודות</th>
              <th className="text-right py-3 px-4 font-medium">תחום דעת</th>
              <th className="text-right py-3 px-4 font-medium">תאריך</th>
              <th className="py-3 px-2 w-[40px]"></th>
            </tr></thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 px-4 text-black font-medium">{c.name}</td>
                  <td className="py-3 px-4 text-black">{c.pointsAmount}</td>
                  <td className="py-3 px-4 text-muted">{c.fieldOfKnowledge || "—"}</td>
                  <td className="py-3 px-4 text-muted">{new Date(c.createdAt).toLocaleDateString("he-IL")}</td>
                  <td className="py-3 px-2">
                    <ThreeDotsMenu items={[
                      { label: "עריכת קטגוריה", onClick: () => { setEditTarget(c); setName(c.name); setPoints(String(c.pointsAmount)); setField(c.fieldOfKnowledge); setShowCreate(true); } },
                      { label: "מחיקת קטגוריה", onClick: () => setDeleteTarget(c.id), destructive: true },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-[500px] rounded-[16px] bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[22px] font-bold text-black">קטגוריה חדשה</h2>
              <button onClick={() => setShowCreate(false)}><X className="size-5 text-muted" /></button>
            </div>
            <div className="flex flex-col gap-4">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם הקטגוריה" />
              <Input value={points} onChange={(e) => setPoints(e.target.value)} placeholder="סכום נקודות" type="number" />
              <Input value={field} onChange={(e) => setField(e.target.value)} placeholder="תחום דעת" />
              <Button onClick={handleCreate} disabled={isSaving} className="bg-accent text-black">{isSaving ? <Spinner size="sm" /> : "יצירה"}</Button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog open onOpenChange={() => setDeleteTarget(null)} title="מחיקת קטגוריה" description="האם למחוק קטגוריה זו?" confirmLabel="מחיקה" onConfirm={handleDelete} destructive />
      )}
    </div>
  );
}

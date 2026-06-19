"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThreeDotsMenu } from "@/components/shared/three-dots-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import { fetchAllPractitioners, approvePractitioner, rejectPractitioner, type AdminPractitioner } from "./actions";

const STATUS_TABS = [
  { key: "all", label: "הכל" },
  { key: "submitted", label: "ממתינים" },
  { key: "approved", label: "מאושרים" },
  { key: "rejected", label: "נדחו" },
];

export default function AdminPractitionersPage() {
  const [practitioners, setPractitioners] = useState<AdminPractitioner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadData = async (filter?: string) => {
    setIsLoading(true);
    const data = await fetchAllPractitioners(filter ?? statusFilter);
    setPractitioners(data);
    setIsLoading(false);
  };

  useEffect(() => { void loadData(); }, []);

  const handleTabChange = (tab: string) => {
    setStatusFilter(tab);
    loadData(tab);
  };

  const handleApprove = async (id: string) => {
    const res = await approvePractitioner(id);
    if (res.success) { toast.success("המטפל אושר"); loadData(); }
    else toast.error(res.error);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    const res = await rejectPractitioner(rejectTarget, rejectReason);
    if (res.success) { toast.success("המטפל נדחה"); setRejectTarget(null); setRejectReason(""); loadData(); }
    else toast.error(res.error);
  };

  const filtered = practitioners.filter((p) =>
    !search || p.name.includes(search) || p.email.includes(search) || p.city.includes(search)
  );

  return (
    <div>
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-6">ניהול מטפלים</h1>

      {/* Status tabs */}
      <div className="flex gap-2 mb-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-full text-[14px] transition-colors ${
              statusFilter === tab.key ? "bg-primary text-white" : "bg-white border border-border text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-[400px] mb-6">
        <Search className="absolute top-1/2 right-3 -translate-y-1/2 size-[18px] text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש..." className="pe-10 h-[50px]" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : (
        <div className="rounded-[12px] border border-border bg-white overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-border text-[13px] text-muted-foreground">
                <th className="text-right py-3 px-4 font-medium">שם</th>
                <th className="text-right py-3 px-4 font-medium">אימייל</th>
                <th className="text-right py-3 px-4 font-medium">תחומים</th>
                <th className="text-right py-3 px-4 font-medium">עיר</th>
                <th className="text-right py-3 px-4 font-medium">סטטוס</th>
                <th className="text-right py-3 px-4 font-medium">תאריך</th>
                <th className="py-3 px-2 w-[40px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const canApprove = ["submitted", "pending_approval"].includes(p.status);
                const canReject = ["submitted", "pending_approval", "approved"].includes(p.status);
                return (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/5" onClick={() => window.location.href = `/admin/practitioners/${p.id}`}>
                    <td className="py-3 px-4 text-black font-medium text-primary underline">{p.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{p.email}</td>
                    <td className="py-3 px-4 text-muted-foreground">{p.domainNames.join(", ") || "—"}</td>
                    <td className="py-3 px-4 text-black">{p.city || "—"}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status as "draft" | "submitted" | "approved" | "rejected"} />
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("he-IL")}</td>
                    <td className="py-3 px-2">
                      <ThreeDotsMenu
                        items={[
                          ...(canApprove ? [{ label: "אישור מטפל", onClick: () => handleApprove(p.id) }] : []),
                          ...(canReject ? [{ label: "דחיית מטפל", onClick: () => setRejectTarget(p.id), destructive: true }] : []),
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject dialog */}
      {rejectTarget && (
        <ConfirmDialog
          open
          onOpenChange={() => setRejectTarget(null)}
          title="דחיית מטפל"
          description="האם אתה בטוח? הזן סיבה לדחייה."
          confirmLabel="דחייה"
          onConfirm={handleReject}
          destructive
        />
      )}
    </div>
  );
}

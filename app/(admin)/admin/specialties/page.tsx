"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import {
  fetchPendingSpecialties,
  approvePendingSpecialty,
  rejectPendingSpecialty,
} from "./actions";

interface PendingSpecialty {
  id: string;
  name: string;
  domainName: string;
  createdAt: string;
}

export default function AdminSpecialtiesPage() {
  const [items, setItems] = useState<PendingSpecialty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingSpecialty | null>(null);

  const load = async () => {
    setIsLoading(true);
    setItems(await fetchPendingSpecialties());
    setIsLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    const result = await approvePendingSpecialty(id);
    if (result.success) {
      toast.success("ההתמחות אושרה");
      setItems((prev) => prev.filter((s) => s.id !== id));
    } else {
      toast.error(result.error ?? "שגיאה");
    }
    setBusyId(null);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setBusyId(rejectTarget.id);
    const result = await rejectPendingSpecialty(rejectTarget.id);
    if (result.success) {
      toast.success("ההתמחות נדחתה");
      setItems((prev) => prev.filter((s) => s.id !== rejectTarget.id));
    } else {
      toast.error(result.error ?? "שגיאה");
    }
    setBusyId(null);
    setRejectTarget(null);
  };

  return (
    <div>
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-2">התמחויות לאישור</h1>
      <p className="text-muted-foreground text-[14px] mb-6">
        התמחויות חדשות שהוצעו על ידי מטפלים. אישור יוסיף את ההתמחות לכל המסכים; דחייה תסיר אותה מפרופילי המטפלים שבחרו בה.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : items.length === 0 ? (
        <div className="rounded-[12px] border border-border bg-white py-12 text-center text-muted-foreground">
          אין התמחויות הממתינות לאישור
        </div>
      ) : (
        <div className="rounded-[12px] border border-border bg-white overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead><tr className="border-b border-border text-[13px] text-muted-foreground">
              <th className="text-right py-3 px-4 font-medium">שם ההתמחות</th>
              <th className="text-right py-3 px-4 font-medium">תחום מקורי</th>
              <th className="text-right py-3 px-4 font-medium">נוצר</th>
              <th className="py-3 px-4 w-[200px]"></th>
            </tr></thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 px-4 text-black font-medium">{s.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{s.domainName}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString("he-IL")}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(s.id)}
                        disabled={busyId === s.id}
                        className="bg-accent text-black gap-1"
                      >
                        <Check className="size-4" />
                        אישור
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRejectTarget(s)}
                        disabled={busyId === s.id}
                        className="text-destructive hover:bg-destructive/5 gap-1"
                      >
                        <X className="size-4" />
                        דחייה
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejectTarget && (
        <ConfirmDialog
          open
          onOpenChange={() => setRejectTarget(null)}
          title="דחיית התמחות"
          description={`האם לדחות את "${rejectTarget.name}"? היא תוסר מכל פרופילי המטפלים שבחרו בה.`}
          confirmLabel="דחייה"
          onConfirm={handleReject}
          destructive
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wallet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import { fetchPendingPayouts, markPayoutAsPaid, type PayoutGroup } from "./actions";

export default function AdminPayoutsPage() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<PayoutGroup | null>(null);

  const { data: groups = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-payouts"],
    queryFn: fetchPendingPayouts,
  });

  const handleMarkPaid = async () => {
    if (!confirmTarget) return;
    setBusyId(confirmTarget.practitionerId);
    const result = await markPayoutAsPaid(confirmTarget.bookingIds);
    if (result.success) {
      toast.success(`סומן כשולם — ${confirmTarget.bookingCount} טיפולים`);
      void refetch();
    } else {
      toast.error(result.error);
    }
    setBusyId(null);
    setConfirmTarget(null);
  };

  const totalOwed = groups.reduce((s, g) => s + g.amountOwed, 0);

  return (
    <div>
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-2">תשלומים למטפלים</h1>
      <p className="text-muted-foreground text-[14px] mb-6">
        טיפולים שהושלמו וחויבו ועדיין לא הועברו למטפל. סמן כשולם לאחר ביצוע ההעברה הבנקאית.
      </p>

      {!isLoading && groups.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-[12px] border border-border bg-white p-4">
            <p className="text-[13px] text-muted-foreground">מטפלים בהמתנה</p>
            <p className="text-[24px] font-bold text-black">{groups.length}</p>
          </div>
          <div className="rounded-[12px] border border-border bg-white p-4">
            <p className="text-[13px] text-muted-foreground">טיפולים בהמתנה</p>
            <p className="text-[24px] font-bold text-black">
              {groups.reduce((s, g) => s + g.bookingCount, 0)}
            </p>
          </div>
          <div className="rounded-[12px] border border-border bg-white p-4">
            <p className="text-[13px] text-muted-foreground">סך לתשלום</p>
            <p className="text-[24px] font-bold text-primary">₪{totalOwed.toLocaleString("he-IL")}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : isError ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
          <p className="text-[15px] text-muted-foreground">שגיאה בטעינת התשלומים</p>
          <Button onClick={() => void refetch()} variant="secondary" className="bg-[#f4f7f7]">נסה שוב</Button>
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-[12px] border border-border bg-white py-12 text-center text-muted-foreground">
          <Wallet className="size-10 mx-auto mb-3 text-muted-foreground/50" />
          <p>אין תשלומים בהמתנה</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((g) => {
            const hasBankDetails =
              g.bankName && g.bankAccountNumber && g.bankBranchNumber && g.bankNumber;
            return (
              <div
                key={g.practitionerId}
                className="rounded-[12px] border border-border bg-white p-6 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[18px] font-semibold text-black">{g.practitionerName}</h3>
                    <span className="text-[22px] font-bold text-primary">
                      ₪{g.amountOwed.toLocaleString("he-IL")}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted-foreground mb-3">
                    {g.bookingCount} טיפולים · הישן ביותר: {g.oldestUnpaidAt ?? "—"}
                  </p>
                  {hasBankDetails ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[13px]">
                      <div>
                        <div className="text-muted-foreground">בנק</div>
                        <div className="text-black font-medium">{g.bankName}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">מס׳ בנק</div>
                        <div className="text-black font-medium">{g.bankNumber}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">סניף</div>
                        <div className="text-black font-medium">{g.bankBranchNumber}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">חשבון</div>
                        <div className="text-black font-medium">{g.bankAccountNumber}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[8px] bg-destructive/5 text-destructive text-[13px] px-3 py-2">
                      ⚠ פרטי בנק חסרים — אנא בקש מהמטפל להזין במסך הפרופיל
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={() => setConfirmTarget(g)}
                  disabled={busyId === g.practitionerId || !hasBankDetails}
                  className="bg-accent text-black w-full md:w-[160px] gap-2 shrink-0"
                >
                  {busyId === g.practitionerId ? <Spinner size="sm" /> : <Check className="size-4" />}
                  סומן כשולם
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title="סימון תשלום"
        description={
          confirmTarget
            ? `לסמן ${confirmTarget.bookingCount} טיפולים עבור ${confirmTarget.practitionerName} בסך ₪${confirmTarget.amountOwed.toLocaleString("he-IL")} כשולמו? פעולה זו לא תבצע העברה — וודא שבוצעה ההעברה הבנקאית קודם.`
            : ""
        }
        confirmLabel="סומן כשולם"
        onConfirm={handleMarkPaid}
      />
    </div>
  );
}

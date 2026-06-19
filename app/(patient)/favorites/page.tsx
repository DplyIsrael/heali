"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PractitionerCard, type PractitionerCardData } from "@/components/shared/practitioner-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { fetchFavoritePractitioners, toggleFavorite } from "@/lib/mutations/favorites";
import { toast } from "sonner";

export default function FavoritesPage() {
  const queryClient = useQueryClient();

  const { data: practitioners, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavoritePractitioners,
  });

  const { mutate: toggle } = useMutation({
    mutationFn: toggleFavorite,
    onMutate: async (practitionerId) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const prev = queryClient.getQueryData<PractitionerCardData[]>(["favorites"]);
      queryClient.setQueryData(
        ["favorites"],
        (old: PractitionerCardData[] | undefined) =>
          old?.filter((p) => p.id !== practitionerId) ?? []
      );
      return { prev };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["favorites"], context?.prev);
      toast.error("שגיאה בעדכון מועדפים");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const [activeTab, setActiveTab] = useState<"favorites" | "matches">("favorites");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] px-4 md:px-[30px] py-6 md:py-10">
        <div className="mb-6">
          <h1 className="text-[28px] md:text-[36px] font-bold text-black">המועדפים שלי</h1>
          <p className="mt-1 text-[16px] text-muted-foreground">
            כל המטפלים שהוספת למועדפים יופיעו כאן
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-[10px] bg-white p-[6px] mb-6 w-full max-w-[400px]">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 py-2.5 rounded-[8px] text-[16px] transition-colors ${activeTab === "favorites" ? "bg-accent font-normal text-black" : "font-light text-black"}`}
          >
            המועדפים שלי
          </button>
          <button
            onClick={() => setActiveTab("matches")}
            className={`flex-1 py-2.5 rounded-[8px] text-[16px] transition-colors ${activeTab === "matches" ? "bg-accent font-normal text-black" : "font-light text-black"}`}
          >
            ההתאמות שלי
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        )}

        {!isLoading && practitioners && practitioners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {practitioners.map((p) => (
              <PractitionerCard
                key={p.id}
                practitioner={p as PractitionerCardData}
                onToggleFavorite={(id) => toggle(id)}
              />
            ))}
          </div>
        )}

        {!isLoading && (!practitioners || practitioners.length === 0) && (
          <EmptyState
            title="אין מועדפים עדיין"
            description="חפשו מטפלים ושמרו אותם למועדפים כדי למצוא אותם בקלות"
          />
        )}
      </div>
    </div>
  );
}

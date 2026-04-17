"use client";

import { useQuery } from "@tanstack/react-query";
import {
  searchPractitioners,
  fetchFilterOptions,
  type PractitionerSearchParams,
} from "@/app/(public)/discovery/actions";

export function usePractitioners(params: PractitionerSearchParams) {
  return useQuery({
    queryKey: ["practitioners", params],
    queryFn: () => searchPractitioners(params),
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ["filter-options"],
    queryFn: () => fetchFilterOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

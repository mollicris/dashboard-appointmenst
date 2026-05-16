import { useQuery } from "@tanstack/react-query";
import { container } from "@infrastructure/di/container";

/**
 * Resolves the active business for the current tenant.
 * Uses the first business returned by the API (tenants typically have one).
 */
export function useCurrentBusiness() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["businesses"],
    queryFn: () => container.listBusinessesUseCase.execute(),
    staleTime: 5 * 60_000,
  });

  const business = data?.[0] ?? null;

  return {
    business,
    businessId: business?.id ?? null,
    isLoading,
    isError,
  };
}

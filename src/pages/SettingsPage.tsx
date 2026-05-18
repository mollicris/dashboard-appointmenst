import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageLoader } from "@shared/components/ui/LoadingSpinner";
import { BusinessHoursConfig } from "@features/settings/components/BusinessHoursConfig";
import { WhatsAppConfig } from "@features/settings/components/WhatsAppConfig";
import { useCurrentBusiness } from "@features/appointments/hooks/useCurrentBusiness";
import { cn } from "@shared/lib/cn";

type Tab = "hours" | "whatsapp";

const TABS: { id: Tab; label: string }[] = [
  { id: "hours", label: "Horarios" },
  { id: "whatsapp", label: "WhatsApp" },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const { businessId, isLoading } = useCurrentBusiness();
  const [activeTab, setActiveTab] = useState<Tab>("hours");

  useEffect(() => {
    if (!isLoading && !businessId) {
      navigate("/");
    }
  }, [businessId, isLoading, navigate]);

  if (isLoading || !businessId) {
    return <PageLoader />;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Configuración</h1>

      <div className="mb-6 border-b">
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "hours" && <BusinessHoursConfig businessId={businessId} />}
      {activeTab === "whatsapp" && <WhatsAppConfig businessId={businessId} />}
    </div>
  );
}

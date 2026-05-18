import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Calendar, Clock, User, Briefcase, UserCog } from "lucide-react";
import { appointmentsApi } from "@infrastructure/api/appointments";
import { container } from "@infrastructure/di/container";

interface CreateAppointmentModalProps {
  isOpen: boolean;
  businessId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateAppointmentModal({
  isOpen,
  businessId,
  onClose,
  onCreated,
}: CreateAppointmentModalProps) {
  const qc = useQueryClient();
  const [clientName, setClientName] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedProfessional, setSelectedProfessional] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [notes, setNotes] = useState("");

  // Fetch services
  const { data: services } = useQuery({
    queryKey: ["services", businessId],
    queryFn: () => container.listServicesUseCase.execute(businessId),
    enabled: !!businessId && isOpen,
  });

  // Fetch professionals (for the selector — filtered by service below)
  const { data: professionals } = useQuery({
    queryKey: ["professionals", businessId],
    queryFn: () => container.listProfessionalsUseCase.execute(businessId),
    enabled: !!businessId && isOpen,
  });

  const currentService = services?.find((s) => s.id === selectedService);
  // If the service has explicit assignments, restrict; otherwise show all
  const availableProfessionals =
    professionals?.filter((p) =>
      currentService && currentService.professionalIds.length > 0
        ? currentService.professionalIds.includes(p.id)
        : true,
    ) ?? [];

  // Fetch available slots
  const { data: slotsData, isLoading: slotsLoading, error: slotsError } = useQuery({
    queryKey: ["available-slots", businessId, selectedService, selectedDate],
    queryFn: () =>
      appointmentsApi.getAvailableSlots(
        businessId,
        selectedService,
        selectedDate,
      ),
    enabled: !!selectedService && !!selectedDate && isOpen,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!clientName.trim()) {
        throw new Error("El nombre del cliente es requerido");
      }
      if (!clientWhatsapp.trim()) {
        throw new Error("El WhatsApp es requerido");
      }
      if (!selectedService) {
        throw new Error("Selecciona un servicio");
      }
      if (!selectedDate) {
        throw new Error("Selecciona una fecha");
      }
      if (!selectedTime) {
        throw new Error("Selecciona un horario");
      }

      return appointmentsApi.create({
        business_id: businessId,
        service_id: selectedService,
        scheduled_at: selectedTime,
        client_name: clientName,
        client_whatsapp: clientWhatsapp,
        professional_id: selectedProfessional || undefined,
        notes: notes || undefined,
        client_email: clientEmail || undefined,
      });
    },
    onSuccess: () => {
      toast.success("Cita agendada correctamente");
      qc.invalidateQueries({ queryKey: ["appointments"] }).catch(() => {});
      resetForm();
      onCreated();
    },
    onError: (error: any) => {
      const message = error?.message || error?.response?.data?.message || "Error al agendar la cita";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setClientName("");
    setClientWhatsapp("");
    setClientEmail("");
    setSelectedService("");
    setSelectedProfessional("");
    setSelectedDate("");
    setSelectedTime("");
    setNotes("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const servicesList = services || [];
  const availableSlots = slotsData?.data?.slots || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between bg-white border-b p-6">
          <h2 className="text-xl font-bold">Agendar Nueva Cita</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Info */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Información del Cliente
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <input
                type="tel"
                placeholder="WhatsApp (ej: +5912345678)"
                value={clientWhatsapp}
                onChange={(e) => setClientWhatsapp(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Service */}
          <div className="space-y-3">
            <label className="font-semibold flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Servicio
            </label>
            <select
              value={selectedService}
              onChange={(e) => {
                setSelectedService(e.target.value);
                setSelectedTime("");
                setSelectedProfessional("");
              }}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="">Selecciona un servicio</option>
              {servicesList.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Professional */}
          <div className="space-y-3">
            <label className="font-semibold flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Profesional <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              disabled={!selectedService}
              className="w-full border rounded px-3 py-2 text-sm disabled:bg-muted disabled:text-muted-foreground"
            >
              <option value="">
                {!selectedService
                  ? "Selecciona un servicio primero"
                  : availableProfessionals.length === 0
                    ? "Sin profesionales disponibles"
                    : "Sin asignar"}
              </option>
              {availableProfessionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime("");
                }}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horario
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedDate || availableSlots.length === 0 || slotsLoading}
                className="w-full border rounded px-3 py-2 text-sm disabled:bg-muted disabled:text-muted-foreground"
              >
                <option value="">
                  {!selectedDate
                    ? "Selecciona una fecha"
                    : slotsLoading
                      ? "Cargando horarios..."
                      : slotsError
                        ? "Error al cargar horarios"
                        : availableSlots.length === 0
                          ? "Sin disponibilidad"
                          : "Selecciona horario"}
                </option>
                {availableSlots.map((slot) => {
                  try {
                    // Parse ISO datetime
                    const dateObj = new Date(slot);
                    // Format: HH:MM in UTC
                    const hours = String(dateObj.getUTCHours()).padStart(2, "0");
                    const minutes = String(dateObj.getUTCMinutes()).padStart(2, "0");
                    const time = `${hours}:${minutes}`;

                    return (
                      <option key={slot} value={slot}>
                        {time}
                      </option>
                    );
                  } catch (e) {
                    // Fallback si hay error en parsing
                    console.error("Error parsing slot:", slot, e);
                    return (
                      <option key={slot} value={slot}>
                        {slot.substring(11, 16)}
                      </option>
                    );
                  }
                })}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="font-semibold">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información adicional sobre la cita..."
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border rounded-md font-medium hover:bg-muted"
              disabled={createMutation.isPending}
            >
              Cancelar
            </button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="flex-1 bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {createMutation.isPending ? "Agendando..." : "Agendar Cita"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

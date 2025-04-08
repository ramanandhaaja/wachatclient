"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, X, Clock, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCalendar } from "@/hooks/use-calendar";
import { Event } from "@/types/calendar";
import { toWIB, formatWIB } from "@/lib/utils";

interface EventPanelProps {
  selectedDate: Date;
  viewMode: '12h' | '24h';
}

export function EventPanel({ selectedDate, viewMode }: EventPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [serviceType, setServiceType] = useState("Default Service");
  const [startTime, setStartTime] = useState("09:00");
  const [error, setError] = useState<string>();

  const { events: eventsApi, availableSlots } = useCalendar();
  const createMutation = eventsApi.useCreate();
  const deleteMutation = eventsApi.useDelete();
  const { data: slots, isLoading: slotsLoading } = availableSlots.useQuery(selectedDate);

  // Fetch events for selected date
  const { data: monthEvents, isLoading: eventsLoading } = eventsApi.useQuery({
    startDate: format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0), 'yyyy-MM-dd')
  });

  // Filter events for selected date
  const dayEvents = monthEvents?.filter((event: Event) => {
    const eventDate = new Date(event.startTime);
    return eventDate.getDate() === selectedDate.getDate() &&
           eventDate.getMonth() === selectedDate.getMonth() &&
           eventDate.getFullYear() === selectedDate.getFullYear();
  }) ?? [];

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteMutation.mutateAsync(eventId);
    } catch (error: any) {
      setError(error?.message || 'Failed to delete event. Please try again.');
      console.error("Failed to delete event:", error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      // Create a date object from selected date and time
      const eventDate = new Date(selectedDate);
      const [hours, minutes] = startTime.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);

      await createMutation.mutateAsync({
        startTime: eventDate.toISOString(),
        clientInfo: {
          name: clientName,
          phone: clientPhone,
          email: clientEmail || undefined
        },
        serviceType
      });
      setIsOpen(false);
      setClientName("");
      setClientPhone("");
      setClientEmail("");
      setServiceType("Default Service");
      setStartTime("09:00");
      setError(undefined);
    } catch (error: any) {
      setError(error?.message || 'Failed to create event. Please try again.');
      console.error("Failed to create event:", error);
    }
  };

  const formatTime = (date: Date) => {
    // Use the utility function to convert to WIB and format
    return viewMode === '12h' 
      ? formatWIB(date, 'hh:mm a')
      : formatWIB(date, 'HH:mm');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Events</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client Name</Label>
                <Input
                  id="client"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Client Phone</Label>
                <Input
                  id="phone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Enter client phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Client Email (Optional)</Label>
                <Input
                  id="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Enter client email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Service Type</Label>
                <Input
                  id="service"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="Enter service type"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Start Time</Label>
                <select
                  id="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {!slots?.length ? (
                    <option disabled value="">No available slots</option>
                  ) : (
                    slots.map((slot) => (
                      <option 
                        key={slot.start.toISOString()} 
                        value={format(new Date(slot.start), 'HH:mm')}
                      >
                        {format(new Date(slot.start), viewMode === '12h' ? 'hh:mm a' : 'HH:mm')}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <Button onClick={handleCreateEvent} className="w-full" disabled={!clientName || !clientPhone || !serviceType || !startTime}>
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {!slots?.length ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No available slots. Please set your availability for {format(selectedDate, 'EEEE')}s first.
            </AlertDescription>
          </Alert>
        ) : !dayEvents ? (
          <div className="p-4 rounded-lg border bg-white">
            <p className="text-sm text-gray-500 text-center">
              Loading events...
            </p>
          </div>
        ) : eventsLoading ? (
          <div className="p-4 rounded-lg border bg-white">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
              <p className="text-sm text-gray-500">Loading events...</p>
            </div>
          </div>
        ) : dayEvents.length === 0 ? (
          <div className="p-4 rounded-lg border bg-white">
            <p className="text-sm text-gray-500 text-center">
              No events scheduled for {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900">
                {format(selectedDate, 'MMMM d, yyyy')}
              </h4>
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-500">
                {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {[...dayEvents]
                .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                .map((event: Event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{event.client?.name || "Unknown client"}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">📱 {event.client?.phone || "No phone"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">🔧 {event.serviceType}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

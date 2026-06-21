"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Loader2 } from "lucide-react";
import { CalendarEvent } from "./types";

interface FullCalendarPanelProps {
  events: CalendarEvent[];
  loading: boolean;
  error: string;
  onSync: () => void;
}

export function FullCalendarPanel({
  events,
  loading,
  error,
  onSync,
}: FullCalendarPanelProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); // default to actual today
  const [view, setView] = useState<"Month" | "Week" | "Day">("Week");

  // Helper: check if two dates are the same calendar day
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Helper: Get Monday of the week containing a date
  const getMonday = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.getFullYear(), date.getMonth(), diff);
  };

  // Helper: Generate the 7 days of the active week
  const getWeekDays = (d: Date) => {
    const monday = getMonday(d);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return day;
    });
  };

  // Helper: Generate days for Month grid (35 or 42 cells)
  const getMonthGridDays = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1; // Align Mon = 0, Sun = 6

    const days = [];
    // Backfill previous month days
    for (let i = startDay; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }
    // Current month days
    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    // Pad next month days
    const gridLength = days.length <= 35 ? 35 : 42;
    const remaining = gridLength - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  };

  // Formatting header title
  const getHeaderTitle = () => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const y = currentDate.getFullYear();
    const m = months[currentDate.getMonth()];

    if (view === "Month") {
      return `${m} ${y}`;
    }

    if (view === "Day") {
      const dayName = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      return `${dayName}, ${m} ${currentDate.getDate()}, ${y}`;
    }

    // Week View
    const monday = getMonday(currentDate);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startMonth = months[monday.getMonth()].substring(0, 3);
    const endMonth = months[sunday.getMonth()].substring(0, 3);

    if (monday.getFullYear() !== sunday.getFullYear()) {
      return `${startMonth} ${monday.getDate()}, ${monday.getFullYear()} – ${endMonth} ${sunday.getDate()}, ${sunday.getFullYear()}`;
    }
    if (monday.getMonth() !== sunday.getMonth()) {
      return `${startMonth} ${monday.getDate()} – ${endMonth} ${sunday.getDate()}, ${y}`;
    }
    return `${months[monday.getMonth()]} ${monday.getDate()} – ${sunday.getDate()}, ${y}`;
  };

  // Navigation handlers
  const handlePrev = () => {
    const newD = new Date(currentDate);
    if (view === "Day") {
      newD.setDate(newD.getDate() - 1);
    } else if (view === "Week") {
      newD.setDate(newD.getDate() - 7);
    } else {
      newD.setMonth(newD.getMonth() - 1);
    }
    setCurrentDate(newD);
  };

  const handleNext = () => {
    const newD = new Date(currentDate);
    if (view === "Day") {
      newD.setDate(newD.getDate() + 1);
    } else if (view === "Week") {
      newD.setDate(newD.getDate() + 7);
    } else {
      newD.setMonth(newD.getMonth() + 1);
    }
    setCurrentDate(newD);
  };

  const handleToday = () => {
    setCurrentDate(new Date()); // jump to actual today
  };

  const hours = Array.from({ length: 24 }, (_, i) => {
    if (i === 0) return "12 am";
    if (i === 12) return "12 pm";
    return i > 12 ? `${i - 12} pm` : `${i} am`;
  });

  const weekDays = getWeekDays(currentDate);
  const monthDays = getMonthGridDays(currentDate);

  // Styling helper for events
  const getEventColors = (idHash: number) => {
    const colorClasses = [
      "bg-blue-500/10 border-blue-500/30 text-blue-500",
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
      "bg-violet-500/10 border-violet-500/30 text-violet-500",
      "bg-orange-500/10 border-orange-500/30 text-orange-500",
    ];
    return colorClasses[idHash % colorClasses.length];
  };

  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  return (
    <div className="flex flex-col h-full w-full bg-background/50 rounded-xl border border-border p-8 overflow-hidden">
      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-semibold text-foreground tracking-tight select-none">
          {getHeaderTitle()}
        </h2>

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center bg-muted/50 p-1 rounded-full border border-border/50 select-none">
            <button
              onClick={() => setView("Month")}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                view === "Month"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("Week")}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                view === "Week"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("Day")}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                view === "Day"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Day
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2 select-none">
            <button
              onClick={handlePrev}
              className="flex items-center justify-center size-9 bg-muted/50 hover:bg-muted text-foreground rounded-full border border-border/50 transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-5 py-2 text-sm font-medium bg-muted/50 hover:bg-muted text-foreground rounded-full border border-border/50 transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="flex items-center justify-center size-9 bg-muted/50 hover:bg-muted text-foreground rounded-full border border-border/50 transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <button
            onClick={onSync}
            disabled={loading}
            className="flex items-center justify-center size-9 bg-muted/50 hover:bg-muted text-foreground rounded-full border border-border/50 transition-colors ml-2 disabled:opacity-50"
            title="Sync Events"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-6 h-5 select-none">
        {loading && (
          <span className="flex items-center gap-2">
            <Loader2 className="size-3 animate-spin" /> Syncing calendar...
          </span>
        )}
        {!loading && error && <span className="text-destructive">{error}</span>}
        {!loading && !error && (
          <span>{events.length} upcoming events synced.</span>
        )}
      </div>

      {/* ── Day View ──────────────────────────── */}
      {view === "Day" && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2 scrollbar-thin select-none">
            {weekDays.map((d, i) => {
              const isActive = isSameDay(d, currentDate);
              const isToday = isSameDay(d, new Date());
              return (
                <div
                  key={i}
                  onClick={() => setCurrentDate(d)}
                  className={`flex flex-col items-center justify-center w-16 py-3 rounded-2xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-foreground text-background shadow-md scale-105"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <span className="text-[10px] font-semibold mb-0.5">
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      isActive
                        ? "text-background"
                        : isToday
                          ? "text-emerald-500 font-extrabold"
                          : "text-foreground"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin pr-4 relative min-h-0">
            <div className="relative min-h-[1920px]">
              {hours.map((time, i) => (
                <div key={i} className="flex group h-[80px]">
                  <div className="w-16 text-xs text-muted-foreground font-medium pt-2 shrink-0 select-none">
                    {time}
                  </div>
                  <div className="flex-1 border-t border-border/20 group-hover:border-border/40 transition-colors relative" />
                </div>
              ))}

              <div className="absolute inset-y-0 left-16 right-0 pointer-events-none">
                {events
                  .filter(
                    (e) =>
                      !e.isAllDay && isSameDay(new Date(e.start), currentDate),
                  )
                  .map((event) => {
                    const startDate = new Date(event.start);
                    const endDate = new Date(event.end);
                    const startHour = startDate.getHours();
                    const startMinute = startDate.getMinutes();
                    const top = startHour * 80 + (startMinute / 60) * 80;
                    const durationMinutes =
                      (endDate.getTime() - startDate.getTime()) / (1000 * 60);
                    const height = Math.max((durationMinutes / 60) * 80, 24);

                    const colorClass = getEventColors(hashString(event.id));

                    return (
                      <div
                        key={event.id}
                        className={`absolute left-2 right-4 rounded-xl border p-3 overflow-hidden shadow-sm backdrop-blur-sm pointer-events-auto ${colorClass}`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                      >
                        <div className="text-xs font-bold truncate">
                          {event.summary}
                        </div>
                        <div className="text-[10px] opacity-85 mt-1 font-semibold">
                          {startDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {endDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Week View ─────────────────────────── */}
      {view === "Week" && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="grid grid-cols-7 gap-2 pl-16 border-b border-border/40 pb-4 mb-4 text-center select-none">
            {weekDays.map((d, i) => {
              const isToday = isSameDay(d, new Date());
              return (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span
                    className={`text-lg font-bold flex items-center justify-center size-8 rounded-full mt-1 ${
                      isToday
                        ? "bg-foreground text-background"
                        : "text-foreground"
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin pr-4 relative min-h-0">
            <div className="relative min-h-[1920px]">
              {/* Background hourly lines */}
              {hours.map((time, i) => (
                <div key={i} className="flex group h-[80px]">
                  <div className="w-16 text-xs text-muted-foreground font-medium pt-2 shrink-0 select-none">
                    {time}
                  </div>
                  <div className="flex-1 border-t border-border/20 group-hover:border-border/40 transition-colors relative" />
                </div>
              ))}

              {/* Day columns */}
              <div className="absolute inset-y-0 left-16 right-0 grid grid-cols-7 gap-2 pointer-events-none">
                {weekDays.map((day, colIndex) => {
                  const dayEvents = events.filter(
                    (e) => !e.isAllDay && isSameDay(new Date(e.start), day),
                  );
                  return (
                    <div
                      key={colIndex}
                      className="relative h-full border-r border-border/10 pointer-events-auto"
                    >
                      {dayEvents.map((event) => {
                        const startDate = new Date(event.start);
                        const endDate = new Date(event.end);
                        const startHour = startDate.getHours();
                        const startMinute = startDate.getMinutes();
                        const top = startHour * 80 + (startMinute / 60) * 80;
                        const durationMinutes =
                          (endDate.getTime() - startDate.getTime()) /
                          (1000 * 60);
                        const height = Math.max(
                          (durationMinutes / 60) * 80,
                          24,
                        );

                        const colorClass = getEventColors(hashString(event.id));

                        return (
                          <div
                            key={event.id}
                            className={`absolute left-1 right-1 rounded-lg border p-2 overflow-hidden shadow-sm backdrop-blur-sm ${colorClass}`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            title={`${event.summary}\n${startDate.toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )} - ${endDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`}
                          >
                            <div className="text-[11px] font-bold truncate leading-tight">
                              {event.summary}
                            </div>
                            {height >= 40 && (
                              <div className="text-[9px] opacity-80 mt-0.5 font-medium leading-none">
                                {startDate.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Month View ────────────────────────── */}
      {view === "Month" && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="grid grid-cols-7 gap-2 text-center font-semibold text-xs text-muted-foreground border-b border-border/40 pb-2 mb-2 select-none">
            <div>MON</div>
            <div>TUE</div>
            <div>WED</div>
            <div>THU</div>
            <div>FRI</div>
            <div>SAT</div>
            <div>SUN</div>
          </div>

          <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-2 min-h-0">
            {monthDays.map((d, i) => {
              const isCurrentMonth = d.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(d, new Date());
              const dayEvents = events.filter((e) =>
                isSameDay(new Date(e.start), d),
              );

              return (
                <div
                  key={i}
                  onClick={() => {
                    setCurrentDate(d);
                    setView("Day");
                  }}
                  className={`flex flex-col p-2 rounded-xl border border-border/20 transition-all hover:bg-muted/40 cursor-pointer min-h-22.5 ${
                    isCurrentMonth ? "bg-muted/10" : "bg-muted/5 opacity-40"
                  } ${isToday ? "border-emerald-500/50 bg-emerald-500/5" : ""}`}
                >
                  <span
                    className={`text-xs font-bold self-end select-none ${
                      isToday
                        ? "text-emerald-500 font-extrabold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {d.getDate()}
                  </span>

                  <div className="flex-1 mt-1 space-y-1 overflow-hidden pointer-events-none">
                    {dayEvents.slice(0, 3).map((event) => {
                      const colorClass = getEventColors(hashString(event.id));
                      return (
                        <div
                          key={event.id}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border truncate leading-normal ${colorClass}`}
                        >
                          {event.summary}
                        </div>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[9px] text-muted-foreground font-semibold px-1 select-none">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

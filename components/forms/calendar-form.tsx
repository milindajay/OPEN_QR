"use client";

import * as React from "react";
import type { CalendarPayload } from "@/types/payload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/primitives";

export interface CalendarFormProps {
  value: CalendarPayload;
  onChange: (next: CalendarPayload) => void;
  errors: Record<string, string>;
}

function splitDateTime(isoString: string): { date: string; time: string } {
  const trimmed = isoString.trim();
  if (!trimmed) {
    return { date: "", time: "09:00" };
  }
  const datePart = /^\d{4}-\d{2}-\d{2}/.exec(trimmed)?.[0] ?? "";
  const timeMatch = /T(\d{2}:\d{2})/.exec(trimmed);
  return {
    date: datePart,
    time: timeMatch?.[1] ?? "09:00",
  };
}

function buildIsoString(
  date: string,
  time: string,
  allDay: boolean
): string {
  const cleanDate = date.trim();
  if (!cleanDate) {
    return "";
  }
  if (allDay) {
    return cleanDate;
  }
  const cleanTime = time.trim() || "09:00";
  return `${cleanDate}T${cleanTime}:00Z`;
}

export function CalendarForm({ value, onChange, errors }: CalendarFormProps) {
  const isAllDay = Boolean(value.allDay);
  const startParts = splitDateTime(value.start);
  const endParts = splitDateTime(
    value.end || (startParts.date ? `${startParts.date}T10:00:00Z` : "")
  );

  const [startTime, setStartTime] = React.useState(startParts.time || "09:00");
  const [endTime, setEndTime] = React.useState(
    value.end ? endParts.time : "10:00"
  );

  React.useEffect(() => {
    if (value.start.includes("T")) {
      const parsed = splitDateTime(value.start);
      setStartTime(parsed.time);
    }
  }, [value.start]);

  React.useEffect(() => {
    if (value.end.includes("T")) {
      const parsed = splitDateTime(value.end);
      setEndTime(parsed.time);
    }
  }, [value.end]);

  const handleAllDayChange = (checked: boolean) => {
    const nextAllDay = Boolean(checked);
    const nextStart = buildIsoString(startParts.date, startTime, nextAllDay);
    const nextEnd = buildIsoString(
      value.end ? endParts.date : "",
      endTime,
      nextAllDay
    );
    onChange({
      ...value,
      allDay: nextAllDay,
      start: nextStart,
      end: nextEnd,
    });
  };

  const handleStartDateChange = (nextDate: string) => {
    onChange({
      ...value,
      start: buildIsoString(nextDate, startTime, isAllDay),
    });
  };

  const handleStartTimeChange = (nextTime: string) => {
    setStartTime(nextTime);
    onChange({
      ...value,
      start: buildIsoString(startParts.date, nextTime, isAllDay),
    });
  };

  const handleEndDateChange = (nextDate: string) => {
    onChange({
      ...value,
      end: buildIsoString(nextDate, endTime, isAllDay),
    });
  };

  const handleEndTimeChange = (nextTime: string) => {
    setEndTime(nextTime);
    onChange({
      ...value,
      end: buildIsoString(
        value.end ? endParts.date : startParts.date,
        nextTime,
        isAllDay
      ),
    });
  };

  return (
    <div className="space-y-4" data-testid="form-calendar">
      {/* Event Title */}
      <div className="space-y-1.5">
        <Label htmlFor="calendar-title" className="text-xs font-medium">
          Event Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="calendar-title"
          placeholder="OpenQR Studio Architecture Review"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "calendar-title-error" : undefined}
          className="h-10"
        />
        {errors.title && (
          <p
            id="calendar-title-error"
            role="alert"
            className="text-xs font-medium text-destructive"
          >
            {errors.title}
          </p>
        )}
      </div>

      {/* All-Day Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3.5 py-2.5">
        <div className="space-y-0.5">
          <Label
            htmlFor="calendar-all-day-switch"
            className="text-xs font-medium"
          >
            All-Day Event
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Select inclusive start and end dates. Encodes RFC 5545{" "}
            <code className="font-mono">VALUE=DATE</code> with exclusive{" "}
            <code className="font-mono">DTEND</code> (+1 day).
          </p>
        </div>
        <Switch
          id="calendar-all-day-switch"
          aria-label="All-Day Event"
          checked={isAllDay}
          onCheckedChange={handleAllDayChange}
        />
      </div>

      {/* Start Date & Time */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="calendar-start-date" className="text-xs font-medium">
            Start Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="calendar-start-date"
            type="date"
            value={startParts.date}
            onChange={(e) => handleStartDateChange(e.target.value)}
            aria-invalid={Boolean(errors.start)}
            aria-describedby={errors.start ? "calendar-start-error" : undefined}
            className="h-10"
          />
        </div>

        {!isAllDay && (
          <div className="space-y-1.5">
            <Label
              htmlFor="calendar-start-time"
              className="text-xs font-medium"
            >
              Start Time (UTC) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="calendar-start-time"
              type="time"
              value={startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="h-10"
            />
          </div>
        )}
      </div>

      {errors.start && (
        <p
          id="calendar-start-error"
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {errors.start}
        </p>
      )}

      {/* End Date & Time */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="calendar-end-date" className="text-xs font-medium">
            {isAllDay ? "End Date (Inclusive)" : "End Date"}{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="calendar-end-date"
            type="date"
            value={value.end ? endParts.date : ""}
            onChange={(e) => handleEndDateChange(e.target.value)}
            aria-invalid={Boolean(errors.end)}
            aria-describedby={errors.end ? "calendar-end-error" : undefined}
            className="h-10"
          />
        </div>

        {!isAllDay && (
          <div className="space-y-1.5">
            <Label htmlFor="calendar-end-time" className="text-xs font-medium">
              End Time (UTC) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="calendar-end-time"
              type="time"
              value={endTime}
              onChange={(e) => handleEndTimeChange(e.target.value)}
              className="h-10"
            />
          </div>
        )}
      </div>

      {errors.end && (
        <p
          id="calendar-end-error"
          role="alert"
          className="text-xs font-medium text-destructive"
        >
          {errors.end}
        </p>
      )}

      {/* Location & Description */}
      <div className="space-y-1.5">
        <Label htmlFor="calendar-location" className="text-xs font-medium">
          Location <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="calendar-location"
          placeholder="Room 3B / Online Video Link"
          value={value.location ?? ""}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
          className="h-10"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="calendar-description" className="text-xs font-medium">
          Description <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Textarea
          id="calendar-description"
          rows={2}
          placeholder="Agenda, notes, or meeting details..."
          value={value.description ?? ""}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </div>
    </div>
  );
}

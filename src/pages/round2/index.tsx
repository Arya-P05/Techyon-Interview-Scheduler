import React, { useState, useMemo } from "react";
import { useRound2Slots, Round2TimeSlot } from "../../hooks/useRound2Slots";
import { toast } from "@/hooks/use-toast";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCalendar,
} from "react-icons/hi";
import { VC_PROFILES } from "../../data/vcs";
import { VCProfileCard } from "../../components/VCProfileCard";
import emailjs from "@emailjs/browser";
import { MEET_LINKS } from "../../data/meetLinks";
import { toZonedTime, format as formatTz } from "date-fns-tz";

// Helper to get start of week (Monday)
function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) - 1; // adjust when day is sunday
  return new Date(d.setDate(diff));
  return d;
}

// Helper to format date as YYYY-MM-DD
function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

// Helper to get hour label (e.g., 09:00)
function getHourLabel(hour: number) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const todayDate = formatDate(new Date());

// VC name to company mapping
const vcCompanyMap: Record<string, string> = {
  "jimmy yun": "8VC",
  "irene (heejin) koo": "Soma Capital",
  "andrew martinko": "Velocity",
  "krysta traianovski": "Velocity",
  "mischa hamara": "Next36",
};

function getCompanyForVC(name: string) {
  // Case-insensitive match
  const key = name.trim().toLowerCase();
  return vcCompanyMap[key] || "";
}

const EST_TZ = "America/New_York";

function findMeetLink(vcName: string, dateKey: string, startTime24: string) {
  // Try the exact time first
  let meetKey = `${vcName}|${dateKey}|${startTime24}`;
  if (MEET_LINKS[meetKey]) return MEET_LINKS[meetKey];

  // Try earlier 15-min increments within the hour
  const [hour, minute] = startTime24.split(":").map(Number);
  for (let m = minute - 15; m >= 0; m -= 15) {
    const padded = m.toString().padStart(2, "0");
    meetKey = `${vcName}|${dateKey}|${hour
      .toString()
      .padStart(2, "0")}:${padded}`;
    if (MEET_LINKS[meetKey]) return MEET_LINKS[meetKey];
  }
  // Try the top of the hour
  meetKey = `${vcName}|${dateKey}|${hour.toString().padStart(2, "0")}:00`;
  if (MEET_LINKS[meetKey]) return MEET_LINKS[meetKey];

  return "No link available";
}

const Round2 = () => {
  const { slots, bookings, isLoading, error, bookSlot } = useRound2Slots();
  const [selectedHour, setSelectedHour] = useState<{
    day: string;
    hour: number;
  } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Round2TimeSlot | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedSlot, setConfirmedSlot] = useState<Round2TimeSlot | null>(
    null
  );

  // Group slots by day and hour
  const calendar = useMemo(() => {
    const map: Record<string, Record<number, Round2TimeSlot[]>> = {};
    slots.forEach((slot) => {
      const date = new Date(slot.start_time);
      const day = formatDate(date);
      const hour = date.getHours();
      if (!map[day]) map[day] = {};
      if (!map[day][hour]) map[day][hour] = [];
      map[day][hour].push(slot);
    });
    return map;
  }, [slots]);

  // Get all unique days in this week
  const weekDays = [
    "2025-07-28", // Monday
    "2025-07-29", // Tuesday
    "2025-07-30", // Wednesday
    "2025-07-31", // Thursday
    "2025-08-01", // Friday
  ];

  // Get all unique hours that have at least one slot
  const hours = useMemo(() => {
    const hourSet = new Set<number>();
    slots.forEach((slot) => {
      const hour = new Date(slot.start_time).getHours();
      hourSet.add(hour);
    });
    return Array.from(hourSet).sort((a, b) => a - b);
  }, [slots]);

  // Helper to check if a slot is booked
  const isSlotBooked = (slotId: string) =>
    bookings.some((b) => b.slot_id === slotId);

  // Booking handler
  const handleBook = async () => {
    if (!selectedSlot) return;
    // Prevent double booking by email
    const alreadyBooked = bookings.some(
      (b) => b.email.trim().toLowerCase() === form.email.trim().toLowerCase()
    );
    if (alreadyBooked) {
      toast({
        title: "Already Booked",
        description: "This email has already booked a slot.",
        variant: "destructive",
      });
      return;
    }
    try {
      await bookSlot.mutateAsync({
        slot_id: selectedSlot.id,
        name: form.name,
        email: form.email,
      });

      // Always use EST for all formatting and matching
      const startUTC = new Date(selectedSlot.start_time);
      const endUTC = new Date(selectedSlot.end_time);
      const start = toZonedTime(startUTC, EST_TZ);
      const end = toZonedTime(endUTC, EST_TZ);

      // For link matching
      const dateKey = formatTz(start, "yyyy-MM-dd", { timeZone: EST_TZ });
      const startTime24 = formatTz(start, "HH:mm", { timeZone: EST_TZ });
      const link = findMeetLink(selectedSlot.vc_name, dateKey, startTime24);

      // For email display
      const dateStr = formatTz(start, "EEEE, MMMM d", { timeZone: EST_TZ });
      const startTime = formatTz(start, "h:mm a", { timeZone: EST_TZ });
      const endTime = formatTz(end, "h:mm a", { timeZone: EST_TZ });
      const amOrPm = formatTz(start, "a", { timeZone: EST_TZ });
      const vcName = selectedSlot.vc_name;
      const toName = form.name;
      const toEmail = form.email;

      try {
        await emailjs.send("service_9q7qa88", "template_v1ht2ny", {
          to_name: toName,
          VC_name: vcName,
          date: dateStr,
          interview_start: startTime,
          interview_end: endTime,
          am_or_pm: amOrPm,
          to_email: toEmail,
          link: link,
        });
      } catch (emailErr) {
        toast({
          title: "Email Not Sent",
          description:
            "Your booking was successful, but we could not send a confirmation email. Please contact microgrants@hackthenorth.com.",
          variant: "destructive",
        });
      }

      setConfirmedSlot(selectedSlot);
      setShowConfirmation(true);
      setSelectedSlot(null);
      setForm({ name: "", email: "" });
      setSelectedHour(null);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      toast({
        title: "Booking failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  // Helper for slot card badge
  function getSlotBadge(slot: Round2TimeSlot) {
    const booked = isSlotBooked(slot.id);
    if (booked)
      return (
        <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 text-xs font-semibold">
          Full
        </span>
      );
    return (
      <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
        Available
      </span>
    );
  }

  // Helper for slot time string
  function slotTimeString(slot: Round2TimeSlot) {
    const start = new Date(slot.start_time);
    const end = new Date(slot.end_time);
    return `${start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${end.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Helper for slot date string
  function slotDateString(slot: Round2TimeSlot) {
    const start = new Date(slot.start_time);
    return start.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading slots.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8">
      <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-gray-900">
        Round 2: VC Interview Booking
      </h1>
      <p className="text-blue-600 mb-8 ">
        All times shown are in EST. If you have any concerns or questions, email
        us at{" "}
        <a
          href="mailto:microgrants@hackthenorth.com"
          className="underline hover:text-black"
        >
          microgrants@hackthenorth.com
        </a>{" "}
        .
      </p>
      <div className="overflow-x-auto w-full max-w-6xl">
        <table className="w-full border-separate border-spacing-y-3 border-spacing-x-2">
          <thead>
            <tr>
              <th className="p-3 text-lg font-semibold text-gray-500 bg-transparent text-left">
                Hour
              </th>
              {weekDays.map((day, i) => (
                <th
                  key={day}
                  className={`p-3 text-center text-base font-semibold bg-transparent ${
                    day === todayDate ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  <div className="mb-1">{daysOfWeek[i]}</div>
                  <div className="text-xs font-normal text-gray-400">{day}</div>
                  {day === todayDate && (
                    <div className="mt-1 inline-block px-2 py-0.5 rounded-full bg-blue-100 text-xs text-blue-700 font-bold">
                      Today
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour) => (
              <tr key={hour}>
                <td className="p-3 font-mono text-base text-gray-600 bg-transparent align-middle">
                  {getHourLabel(hour)}
                </td>
                {weekDays.map((day) => {
                  const slotsInCell = calendar[day]?.[hour] || [];
                  const isToday = day === todayDate;
                  const openSlots = slotsInCell.filter(
                    (slot) => !isSlotBooked(slot.id)
                  ).length;
                  const isFull = slotsInCell.length > 0 && openSlots === 0;
                  let cellColor = "";
                  if (isFull) {
                    cellColor = "bg-red-100 border-red-200 text-red-700";
                  } else if (openSlots === 1 || openSlots === 2) {
                    cellColor =
                      "bg-yellow-100 border-yellow-200 text-yellow-800";
                  } else if (openSlots > 2) {
                    cellColor = "bg-green-100 border-green-200 text-green-800";
                  } else {
                    cellColor =
                      "bg-gray-100 text-gray-300 border border-gray-100";
                  }
                  return (
                    <td
                      key={day + hour}
                      className={`align-middle transition rounded-xl text-center font-semibold ${
                        slotsInCell.length > 0
                          ? `${cellColor} hover:shadow-lg hover:ring-2 hover:ring-blue-200 cursor-pointer border` +
                            (isToday ? " ring-2 ring-blue-200" : "")
                          : `bg-gray-100 text-gray-300 border border-gray-100`
                      } px-0 py-0`}
                      style={{ minWidth: 110, height: 60 }}
                      onClick={() =>
                        slotsInCell.length > 0 && setSelectedHour({ day, hour })
                      }
                    >
                      {slotsInCell.length > 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-1">
                          {isFull ? (
                            <span className="text-base">Full</span>
                          ) : openSlots > 0 ? (
                            <span className="text-base">
                              {openSlots} slot{openSlots > 1 ? "s" : ""}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300">
                          <svg
                            width="18"
                            height="18"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="opacity-30"
                          >
                            <circle cx="12" cy="12" r="8" strokeWidth="2" />
                          </svg>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for slots in selected hour */}
      {selectedHour && !selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-blue-100">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Select a Slot
            </h2>
            {/* VC Card at the top */}
            {(() => {
              const slots =
                calendar[selectedHour.day]?.[selectedHour.hour] || [];
              if (slots.length === 0) return null;
              const vcName = slots[0].vc_name;
              const vcProfile = VC_PROFILES.find(
                (vc) => vc.name.toLowerCase() === vcName.toLowerCase()
              );
              return vcProfile ? <VCProfileCard vc={vcProfile} /> : null;
            })()}
            <div className="space-y-4 mb-4">
              {(calendar[selectedHour.day]?.[selectedHour.hour] || []).map(
                (slot) => {
                  const booked = isSlotBooked(slot.id);
                  return (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-150 ${
                        booked
                          ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer"
                      }`}
                      onClick={() => !booked && setSelectedSlot(slot)}
                    >
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center">
                          <HiOutlineClock className="mr-2 text-lg" />
                          {slotTimeString(slot)}
                          {getSlotBadge(slot)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <HiOutlineUser className="mr-1" />
                          {slot.vc_name}
                          <span className="ml-1 text-gray-400">
                            – {getCompanyForVC(slot.vc_name)}
                          </span>
                        </div>
                      </div>
                      <div>
                        {booked ? (
                          <span className="text-gray-400 font-semibold">
                            Full
                          </span>
                        ) : (
                          <span className="text-blue-600 font-semibold">
                            Click to book
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
            <button
              className="mt-2 text-gray-500 underline w-full text-base"
              onClick={() => {
                setSelectedHour(null);
                setSelectedSlot(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {selectedSlot && !showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-blue-100">
            <button
              className="mb-4 text-gray-500 hover:text-blue-600 flex items-center"
              onClick={() => setSelectedSlot(null)}
            >
              <span className="mr-2">←</span> Back
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Book Your Interview
            </h2>
            <div className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="font-semibold text-blue-900 mb-1 flex items-center">
                <HiOutlineCalendar className="mr-2" />
                {slotDateString(selectedSlot)}
              </div>
              <div className="text-sm text-blue-800 flex items-center">
                <HiOutlineClock className="mr-2" />
                {slotTimeString(selectedSlot)}
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {selectedSlot.vc_name} – {getCompanyForVC(selectedSlot.vc_name)}
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBook();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <HiOutlineUser className="mr-2" /> Full Name
                </label>
                <input
                  className="border p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <HiOutlineMail className="mr-2" /> Email Address
                </label>
                <input
                  className="border p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-200"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  required
                  type="email"
                />
              </div>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full font-semibold shadow hover:bg-blue-600 transition disabled:opacity-60"
                type="submit"
                disabled={bookSlot.status === "pending"}
              >
                Confirm My Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-blue-100">
            <div className="flex flex-col items-center">
              <HiOutlineCheckCircle className="text-green-500 text-5xl mb-2" />
              <h2 className="text-2xl font-bold mb-2 text-gray-900">
                Booking Confirmed!
              </h2>
              <p className="mb-4 text-gray-700 text-center">
                Thank you! Your interview slot has been successfully booked.
              </p>
              <div className="w-full mb-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="font-semibold text-blue-900 mb-1 flex items-center">
                  <HiOutlineCalendar className="mr-2" />
                  {confirmedSlot ? slotDateString(confirmedSlot) : ""}
                </div>
                <div className="text-sm text-blue-800 flex items-center">
                  <HiOutlineClock className="mr-2" />
                  {confirmedSlot ? slotTimeString(confirmedSlot) : ""}
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  {confirmedSlot
                    ? `${confirmedSlot.vc_name} – ${getCompanyForVC(
                        confirmedSlot.vc_name
                      )}`
                    : ""}
                </div>
              </div>
              <div className="w-full mb-4 p-4 rounded-lg bg-green-50 border border-green-100">
                <div className="font-bold text-green-900 mb-1">
                  What's Next?
                </div>
                <ul className="list-disc pl-5 text-green-900 text-sm">
                  <li>
                    Check your email for the Google Meet link and meeting
                    details
                  </li>
                  <li>Add the interview to your calendar</li>
                  <li>Test your camera and microphone before the session</li>
                  <li>Join the meeting 3-5 minutes early</li>
                </ul>
              </div>
              <div className="w-full mb-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <span className="font-semibold text-yellow-900">
                  Important:
                </span>{" "}
                If you need to cancel or reschedule, please contact us at least
                5 hours before your scheduled time.
              </div>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full font-semibold shadow hover:bg-blue-600 transition mt-2"
                onClick={() => setShowConfirmation(false)}
              >
                Thanks!
              </button>
              <div className="mt-4 text-xs text-gray-500 text-center">
                Need help? Contact us at{" "}
                <a
                  href="mailto:microgrants@hackthenorth.com"
                  className="underline"
                >
                  microgrants@hackthenorth.com
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Round2;

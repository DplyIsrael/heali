/**
 * Generate a Google Calendar "Add Event" deep-link URL.
 */
export function generateGoogleCalendarLink(params: {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes?: number;
  location?: string;
  description?: string;
}): string {
  const { title, date, time, durationMinutes = 60, location, description } = params;

  // Parse date and time
  const [year, month, day] = date.split("-");
  const [hour, min] = time.split(":");

  const startDate = `${year}${month}${day}T${hour}${min}00`;

  // Calculate end time
  const startMinutes = parseInt(hour) * 60 + parseInt(min);
  const endMinutes = startMinutes + durationMinutes;
  const endH = Math.floor(endMinutes / 60).toString().padStart(2, "0");
  const endM = (endMinutes % 60).toString().padStart(2, "0");
  const endDate = `${year}${month}${day}T${endH}${endM}00`;

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", title);
  url.searchParams.set("dates", `${startDate}/${endDate}`);
  if (location) url.searchParams.set("location", location);
  if (description) url.searchParams.set("details", description);

  return url.toString();
}

/**
 * Generate a Waze deep-link URL for navigation.
 */
export function generateWazeLink(address: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
}

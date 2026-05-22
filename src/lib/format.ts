export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatTimeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}

export function formatBudget(min: number | null, max: number | null): string {
  if (min != null && max != null) return `R${min} – R${max}`;
  if (min != null) return `From R${min}`;
  if (max != null) return `Up to R${max}`;
  return "Budget TBD";
}

export function formatMemberSince(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-ZA", {
    month: "short",
    year: "numeric",
  });
}

export function formatBookingDate(dateString: string) {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString("en-ZA", { month: "short" }),
    time: date.toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

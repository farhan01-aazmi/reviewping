import { D } from "../data/constants";

export function fmtDate(ts) {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function exportCSV(reviews) {
  const hdr = "Name,Service,Rating,Status,Channel,Date\n";
  const rows = reviews
    .map(
      (r) =>
        `"${r.name}","${r.service}",${r.rating || ""},${r.status},${r.channel},"${new Date(r.sentAt).toLocaleDateString()}"`
    )
    .join("\n");
  const blob = new Blob([hdr + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reviewping-export.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function computeStats(reviews) {
  const done = reviews.filter((r) => r.status === "reviewed");
  const pending = reviews.filter((r) => r.status === "pending");
  const avg = done.length
    ? (done.reduce((s, r) => s + (r.rating || 0), 0) / done.length).toFixed(1)
    : "—";
  const week = done.filter((r) => r.sentAt > Date.now() - 7 * D).length;
  const rate = reviews.length
    ? Math.round((done.length / reviews.length) * 100)
    : 0;
  return { done, pending, avg, week, rate };
}

export function getRating(r) {
  if (r.rating === null || r.rating === undefined) return -1;
  return r.rating;
}

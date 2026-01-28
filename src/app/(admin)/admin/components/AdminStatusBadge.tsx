type Props = {
  status: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function AdminStatusBadge({ status }: Props) {
  const normalized = String(status).toLowerCase();
  const label = STATUS_LABELS[normalized] ?? status;

  return (
    <span
      className={`admin-status admin-status-${normalized}`}
    >
      {label}
    </span>
  );
}

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

const TIMELINE: {
  key: Exclude<OrderStatus, "cancelled">;
  label: string;
}[] = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderStatusTimeline({
  status,
}: {
  status: OrderStatus;
}) {
  if (status === "cancelled") {
    return (
      <div
        style={{
          padding: "12px",
          background: "#fee2e2",
          color: "#b91c1c",
          borderRadius: "8px",
          fontWeight: 600,
        }}
      >
        ❌ This order has been cancelled
      </div>
    );
  }

  const currentIndex = TIMELINE.findIndex(
    (step) => step.key === status
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "30px",
        gap: "8px",
        flexWrap: "wrap",
      }}
    >
      {TIMELINE.map((step, index) => {
        const completed = index < currentIndex;
        const active = index === currentIndex;

        return (
          <div
            key={step.key}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px",
              borderRadius: "8px",
              background: completed
                ? "#22c55e"
                : active
                ? "#000"
                : "#e5e7eb",
              color:
                completed || active ? "#fff" : "#555",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            {completed && "✔ "}
            {active && "⏳ "}
            {step.label}
          </div>
        );
      })}
    </div>
  );
}

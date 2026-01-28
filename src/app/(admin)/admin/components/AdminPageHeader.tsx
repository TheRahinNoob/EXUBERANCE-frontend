"use client";

import React from "react";

type Props = {
  title: string;
  description?: string;
  rightSlot?: React.ReactNode;
};

export default function AdminPageHeader({
  title,
  description,
  rightSlot,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
      }}
    >
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>
          {title}
        </h1>
        {description && (
          <p
            style={{
              marginTop: 4,
              color: "#6b7280",
            }}
          >
            {description}
          </p>
        )}
      </div>

      {rightSlot && (
        <div style={{ marginLeft: 16 }}>
          {rightSlot}
        </div>
      )}
    </div>
  );
}

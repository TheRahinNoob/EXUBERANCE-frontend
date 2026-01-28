"use client";

import React from "react";

/* ==================================================
   TYPES
================================================== */

type Props = {
  children: React.ReactNode;
};

/* ==================================================
   COMPONENT
================================================== */

export default function AdminTable({ children }: Props) {
  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        {children}
      </table>
    </div>
  );
}

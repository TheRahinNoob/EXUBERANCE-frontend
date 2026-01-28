"use client";

import React from "react";

/* ==================================================
   TYPES
================================================== */

type Props = {
  /** Table content (thead, tbody, tr, etc.) */
  children: React.ReactNode;

  /** Optional extra class for the <table> element */
  className?: string;

  /** Optional class for the outer wrapper */
  wrapperClassName?: string;
};

/* ==================================================
   COMPONENT
================================================== */

export default function AdminTable({
  children,
  className = "",
  wrapperClassName = "",
}: Props) {
  return (
    <div className={`admin-table-wrapper ${wrapperClassName}`.trim()}>
      <table className={`admin-table ${className}`.trim()}>
        {children}
      </table>
    </div>
  );
}

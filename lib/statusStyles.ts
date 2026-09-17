const statusClasses = {
  blue: "bg-[#dbeafe] text-[#1e40af]",
  green: "bg-[#dcfce7] text-[#166534]",
  amber: "bg-[#fef3c7] text-[#92400e]",
  red: "bg-[#fee2e2] text-[#991b1b]",
  neutral: "bg-slate-100 text-slate-700",
} as const;

export function getEnquiryStatusClass(status: string) {
  if (status === "New") return statusClasses.blue;
  if (status === "Contacted") return statusClasses.green;
  if (status === "Interested") return statusClasses.amber;
  if (status === "Closed") return statusClasses.red;
  return statusClasses.neutral;
}

export function getPropertyStatusClass(status: string) {
  if (status === "Available") return statusClasses.green;
  if (status === "Reserved") return statusClasses.amber;
  if (status === "Sold") return statusClasses.red;
  return statusClasses.neutral;
}

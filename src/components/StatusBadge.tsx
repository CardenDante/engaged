interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-100 text-green-700" },
  matched: { label: "Matched", className: "bg-blue-100 text-blue-700" },
  married: { label: "Married", className: "bg-purple-100 text-purple-700" },
  disabled: { label: "Disabled", className: "bg-gray-100 text-gray-500" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.active;
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}

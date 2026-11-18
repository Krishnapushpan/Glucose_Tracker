export default function ReportCard({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  accent = 'teal',
}) {
  const accentStyles = {
    teal: {
      iconBg: 'bg-[#e3f1eb] text-[#267464]',
      valueColor: 'text-[#267464]',
      borderHover: 'hover:border-[#48a992]/45',
    },
    sage: {
      iconBg: 'bg-[#48a992]/15 text-[#267464]',
      valueColor: 'text-[#48a992]',
      borderHover: 'hover:border-[#48a992]/45',
    },
    coral: {
      iconBg: 'bg-[#ec4d43]/15 text-[#ec4d43]',
      valueColor: 'text-[#ec4d43]',
      borderHover: 'hover:border-[#ec4d43]/40',
    },
    forest: {
      iconBg: 'bg-[#267464]/15 text-[#1e6355]',
      valueColor: 'text-[#1e6355]',
      borderHover: 'hover:border-[#267464]/40',
    },
  };

  const styles = accentStyles[accent] || accentStyles.teal;

  return (
    <div
      className={`rounded-2xl border border-[#48a992]/20 bg-[#fafcf9] p-5 shadow-sm transition-all duration-200 ${styles.borderHover} hover:shadow-md`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5b7670]">
          {label}
        </p>
        {Icon && (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles.iconBg}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={`font-display text-3xl font-bold ${styles.valueColor}`}>
          {value ?? '—'}
        </span>
        {value !== null && value !== undefined && unit && (
          <span className="text-xs font-medium text-[#6d8781]">{unit}</span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-[#5b7670]">{subtext}</p>
      )}
    </div>
  );
}

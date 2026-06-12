import { Calendar } from 'lucide-react';

// Available time periods for stock comparison
const PERIODS = [
  { value: '1M', label: '1 Month' },
  { value: '3M', label: '3 Months' },
  { value: '6M', label: '6 Months' },
  { value: '1Y', label: '1 Year' },
  { value: '2Y', label: '2 Years' },
  { value: '5Y', label: '5 Years' },
  { value: '10Y', label: '10 Years' },
  { value: '20Y', label: '20 Years' },
];

/**
 * TimePeriodDropdown — a styled <select> for choosing a comparison timeframe.
 *
 * Props:
 *   value    – currently selected period code, e.g. '1Y'
 *   onChange – callback receiving the new period code
 */
export default function TimePeriodDropdown({ value, onChange, disabled }) {
  return (
    <div className="dropdown-wrapper">
      {/* Label with calendar icon */}
      <label className="dropdown-label" htmlFor="period-select">
        <Calendar size={14} className="label-icon" />
        Time Period
      </label>

      <select
        id="period-select"
        className="dropdown period-dropdown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {/* Placeholder */}
        <option value="" disabled>
          Pick a time range...
        </option>

        {PERIODS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
}

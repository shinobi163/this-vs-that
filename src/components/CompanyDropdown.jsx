import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import companies from '../data/companies';

/**
 * CompanyDropdown — a styled <select> that groups companies by sector.
 *
 * Props:
 *   value    – currently selected ticker (string)
 *   onChange – callback receiving the new ticker string
 */
export default function CompanyDropdown({ value, onChange, disabled }) {
  // Group companies by their sector for clean optgroup rendering
  const groupedBySector = useMemo(() => {
    const groups = {};
    companies.forEach((company) => {
      const sector = company.sector || 'Other';
      if (!groups[sector]) groups[sector] = [];
      groups[sector].push(company);
    });
    return groups;
  }, []);

  const sectorNames = Object.keys(groupedBySector).sort();

  return (
    <div className="dropdown-wrapper">
      {/* Label with icon */}
      <label className="dropdown-label" htmlFor="company-select">
        <BarChart3 size={14} className="label-icon" />
        Company
      </label>

      <select
        id="company-select"
        className="dropdown company-dropdown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {/* Placeholder */}
        <option value="" disabled>
          Pick a company...
        </option>

        {/* Render each sector as an optgroup */}
        {sectorNames.map((sector) => (
          <optgroup key={sector} label={sector}>
            {groupedBySector[sector].map((company) => (
              <option key={company.ticker} value={company.ticker}>
                {company.name} ({company.ticker})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

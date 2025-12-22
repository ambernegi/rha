"use client";

import { allCountries } from "country-telephone-data";

type CountryOption = {
  name: string;
  iso2: string;
  dialCode: string;
};

function flagEmojiFromIso2(iso2: string) {
  // Convert "in" -> 🇮🇳 using regional indicator symbols.
  const upper = iso2.toUpperCase();
  const A = 0x41;
  const REGIONAL_INDICATOR_A = 0x1f1e6;
  const chars = Array.from(upper).map((c) => REGIONAL_INDICATOR_A + (c.charCodeAt(0) - A));
  return String.fromCodePoint(...chars);
}

const COUNTRIES: CountryOption[] = allCountries
  .map((c: any) => ({
    name: String(c.name),
    iso2: String(c.iso2),
    dialCode: String(c.dialCode),
  }))
  // Some datasets contain duplicates; keep simple ordering.
  .sort((a, b) => a.name.localeCompare(b.name));

export type PhoneNumberValue = {
  countryIso2: string;
  nationalNumber: string;
};

type Props = {
  value: PhoneNumberValue;
  onChange: (value: PhoneNumberValue) => void;
  defaultCountryIso2?: string; // e.g. "in"
  label?: string;
};

export function toE164Phone(value: PhoneNumberValue) {
  const country = COUNTRIES.find((c) => c.iso2 === value.countryIso2);
  const digits = value.nationalNumber.replace(/[^\d]/g, "");
  if (!country || !digits) return null;
  return `+${country.dialCode}${digits}`;
}

export function PhoneNumberInput({
  value,
  onChange,
  defaultCountryIso2 = "in",
  label = "Phone",
}: Props) {
  const countryIso2 = value.countryIso2 || defaultCountryIso2;
  const selected = COUNTRIES.find((c) => c.iso2 === countryIso2) ?? COUNTRIES[0];

  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(150px, 0.9fr) 1.1fr", gap: "0.6rem" }}>
        <select
          value={selected.iso2}
          onChange={(e) => onChange({ ...value, countryIso2: e.target.value })}
        >
          {COUNTRIES.map((c) => (
            <option key={c.iso2} value={c.iso2}>
              {flagEmojiFromIso2(c.iso2)} {c.name} (+{c.dialCode})
            </option>
          ))}
        </select>
        <input
          inputMode="tel"
          placeholder="Phone number"
          value={value.nationalNumber}
          onChange={(e) => onChange({ ...value, countryIso2: selected.iso2, nationalNumber: e.target.value })}
        />
      </div>
      <span className="muted" style={{ fontSize: "0.8rem" }}>
        Selected: {flagEmojiFromIso2(selected.iso2)} +{selected.dialCode}
      </span>
    </div>
  );
}



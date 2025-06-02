"use client";

import { COUNTRIES } from "@/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (countryCode: string) => void;
}

export default function CountrySelector({ selectedCountry, onCountryChange }: CountrySelectorProps) {
  return (
    <Select value={selectedCountry} onValueChange={onCountryChange}>
      <SelectTrigger className="w-[180px] mb-6">
        <SelectValue placeholder="Select Country" />
      </SelectTrigger>
      <SelectContent>
        {COUNTRIES.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

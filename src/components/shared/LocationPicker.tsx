"use client";

import { useMemo } from "react";
import { SelectInput } from "~/components/dynamic-input";
import wardData from "~/data/nigeria-wards.json";

type WardData = Record<string, Record<string, string[]>>;
const NIGERIA_WARDS = wardData as WardData;

export interface LocationValue {
  state: string;
  lga: string;
  ward: string;
}

interface LocationPickerProps {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  required?: boolean;
  includeWard?: boolean;
  /**
   * States open for selection (admin-controlled via PlatformSettings). States
   * outside this list still show in the dropdown but are disabled with a
   * "Coming soon" label — undefined means "not loaded yet", so nothing is
   * restricted rather than falsely locking every state.
   */
  activeStates?: string[];
}

// Cascading State -> LGA -> Ward picker backed by the nationwide dataset
// (37 states, 774 LGAs, 8,809 wards) sourced from
// https://github.com/temikeezy/nigeria-geojson-data. State/LGA/Ward names
// are sent to the backend verbatim (not slugs) since that's the format
// already stored in `location_lga`/`location_ward` and matched against for
// cluster-region scoping and marketplace filtering.
export function LocationPicker({
  value,
  onChange,
  required = false,
  includeWard = true,
  activeStates,
}: LocationPickerProps) {
  const stateOptions = useMemo(() => {
    const allStates = Object.keys(NIGERIA_WARDS).sort();
    return allStates.map((state) => {
      const isActive = !activeStates || activeStates.includes(state);
      return {
        label: isActive ? state : `${state} (Coming soon)`,
        value: state,
        disabled: !isActive,
      };
    });
  }, [activeStates]);

  const lgaOptions = useMemo(() => {
    const lgas = value.state ? NIGERIA_WARDS[value.state] : undefined;
    return lgas ? Object.keys(lgas).sort().map((lga) => ({ label: lga, value: lga })) : [];
  }, [value.state]);

  const wardOptions = useMemo(() => {
    const wards = value.state && value.lga ? NIGERIA_WARDS[value.state]?.[value.lga] : undefined;
    return (wards ?? []).map((ward) => ({ label: ward, value: ward }));
  }, [value.state, value.lga]);

  return (
    <>
      <SelectInput
        label="State"
        value={value.state}
        onValueChange={(state) => onChange({ state, lga: "", ward: "" })}
        options={stateOptions}
        required={required}
      />
      <SelectInput
        label="Local Government Area"
        value={value.lga}
        onValueChange={(lga) => onChange({ ...value, lga, ward: "" })}
        options={lgaOptions}
        required={required}
      />
      {includeWard && (
        <SelectInput
          label="Ward / Community"
          value={value.ward}
          onValueChange={(ward) => onChange({ ...value, ward })}
          options={wardOptions}
        />
      )}
    </>
  );
}

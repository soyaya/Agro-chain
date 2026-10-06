"use client";

import { useEffect, useMemo, useState } from "react";
import { SelectInput } from "~/components/dynamic-input";
import wardData from "~/data/nigeria-wards.json";
import { locationService } from "~/lib/services/location.service";

type WardData = Record<string, Record<string, string[]>>;
const NIGERIA_WARDS = wardData as WardData;

export interface LocationValue {
  state: string;
  lga: string;
  ward: string;
  subCommunity: string;
  latitude?: number;
  longitude?: number;
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

// Cascading State -> LGA -> Ward -> Sub-community picker. State/LGA/Ward are
// backed by the nationwide dataset (37 states, 774 LGAs, 8,809 wards)
// sourced from https://github.com/temikeezy/nigeria-geojson-data. The
// sub-community level is finer still (e.g. "Gonin Gora" under Kakau ward)
// and comes from the GRID3 settlement dataset (292k+ points) ingested into
// the backend's SettlementPoint table — fetched live as the user types,
// since it's too large to ship client-side, and ward-scoped so each lookup
// is always small. State/LGA/Ward/sub-community names are sent to the
// backend verbatim (not slugs) since that's the format already stored in
// `location_lga`/`location_ward` and matched against for cluster-region
// scoping and marketplace filtering.
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

  const [subCommunityQuery, setSubCommunityQuery] = useState("");
  const [subCommunityOptions, setSubCommunityOptions] = useState<
    { label: string; value: string; latitude: number; longitude: number }[]
  >([]);

  // Debounced, ward-scoped fetch — re-fires on every keystroke after a
  // short pause, and whenever the parent ward changes (e.g. to reset the
  // list when a different ward is picked).
  useEffect(() => {
    if (!value.state || !value.lga || !value.ward) {
      setSubCommunityOptions([]);
      return;
    }
    const timer = setTimeout(() => {
      locationService
        .getSubCommunities(value.state, value.lga, value.ward, subCommunityQuery)
        .then((res) => {
          setSubCommunityOptions(
            res.data.settlements.map((s) => ({
              label: s.name,
              value: s.name,
              latitude: s.latitude,
              longitude: s.longitude,
            })),
          );
        })
        .catch(() => setSubCommunityOptions([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [value.state, value.lga, value.ward, subCommunityQuery]);

  const handleSubCommunityChange = (subCommunity: string) => {
    const match = subCommunityOptions.find((o) => o.value === subCommunity);
    onChange({ ...value, subCommunity, latitude: match?.latitude, longitude: match?.longitude });
  };

  return (
    <>
      <SelectInput
        label="State"
        value={value.state}
        onValueChange={(state) => onChange({ state, lga: "", ward: "", subCommunity: "" })}
        options={stateOptions}
        required={required}
        searchable
        searchPlaceholder="Search states..."
      />
      <SelectInput
        label="Local Government Area"
        value={value.lga}
        onValueChange={(lga) => onChange({ ...value, lga, ward: "", subCommunity: "" })}
        options={lgaOptions}
        required={required}
        searchable
        searchPlaceholder="Search LGAs..."
      />
      {includeWard && (
        <>
          <SelectInput
            label="Ward / Community"
            value={value.ward}
            onValueChange={(ward) => onChange({ ...value, ward, subCommunity: "" })}
            options={wardOptions}
            searchable
            searchPlaceholder="Search wards..."
          />
          {value.ward && (
            <SelectInput
              label="Sub-community (optional)"
              value={value.subCommunity}
              onValueChange={handleSubCommunityChange}
              options={subCommunityOptions}
              searchable
              searchPlaceholder="Type to search, e.g. Gonin Gora..."
              onSearchChange={setSubCommunityQuery}
            />
          )}
        </>
      )}
    </>
  );
}

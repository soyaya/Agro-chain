// TEMPORARY hardcoded fallback list. PulseMFB's Postman collection documents no
// "list bank codes" endpoint — only these three example codes. Replace with a real
// source (a PulseMFB bank-list endpoint, or the NIBSS bank code list) once available.
export const NIGERIAN_BANK_CODES: { label: string; value: string }[] = [
  { label: "Pulse MFB", value: "090713" },
  { label: "GTBank", value: "058" },
  { label: "Access Bank", value: "044" },
];

import type { EvidenceEntry } from "../../gameplay/evidence/evidenceTypes";

export const EV_SHIFT_LOG = "ev_shift_log";
export const EV_DATA_SHARD = "ev_data_shard";
export const EV_HVAC_SPIKE = "ev_hvac_spike";

export const EVIDENCE_ENTRIES: readonly EvidenceEntry[] = [
  {
    id: EV_SHIFT_LOG,
    title: "Shift Log — 02:47",
    category: "document",
    summary: "Vance left the west wing and never logged out. Lockdown keeps trying to reset itself.",
    body: [
      "SHIFT LOG — 02:47 LOCAL",
      "Dr. Vance cleared the west wing at 02:14 and did not log out.",
      "",
      "Power draw on Server B spiked 340% at 02:22. HVAC overcompensated.",
      "Lockdown attempted self-reset three times. Access denied — override expected.",
      "",
      "Storm intensity is holding. Backup cells are warm but not engaged.",
      "Security feed on the east hallway is masked. The node has been lying since 02:31.",
    ].join("\n"),
  },
  {
    id: EV_DATA_SHARD,
    title: "Amber Data Shard",
    category: "object",
    summary: "Personal shard, not facility-issued. Warm to the touch, still drawing trickle power.",
    body: [
      "A thumb-sized shard in an amber housing. The case is scuffed along one edge — carried,",
      "not shelved. Facility shards are steel-grey; this one is personal.",
      "",
      "The status LED pulses slow amber. Encrypted, but live. Something kept it warm until",
      "very recently.",
    ].join("\n"),
  },
  {
    id: EV_HVAC_SPIKE,
    title: "HVAC Vent — Cold Draft",
    category: "observation",
    summary: "South vent is pulling hard against the override. The intake is fighting something upstream.",
    body: [
      "The south vent is working much harder than the others. A cold draft bleeds from the",
      "grille and the metal ticks under load.",
      "",
      "Consistent with the 02:22 overcompensation in the shift log: the system is still",
      "trying to dump heat from Server B, which means Server B is still drawing. Whatever",
      "happened at 02:22 did not end at 02:22.",
    ].join("\n"),
  },
];

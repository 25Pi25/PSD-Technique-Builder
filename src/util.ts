import { traits } from './traits';
import type { Slot, SlotState, TechDefault, Technique, TechniqueSet, Trait, TraitState } from './types';
import { skills } from './types'

// Does NOT check for cyclical dependencies. Check first before running.
export function getTechniqueCost(technique: Slot, techniques: TechniqueSet, techDefaults: TechDefault[] = [], inSplitStrike = false) {
  if (!technique) return 0;
  let total = 0;
  // Adding tech defaults from traits
  for (const techDefault of getTechDefaults(technique)) {
    techDefaults.push({ id: globalThis.crypto.randomUUID(), name: techDefault, inputTarget: null });
  }
  // SPECIAL: Quake/Underfoot adding earth and rumble elements
  if (!technique.traits.some(trait => trait.name === "Element" && !["Earth", "Rumble"].includes(trait.name))) {
    if (technique.traits.some(trait => trait.name === "Quake" || trait.name === "Underfoot")) {
      techDefaults.push({ id: globalThis.crypto.randomUUID(), name: "Element", inputTarget: "Earth" });
      techDefaults.push({ id: globalThis.crypto.randomUUID(), name: "Element", inputTarget: "Rumble" });
    }
  }

  for (const state of technique.traits) {
    const cost = getTraitCost(state, techniques, technique, techDefaults, inSplitStrike);
    if (cost === null) return null;
    total += cost;
  }
  return total;
}

export function getTraitCost(traitState: TraitState, techniques: TechniqueSet, technique: Technique, techDefaults: TechDefault[] = [], inSplitStrike = false) {
  const trait = traits[traitState.name];
  let cost;
  if (typeof trait.cost === "function") {
    const linkedSlots = traitState.slots?.map(slotState => getTechnique(slotState, techniques))
    // linkedSlots is defaulted because i couldn't be bothered to make it nullable
    const calcCost = trait.cost({ slotStates: traitState.slots ?? [], slots: linkedSlots ?? [], set: techniques, technique, techDefaults });
    cost = calcCost;
    if (cost !== null && trait.name === "Self" && inSplitStrike) { // Special rule for Self
      cost -= 1;
    }
  } else cost = trait.cost;
  // tech default disabling
  const techIndex = techDefaults?.findIndex(({ name, inputTarget }) => name === trait.name && (!inputTarget || traitState.inputValue === inputTarget))
  if (techIndex !== undefined && techIndex !== -1) {
    cost = 0;
    techDefaults!.splice(techIndex, 1);
  }

  if (cost === null) return traitState.newCost ?? null;
  const isPositive = trait.traitType === "Positive" || (trait.traitType === "Either" && traitState.isPositive);
  if (isPositive) return Math.max(cost, 0);
  return Math.min(cost, 0);
}

export function getPrimarySkills(technique: Technique) {
  if (technique.traits.some(trait => trait.name === "Alt-Skill" && trait.inputValue === "Primary")) {
    return [...skills];
  }
  if (technique.traits.some(trait => trait.name === "Harmless")) {
    return [];
  }
  const primarySets = technique.traits.flatMap(state => traits[state.name].primarySkills);
  const mainSet = new Set(primarySets.some(set => set?.newDefault) ? [] : ["Coordination"])
  for (const primarySet of primarySets) {
    if (!primarySet) continue;
    primarySet.skills.forEach(skill => mainSet.add(skill));
  }
  return [...mainSet];
}

export function getSecondarySkills(technique: Technique) {
  const secondarySets = technique.traits.flatMap(state => traits[state.name].tags?.flatMap(tag => tag.secondarySkills) ?? []);
  const boostInputs = technique.traits.filter(state => state.name === "Boost").map(state => state.inputValue);
  const mainSet = new Set<string>();
  for (const secondarySkill of secondarySets) {
    if (!secondarySkill) continue;
    mainSet.add(secondarySkill);
  }
  for (const boostInput of boostInputs) {
    if (!boostInput) continue;
    switch (boostInput) {
      case "Attack":
        mainSet.add("Athletics");
        mainSet.add("Coordination");
        break;
      case "Block":
        mainSet.add("Block");
        break;
      case "Dodge":
        mainSet.add("Trickery");
        break;
      default:
        mainSet.add(boostInput);
        break;
    }
  }
  if (mainSet.size > 0 && technique.traits.some(trait => trait.name === "Alt-Skill" && trait.inputValue === "Secondary")) {
    return [...skills];
  }
  return [...mainSet];
}

export function getTechDefaults(technique: Technique) {
  return technique.traits.flatMap(traitState => traits[traitState.name].techDefaults ?? []);
}

export function getTechnique(techUuid: SlotState | string | null, set: TechniqueSet): Technique | null {
  return techUuid === null ? null : set[typeof techUuid === "string" ? techUuid : techUuid.name] ?? null;
}

export function toModString(number: number): string {
  if (number < 0) return number.toString();
  return `+${number}`;
}

export function traitToFPString(trait: Trait) {
  return toFPString(typeof trait.cost === 'number' ? trait.cost : null, trait.traitType !== "Negative");
}

export function toFPString(value: number | null, unknownPositive = true) {
  return value !== null ? toModString(value) : unknownPositive ? "+???" : "-???";
}

export function compareTrait(a: Trait, b: Trait): number {
  if (a.traitType === "Negative" && b.traitType !== "Negative") return 1;
  if (a.traitType !== "Negative" && b.traitType === "Negative") return -1;
  if (typeof a.cost !== "number" && typeof b.cost === "number") return 1;
  if (typeof a.cost === "number" && typeof b.cost !== "number") return -1;
  if (typeof a.cost !== "number" && typeof b.cost !== "number") return 0;
  return Math.abs(a.cost as number) - Math.abs(b.cost as number);
}

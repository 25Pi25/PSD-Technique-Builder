import { traits } from './traits';
import { Warnings, type TechDefault, type Technique, type TechniqueSet, type Trait } from './types';
import { getPrimarySkills, getSecondarySkills, getTechnique, getTechniqueCost } from './util';

export function validate(techniques: TechniqueSet, techDefaults: TechDefault[]): Warnings {
  const warnings = new Warnings();
  // Check all cyclic dependencies before making potential infinite recursive calls
  let cyclicDetection = false;
  for (const technique of Object.values(techniques)) {
    if (isCyclic(technique, techniques)) {
      warnings.add(`${technique.name} has a cyclic dependency. Cannot provide further warnings until resolved.`, technique);
      cyclicDetection = true;
    }
  }
  if (cyclicDetection) return warnings;

  // TODO: do a negative trait by level check

  for (const technique of Object.values(techniques)) {
    validateChecks(technique, warnings);
    validateTraitStacks(technique, warnings);
    validateTagStacks(technique, warnings);
    for (const trait of technique.traits) {
      traits[trait.name].validate?.({ technique, techniques, state: trait, trait: traits[trait.name], warnings });
    }
    if (getTechniqueCost(technique, techniques, techDefaults) === null) {
      warnings.add(`${technique.name} has an indeterminate FP cost.`, technique);
    }
  }
  return warnings;
}

export function validateTagStacks(technique: Technique, warnings: Warnings) {
  // TODO: recursively check approach/target unless it has split
  const tagCounter: Record<string, number> = {};
  const seenTraits = new Set();
  for (const trait of technique.traits) {
    if (seenTraits.has(trait.name)) continue;
    seenTraits.add(trait.name);
    for (const tag of traits[trait.name].tags ?? []) {
      tagCounter[tag.name] ??= 0;
      tagCounter[tag.name]++;
    }
  }
  for (const [tagName, count] of Object.entries(tagCounter)) {
    if (["Approach", "Target", "Random", "Strikes"].includes(tagName) && count > 1) {
      // This is the ONE exception for overlapping trait tags
      if (tagName === "Random" && count === 2 && seenTraits.has("Fumble") && seenTraits.has("Lucky Hit")) continue;
      warnings.add(`${count} trait(s) listed under ${tagName}, which cannot overlap.`, technique);
    }
  }
}

export function validateChecks(technique: Technique, warnings: Warnings) {
  const primarySkills = getPrimarySkills(technique);
  if (!primarySkills.some(skill => skill === technique.primarySkill)) {
    warnings.add("Primary skill is invalid. It must be granted by a trait or by default.", technique);
  }
  const secondarySkills = getSecondarySkills(technique);
  if (secondarySkills.every(skill => skill !== technique.secondarySkill) && technique.secondarySkill !== null) {
    warnings.add("Secondary skill is invalid. It must be granted by a trait.", technique);
  }
}

export function validateTraitStacks(technique: Technique, warnings: Warnings) {
  const traitCounter: Record<string, number> = {};
  for (const trait of technique.traits) {
    traitCounter[trait.name] ??= 0;
    traitCounter[trait.name]++;
  }
  for (const [traitName, count] of Object.entries(traitCounter)) {
    const trait = traits[traitName];
    const canStack = trait.tags?.some(tag => tag.name === "X") ?? false;
    const stackCap = trait.tags?.find(tag => tag.name === "X")?.stackCap;
    if (!canStack && count > 1) {
      warnings.add(`Cannot have multiple ${traitName} because it does not stack.`, technique, traitName);
    }
    if (canStack && stackCap !== undefined && count > stackCap) {
      warnings.add(`${traitName} exceeds the stack cap of ${stackCap}: got ${count} instead.`, technique, traitName);
    }
  }
}

export function isCyclic(technique: Technique, techniques: TechniqueSet, seen?: Set<Technique>): boolean {
  seen ??= new Set();
  if (seen.has(technique)) return true;
  seen.add(technique);
  for (const trait of technique.traits) {
    if (!trait.slots) continue;
    for (const techId of trait.slots) {
      const technique = getTechnique(techId, techniques);
      if (technique === null) continue;
      return isCyclic(technique, techniques, new Set([...seen]));
    }
  }
  return false;
}

export function validateUniqueInputs(traitName: string): Exclude<Trait['validate'], undefined> {
  return ({ technique, warnings }) => {
    const allInputs = technique.traits.filter(trait => trait.name === traitName).map(trait => trait.inputValue);
    if (new Set(allInputs).size !== allInputs.length) {
      warnings.add(`${traitName} has duplicate choices. They must be unique.`, technique, traitName);
      return false;
    }
    return true;
  }
}
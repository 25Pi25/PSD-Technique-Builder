import { type Trait, skills } from './types';
import { getTechniqueCost, getTraitCost, getTechnique, getPrimarySkills, getSecondarySkills } from './util';
import { validateUniqueInputs } from './validate';

export const positiveTraits: Record<string, Trait> = {
  "Aerial": {
    name: "Aerial",
    traitType: "Positive",
    description: "At the user's discretion, this Technique's Primary Check can use **Athletics**. The user flies through the air to deliver an attack, striking from above. This allows the user to Target any Position within the Target Group, though they may struggle to hit Targets who are obscured in some fashion (e.g. under a low ceiling). If the user is **Flying** when they perform an **Aerial** Technique, they can Plummet as they attack. Plummeting attacks are made at **+1 Power**, but require 1 more Grade of Success on their Primary Check. Regardless of the outcome, the user becomes grounded after Plummeting.",
    cost: 2,
    primarySkills: { skills: ["Athletics"] },
    tags: [{ name: "Approach" }]
  },
  "All": {
    name: "All",
    traitType: "Positive",
    description: "This Technique affects all eligible Targets (be they friend or foe), besides the user. At the user's discretion, the **Indirect** Trait can be bundled into the final Technique for no additional cost.",
    cost: 3,
    tags: [{ name: "Target" }],
    techDefaults: ["Indirect"]
  },
  "Allies": {
    name: "Allies",
    traitType: "Positive",
    description: "This Technique affects all of the user's allies, but not themselves. At the user's discretion, the **Indirect** Trait can be bundled into the final Technique for no additional cost.",
    cost: 2,
    tags: [{ name: "Target" }],
    techDefaults: ["Indirect"]
  },
  "Alt-Cost": {
    name: "Alt-Cost",
    traitType: "Positive",
    description: "Choose **HP**, **SP**, or Coins:\n\t★ **HP:** This Technique spends **HP** instead of **FP**. It can't recover **HP**, and can't be combined with **Blowback** or varieties of **Self** that deal Damage to the user.\n\t★ **SP:** This Technique spends **SP** instead of **FP**. It can't add **SP** to anyone's **SP** threshold, although it can still generate **SP** for **Exceptional Techniques**.\n\t★ **Coins:** This Technique spends 5 Coins for every **1 FP** it would cost. It can't steal Coins through **Snatch**, and can't cover an equivalent cost of more than **10 FP** (for 50 Coins).\nThe effective **FP cost** of the final Technique cannot be reduced lower than **1 FP** from **Negative Traits** while using **Alt-Cost**.",
    cost: 2,
    input: {
      name: "Cost",
      choices: ["HP", "SP", "Coins"]
    }
  },
  "Alt-Skill": {
    name: "Alt-Skill",
    traitType: "Positive",
    description: "This Technique affects all of the user's allies, but not themselves. At the user's discretion, the **Indirect** Trait can be bundled into the final Technique for no additional cost.",
    cost: 1,
    tags: [{ name: "X" }],
    input: { name: "Check Type", choices: ["Primary", "Secondary"] },
    validate: validateUniqueInputs("Alt-Skill")
  },
  "Bestow": {
    name: "Bestow",
    traitType: "Positive",
    description: "This Technique affects all of the user's allies, but not themselves. At the user's discretion, the **Indirect** Trait can be bundled into the final Technique for no additional cost.",
    cost: 2,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Knowhow", "Magic", "Trickery", "Bully", "Cheer"] }],
    input: { name: "Quality" }
  },
  "Boost": {
    name: "Boost",
    traitType: "Positive",
    description: "The Target is **Boosted** for [X] Turns; the exact properties affected by the **Boost** are decided when this Trait is applied. For every additional Grade of Success, increase the **Status Level** by 11 (to a maximum of [X]). This Technique can also use the following Skills for Secondary Checks, depending on the property being **Boosted**:\n\t★ **Attack:** **Athletics** or **Coordination**.\n\t★ **Defense:** **Block**.\n\t★ **Dodge:** **Trickery**.\n\t★ **Skill:** The same Skill being Boosted.\nIf this **Boost** Technique carries an **Element**, it also has the following effects:\n\t★ **Attack:** The Target's attacks have the **Element** for the **Duration** of the **Boost**.\n\t★ **Defense:** The Target's **Resist** for that **Element** is **Boosted** too.",
    cost: 2,
    tags: [{ name: "Secondary", secondarySkills: ["Heal", "Magic", "Cheer"] }],
    // Secondary boost options are added in getSecondarySkills()
    input: { name: "Boost Type", choices: ["Attack", "Defense", "Dodge", ...skills] }
  },
  "Burst": {
    name: "Burst",
    traitType: "Positive",
    description: "This Technique bursts around its initial Target, extending its area of effect to Strike [X] additional Targets in front of them and [X] additional Targets behind them (ignoring Elevation). The initial Target takes Damage equal to [**Power**] (or, with an additional Grade of Success, [**Power (x2)**]). Each new Target (in either direction) is dealt 1 less Raw Damage than the last; this cannot reduce the Raw Damage below 0. So long as the first Strike deals Damage, the rest will deal at least 1 Raw Damage. If the final Technique does not carry an **Element**, you may give the Technique **Element (Blast)** for no additional cost.",
    cost: 1,
    tags: [{ name: "X" }, { name: "Strikes" }, { name: "Target" }]
  },
  "Charm": {
    name: "Charm",
    traitType: "Positive",
    description: "The Target is **Charmed** for [X] Turns. For every additional Grade of Success, increase the **Status** **Level** by 11, to a maximum of [X].",
    cost: 2,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Magic", "Trickery", "Persuade"] }]
  },
  "Coin Toss": {
    name: "Coin Toss",
    traitType: "Either",
    // TODO: i got tired of putting the descriptions i dont even care anymore
    cost: ({ slots, set }) => {
      if (slots.length !== 2) throw new Error("Incorrect amount of slots.");
      const firstCost = getTechniqueCost(slots[0], set);
      const secondCost = getTechniqueCost(slots[0], set);
      if (firstCost === null || secondCost === null) return null;
      let baseCost = Math.floor(Math.max(firstCost, secondCost));
      const maxTraitCount = Math.max(...slots.map(slot => slot?.traits.length ?? 0));
      // TODO: if this needs to be unique traits, change this
      baseCost += maxTraitCount;
      if (slots.some(slot => slot === null)) baseCost -= 1;
      if (firstCost < 0) baseCost += Math.floor(firstCost / 2);
      if (secondCost < 0) baseCost += Math.floor(secondCost / 2);
      return baseCost;
    },
    tags: [{ name: "Random" }, { name: "Slots", slotNumber: 2 }],
    validate: ({ technique, techniques, state, warnings }) => {
      const cost = getTraitCost(state, techniques, technique);
      if (cost !== null && cost >= 0 && state.isPositive === true) {
        warnings.add("Coin Toss cannot be a negative trait unless it has a negative cost.", technique, "Coin Toss");
        return false;
      }
      return true;
    }
  },
  "Counter": {
    name: "Counter",
    traitType: "Positive",
    cost: 2,
    primarySkills: { skills: ["Athletics", "Steady"], newDefault: true },
    tags: [{ name: "X", stackCap: 3 }],
    input: { name: "Contact Options", choices: ["Persist", "Activate Indirect", "Secure"] },
    validate: validateUniqueInputs("Counter")
  },
  "Confuse": {
    name: "Confuse",
    traitType: "Positive",
    cost: 1,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Magic", "Trickery", "Bully"] }],
  },
  "Daze": {
    name: "Daze",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Magic", "Trickery", "Persuade"] }],
  },
  "Disarm": {
    name: "Disarm",
    traitType: "Positive",
    cost: 1,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Magic", "Trickery", "Bully"] }],
  },
  "Dismiss": {
    name: "Dismiss",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "Secondary", secondarySkills: ["Heal", "Magic", "Trickery", "Bully"] }],
  },
  "Disorient": {
    name: "Disorient",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Magic", "Trickery", "Bully"] }],
  },
  "Divider": {
    name: "Divider",
    traitType: "Positive",
    cost: 3,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Magic", "Trickery", "Bully"] }],
  },
  "Drain": {
    name: "Drain",
    traitType: "Positive",
    cost: 3,
    tags: [{ name: "X", stackCap: 2 }]
  },
  "Element": {
    name: "Element",
    traitType: "Positive",
    cost: 1,
    tags: [{ name: "X" }],
    input: { name: "Element" },
    validate: validateUniqueInputs("Element")
  },
  "Empower": {
    name: "Empower",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "X" }]
  },
  "Fear": {
    name: "Fear",
    traitType: "Positive",
    cost: 1,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Trickery", "Bully"] }]
  },
  "Flowery": {
    name: "Flowery",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Magic", "Cheer"] }]
  },
  "Group": {
    name: "Group",
    traitType: "Positive",
    cost: 5,
    tags: [{ name: "Target" }],
    techDefaults: ["Indirect"]
  },
  "Hearty": {
    name: "Hearty",
    traitType: "Positive",
    cost: 1,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Heal", "Magic"] }],
  },
  "Homing": {
    name: "Homing",
    traitType: "Positive",
    cost: 1
  },
  "Hustle": {
    name: "Hustle",
    traitType: "Positive",
    cost: 6,
    tags: [{ name: "X", stackCap: 5 }, { name: "Secondary", secondarySkills: ["Athletics", "Magic", "Cheer"] }]
  },
  "Indirect": {
    name: "Indirect",
    traitType: "Positive",
    cost: 2,
  },
  "Launch": {
    name: "Launch",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Athletics", "Bully"] }]
  },
  "Lengthen": {
    name: "Lengthen",
    traitType: "Positive",
    cost: 1,
    tags: [{ name: "X" }]
  },
  "Lingering": {
    name: "Lingering",
    traitType: "Positive",
    cost: 1,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Magic", "Bully"] }]
  },
  "Lucky Hit": {
    name: "Lucky Hit",
    traitType: "Positive",
    cost: ({ slots, set }) => {
      if (slots.length !== 1) throw new Error("Incorrect amount of slots.");
      const cost = getTechniqueCost(slots[0], set);
      if (cost === null) return null;
      let baseCost = Math.floor(cost / 3);
      baseCost += Math.floor(slots[0]?.traits.length ?? 0 / 2);
      return baseCost;
    },
    tags: [{ name: "Random" }, { name: "Slots", slotNumber: 1 }]
  },
  "Minion": {
    name: "Minion",
    traitType: "Positive",
    cost: 3,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Magic", "Bully", "Cheer", "Persuade"] }, { name: "Target" }]
  },
  "Overrun": {
    name: "Overrun",
    traitType: "Positive",
    cost: 3,
    tags: [{ name: "Target" }]
  },
  "Piercing": {
    name: "Piercing",
    traitType: "Positive",
    cost: 3
  },
  "Provoke": {
    name: "Provoke",
    traitType: "Positive",
    cost: 1,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Magic", "Trickery", "Bully", "Persuade"] }]
  },
  "Quake": {
    name: "Quake",
    traitType: "Positive",
    cost: 3,
    tags: [{ name: "Approach" }, { name: "Target" }],
    primarySkills: { skills: ["Athletics"] }
  },
  "Ranged": {
    name: "Ranged",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "Approach" }],
    primarySkills: { skills: ["Aim"], newDefault: true }
  },
  "Reach": {
    name: "Reach",
    traitType: "Positive",
    cost: 1,
    tags: [{ name: "Approach" }]
  },
  "Repeat": {
    name: "Repeat",
    traitType: "Positive",
    cost: 3,
    tags: [{ name: "Strikes" }]
  },
  "Revive": {
    name: "Revive",
    traitType: "Positive",
    cost: 10,
    tags: [{ name: "Secondary", secondarySkills: ["Heal", "Magic"] }]
  },
  "Roulette": {
    name: "Roulette",
    traitType: "Either",
    cost: ({ slots, set }) => {
      if (slots.length !== 6) throw new Error("Incorrect amount of slots.");
      const slotCosts = slots.map(slot => getTechniqueCost(slot, set));
      let baseCost = Math.max(...slotCosts.filter(cost => cost !== null));
      baseCost += Math.floor(Math.max(...slots.map(slot => slot?.traits.length ?? 0)) / 2);
      const negativeCosts = slotCosts.filter(cost => cost !== null && cost < 0) as number[]; // TODO: fix typescript being dumb
      baseCost += negativeCosts.reduce((a, b) => a + Math.min(Math.floor(b / 2), -1), 0);
      return baseCost;
    },
    tags: [{ name: "Random" }, { name: "Slots", slotNumber: 6 }],
    validate: ({ technique, techniques, state, warnings }) => {
      const cost = getTraitCost(state, techniques, technique);
      if (cost !== null && cost >= 0 && state.isPositive === true) {
        warnings.add("Roulette cannot be a negative trait unless it has a negative cost.", technique, "Roulette");
        return false;
      }
      return true;
    }
  },
  "Safe": {
    name: "Safe",
    traitType: "Positive",
    cost: 2,
    validate: ({ technique, warnings }) => {
      if (!(technique.traits.some(state => traits[state.name].tags?.some(tag => tag.name === "Target")))) {
        warnings.add("Safe trait cannot be applied to a move with no multi-targeting.", technique, "Safe");
        return false;
      }
      return true;
    }
  },
  "Scaling": {
    name: "Scaling",
    traitType: "Positive",
    cost: 3
  },
  "Secure": {
    name: "Secure",
    traitType: "Positive",
    cost: 4,
    tags: [{ name: "Secondary", secondarySkills: ["Block", "Magic", "Trickery"] }]
  },
  "Selective": {
    name: "Selective",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "Target" }]
  },
  "Sequential": {
    name: "Sequential",
    traitType: "Positive",
    cost: 1,
    tags: [{ name: "Strikes" }, { name: "Target" }]
  },
  "Shared": {
    name: "Shared",
    traitType: "Positive",
    cost: 1
  },
  "Simple": {
    name: "Simple",
    traitType: "Positive",
    cost: 2
  },
  "Snatch": {
    name: "Snatch",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "Secondary", secondarySkills: ["Trickery", "Bully"] }]
  },
  "Split": {
    name: "Split",
    traitType: "Positive",
    cost: ({ slotStates, slots, set, techDefaults }) => {
      const costs = slots.map((slot, index) => getTechniqueCost(slot, set, techDefaults, slotStates[index]?.hasStrike ?? false) ?? 0);
      return costs.reduce((a, b) => a + b, 0);
    },
    tags: [{ name: "Slots", slotNumber: null }],
    validate: ({ state, techniques, technique, warnings }) => {
      let isValid = true;
      for (const slot of state.slots ?? []) {
        const splitSlot = slot && getTechnique(slot.name, techniques);
        if (!splitSlot) continue;
        if (splitSlot.traits.some(trait => trait.name === "Harmless")) {
          warnings.add("Split slots cannot contain the Harmless trait.", technique, "Split");
          isValid = false;
        }
      }
      return isValid;
    }
  },
  "Strike-Through": {
    name: "Strike-Through",
    traitType: "Positive",
    cost: 1,
    tags: [{ name: "X" }, { name: "Strikes" }, { name: "Target" }]
  },
  "Strong": {
    name: "Strong",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "X" }]
  },
  "Stun": {
    name: "Stun",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Magic", "Trickery", "Bully"] }]
  },
  "Swap": {
    name: "Swap",
    traitType: "Positive",
    cost: 1,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Coordination", "Magic", "Trickery", "Bully"] }]
  },
  "Terrain": {
    name: "Terrain",
    traitType: "Positive",
    cost: 3,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Craft", "Magic"] }],
    input: { name: "Terrain" }
  },
  "Throw": {
    name: "Throw",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "X", stackCap: 2 }, { name: "Strikes" }, { name: "Target" }],
    primarySkills: { skills: ["Athletics", "Aim"] }, // TODO: maybe check for Throw x2?
    techDefaults: ["Ranged"]
  },
  "Tool": {
    name: "Tool",
    traitType: "Positive",
    cost: 1,
    techDefaults: ["Indirect", "Ranged"],
    input: { name: "Tool Name" }
  },
  "Tutor": {
    name: "Tutor",
    traitType: "Positive",
    cost: 1,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Knowhow", "Magic", "Bully", "Cheer"] }],
    input: { name: "Tutored Trait" }
  },
  "Underfoot": {
    name: "Underfoot",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "Approach" }, { name: "Target" }],
    techDefaults: ["Athletics", "Indirect", "Element"] // TODO: specifically earth or rumble
  },
  "Versatile": {
    name: "Versatile",
    traitType: "Positive",
    cost: 3, // TODO: add versatile cost somewhere???
    tags: [{ name: "X" }, { name: "Slots", slotNumber: 1 }],
    techDefaults: ["Athletics", "Indirect", "Element"] // TODO: specifically earth or rumble
  },
  "Weaken": {
    name: "Weaken",
    traitType: "Positive",
    cost: 2,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Magic", "Trickery", "Bully"] }],
  },
}

export const negativeTraits: Record<string, Trait> = {
  "Blowback": {
    name: "Blowback",
    traitType: "Negative",
    cost: -4,
    validate: ({ technique, warnings }) => {
      const hasHarmless = technique.traits.some(trait => trait.name === "Harmless");
      const hasSelf = technique.traits.some(trait => trait.name === "Self");
      if (hasHarmless) {
        warnings.add("Cannot combine Blowback with Harmless.", technique, "Blowback");
      }
      if (hasSelf) {
        warnings.add("Cannot combine Blowback with Self.", technique, "Blowback");
      }
      return !hasHarmless && !hasSelf;
    }
  },
  // CONTINUE WORKING FROM HERE
  "Commitment": {
    name: "Commitment",
    traitType: "Negative",
    cost: -2,
    tags: [{ name: "X", stackCap: 2 }],
    input: { name: "Check", choices: ["Primary", "Secondary"] },
    validate: props => {
      const { technique, state, warnings } = props;
      let isValid = true;
      isValid &&= validateUniqueInputs("Commitment")(props);
      if (state.inputValue === "Primary") {
        if (getPrimarySkills(technique).length === 0) {
          warnings.add("Cannot commit to primary check if there is no check.", technique, "Commitment");
          isValid = false;
        }
        if (technique.traits.some(trait => trait.name === "Repeat" || trait.name === "Sequential")) {
          warnings.add("Cannot add Commitment to indefinite traits.", technique, "Commitment");
          isValid = false;
        }
        // TODO: if possible, calculate power and add warning here
      } else if (state.inputValue === "Secondary") {
        if (getSecondarySkills(technique).length === 0) {
          warnings.add("Cannot commit to secondary check if there is no check.", technique, "Commitment");
          isValid = false;
        }
        // TODO: somehow calculate outcomes for secondary check
      }
      return isValid;
    }
  },
  "Conditional": {
    name: "Conditional",
    traitType: "Negative",
    cost: -1,
    tags: [{ name: "X" }],
    input: { name: "Trait & Condition" }
  },
  "Cooldown": {
    name: "Cooldown",
    traitType: "Negative",
    cost: -1,
    tags: [{ name: "X", stackCap: 5 }],
    input: { name: "Trait & Condition" }
  },
  "Delayed": {
    name: "Delayed",
    traitType: "Negative",
    cost: -2,
    tags: [{ name: "X", stackCap: 5 }],
    input: { name: "Trait & Condition" }
  },
  "Drip-Feed": {
    name: "Drip-Feed",
    traitType: "Negative",
    cost: -1,
    tags: [{ name: "X", stackCap: 5 }]
    // TODO: make list for drip-feed compatible traits
  },
  "Exhausting": {
    name: "Exhausting",
    traitType: "Negative",
    cost: -4,
    tags: [{ name: "X" }]
  },
  "Fumble": {
    name: "Fumble",
    traitType: "Negative",
    cost: ({ slots, set }) => {
      if (slots.length !== 1) throw new Error("Incorrect amount of slots.");
      const cost = getTechniqueCost(slots[0], set);
      if (cost === null) return null;
      return Math.floor(cost / 3);
    },
    tags: [{ name: "Random" }, { name: "Slots", slotNumber: 1 }],
    validate: ({ techniques, technique, state, warnings }) => {
      const fumbleSlot = state.slots?.[0] && getTechnique(state.slots![0], techniques);
      if (!fumbleSlot) {
        warnings.add("No technique slot for Fumble.", technique, "Fumble");
        return false;
      }
      const cost = getTechniqueCost(fumbleSlot, techniques);
      if (cost === null || cost >= 0) {
        warnings.add("Cost of Fumble must be negative.", technique, "Fumble");
        return false;
      }
      return true;
    }
  },
  "Harmless": {
    name: "Harmless",
    traitType: "Negative",
    cost: -3,
    tags: [{ name: "Strikes" }],
    techDefaults: ["Indirect"],
    validate: ({ technique, warnings }) => {
      if (technique.traits.some(trait => trait.name === "Weak")) {
        warnings.add("Harmless cannot be combined with Weak.", technique, "Harmless");
        return false;
      }
      return true;
    }
  },
  "Lacking": {
    name: "Lacking",
    traitType: "Negative",
    cost: -1,
    tags: [{ name: "X" }],
    input: { name: "Trait" },
    validate: ({ technique, state, warnings }) => {
      if (!technique.traits.some(trait => trait.name.toLowerCase() === state.inputValue?.toLowerCase())) {
        warnings.add(`Lacking trait ${state.inputValue ?? "(None)"} is not on this technique.`, technique, "Lacking");
        return false;
      }
      return true;
    }
  },
  "Limitation": {
    name: "Limitation",
    traitType: "Negative",
    cost: null,
    input: { name: "Limitation" }
  },
  "Others": {
    name: "Others",
    traitType: "Negative",
    cost: -1,
    tags: [{ name: "Target" }]
  },
  "Penalty": {
    name: "Penalty",
    traitType: "Negative",
    cost: -2,
    tags: [{ name: "X", stackCap: 3 }],
    input: { name: "Condition", choices: ["Confused", "Dazed", "Disarmed", "Disoriented", "Linegring", "Stunned", "Weakened"] },
    validate: validateUniqueInputs("Penalty")
  },
  "Self": {
    name: "Self",
    traitType: "Negative",
    cost: ({ technique }) => { // Self also has a hardcoded condition for Split with no strikes, in getTraitCost() or getTechniqueCost()
      if (technique.traits.map(state => state.name).includes("Counter") || technique.traits.map(state => state.name).includes("Harmless")) {
        return -1;
      }
      return -2;
    },
    tags: [{ name: "Target" }]
  },
  "Shorten": {
    name: "Shorten",
    traitType: "Negative",
    cost: -1,
    tags: [{ name: "X" }]
  },
  "Side-Effect": {
    name: "Side-Effect",
    traitType: "Negative",
    cost: -1,
    tags: [{ name: "X", stackCap: 3 }],
    input: { name: "Condition", choices: ["Boosted", "Charged", "Hustled", "Secure", "Tutored"] },
    validate: validateUniqueInputs("Side-Effect")
  },
  "Situational": {
    name: "Situational",
    traitType: "Negative",
    cost: null
  },
  "Team": {
    name: "Team",
    traitType: "Negative",
    cost: -2,
    tags: [{ name: "X" }, { name: "Secondary", secondarySkills: ["Coordination", "Cheer"] }]
  },
  "Unwieldy": {
    name: "Unwieldy",
    traitType: "Negative",
    cost: -2,
    tags: [{ name: "X" }],
    input: { name: "Check", choices: ["Primary", "Secondary"] }
  },
  "Weak": {
    name: "Weak",
    traitType: "Negative",
    cost: -2,
    tags: [{ name: "X" }]
    // TODO: calculate for power below 0 somehow
  }
}

export const traits: Record<string, Trait> = { ...positiveTraits, ...negativeTraits };
import * as z from 'zod';

export type Warning = { reason: string, technique: Technique, name?: string }
export class Warnings {
  public warnings: Warning[] = [];
  add(reason: string, technique: Technique, name?: string) {
    this.warnings.push({ reason, technique, name });
  }
}

export const traitTypes = ["Positive", "Negative", "Either"] as const;
export type TraitType = typeof traitTypes[number];
export const skills = [
  "Aim", "Athletics", "Block", "Coordination", "Heal",
  "Craft", "Knowhow", "Magic", "Notice", "Trickery",
  "Bully", "Cheer", "Persuade", "Perform", "Steady"
] as const;
export type Skill = typeof skills[number];

export type TechniqueSet = Record<string, Technique>;
export type Slot = Technique | null;

export const SlotState = z.nullable(z.object({
  id: z.string(),
  name: z.string(),
  hasStrike: z.boolean()
}));
export type SlotState = z.infer<typeof SlotState>;

export const TraitState = z.object({
  id: z.string(),
  name: z.string(),
  inputValue: z.string().optional(),
  newCost: z.number().optional(),
  slots: z.array(SlotState).optional(),
  isPositive: z.boolean().optional()
});
export type TraitState = z.infer<typeof TraitState>;

export const Technique = z.object({
  id: z.string(),
  name: z.string(),
  traits: z.array(TraitState),
  primarySkill: z.enum(skills).nullable(),
  secondarySkill: z.enum(skills).nullable()
});
export type Technique = z.infer<typeof Technique>;

export const TechDefault = z.object({
  id: z.string(),
  name: z.string(),
  inputTarget: z.string().nullable()
});
export type TechDefault = z.infer<typeof TechDefault>;

export interface Trait {
  name: string;
  traitType: TraitType;
  description?: string;
  cost: number | ((context: { slotStates: SlotState[], slots: Slot[], set: TechniqueSet, technique: Technique, techDefaults: TechDefault[] }) => number | null) | null;
  tags?: Tag[];
  techDefaults?: string[];
  input?: {
    name: string,
    choices?: string[];
  }
  primarySkills?: {
    skills: Skill[];
    newDefault?: boolean // default false
  },
  validate?: (opts: { technique: Technique, techniques: TechniqueSet, state: TraitState, trait: Trait, warnings: Warnings }) => boolean
}

export interface Tag {
  name: string;
  secondarySkills?: Skill[];
  stackCap?: number;
  slotNumber?: number | null; // inf. slots on null
}
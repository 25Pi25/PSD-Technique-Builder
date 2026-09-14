import { type Trait, type TraitState } from './types'
import Button from 'react-bootstrap/Button'
import type { TechniqueProps } from './TechniqueEditor'
import { getTraitCost, getTechnique, toFPString, traitToFPString, compareTrait } from './util';
import { traits } from './traits';

interface Props extends TechniqueProps {
  trait: Trait,
  state: TraitState,
  traitIndex: number
}

export default function TraitEditor({ uuid, technique, techniques, trait, state, traitIndex, setTechniques, techDefaults }: Props) {
  function setTraitState(traitIndex: number, callback: (oldState: TraitState) => TraitState) {
    setTechniques(oldState => ({
      ...oldState,
      [uuid]: {
        ...oldState[uuid],
        traits: [
          ...oldState[uuid].traits.slice(0, traitIndex),
          callback(oldState[uuid].traits[traitIndex]),
          ...oldState[uuid].traits.slice(traitIndex + 1),
        ]
      }
    }));
  }

  function changeTraitName(traitIndex: number, name: string, id: string) {
    const newState: TraitState = { name, id };
    const traitInfo = traits[name];
    const slotsTag = traitInfo.tags?.find(tag => tag.name === "Slots");
    if (slotsTag) newState.slots = new Array(slotsTag.slotNumber ?? 1).fill(null)
    else delete newState.slots;
    if (traitInfo.input) {
      if (traitInfo.input.choices) newState.inputValue = traitInfo.input.choices[0];
      else newState.inputValue = "";
    }
    else delete newState.inputValue;
    if (traitInfo.cost === null) newState.newCost = 0;
    else delete newState.newCost;
    if (traitInfo.traitType === "Either") newState.isPositive = true;
    else delete newState.isPositive;
    setTraitState(traitIndex, () => newState);
  }

  function deleteTrait(event: any) {
    const index: number = Number(event.target.dataset.traitIndex);
    setTechniques(oldState => ({
      ...oldState,
      [uuid]: {
        ...oldState[uuid],
        traits: [...oldState[uuid].traits.slice(0, index), ...oldState[uuid].traits.slice(index + 1)]
      }
    }));
  }

  return <div>
    <select defaultValue={trait.name} onChange={e => changeTraitName(traitIndex, e.target.value, state.id)}>
      {Object.values(traits).sort(compareTrait).map(thisTrait =>
        <option
          style={{ color: thisTrait.traitType === 'Negative' ? 'lightcoral' : 'lightgreen' }}
          value={thisTrait.name}
          key={thisTrait.name}>{thisTrait.name} ({traitToFPString(thisTrait)} FP)</option>)}
    </select>
    {trait.traitType === "Either" && <span>Positive? <input type="checkbox" checked={state.isPositive} onChange={e => setTraitState(traitIndex, oldState => ({ ...oldState, isPositive: e.target.checked }))} /> FP</span>}
    <Button variant="outline-danger" onClick={deleteTrait} data-trait-index={traitIndex}>Delete Trait</Button>
    {trait.cost !== null ? <p>{toFPString(getTraitCost(state, techniques, technique, techDefaults)!)} FP</p>
      : <p><input type="number" step="1" defaultValue={state.newCost} onChange={e => setTraitState(traitIndex, oldState => ({ ...oldState, newCost: Number(e.target.value) }))} /> FP</p>}
    {state.slots?.map((slot, slotIndex) => <div key={slot?.id ?? slotIndex}>
      <select
        defaultValue={slot?.name ?? ""}
        onChange={e => setTraitState(traitIndex, oldState => ({
          ...oldState, slots: oldState.slots && [...oldState.slots!.slice(0, slotIndex),
          e.target.value ? { id: oldState.slots[slotIndex]?.id ?? globalThis.crypto.randomUUID(), name: e.target.value, hasStrike: oldState.slots[slotIndex]?.hasStrike ?? false } : null,
          ...oldState.slots!.slice(slotIndex + 1)]
        }))}>
        <option value="">(None)</option>
        {Object.keys(techniques).filter(techId => techId !== uuid && getTechnique(techId, techniques))
          .map(techId => <option value={techId} key={techId}>{getTechnique(techId, techniques)!.name}</option>)}
      </select>
      {slot && trait.name === "Split" && <div>
        <span>Has Strike?</span>
        <input type="checkbox" onChange={e => setTraitState(traitIndex, oldState => ({
          ...oldState,
          slots: oldState.slots && [...oldState.slots!.slice(0, slotIndex),
          { id: oldState.slots[slotIndex]!.id, name: oldState.slots[slotIndex]!.name, hasStrike: e.target.checked },
          ...oldState.slots!.slice(slotIndex + 1)]
        }))} checked={slot?.hasStrike} />
      </div>}
    </div>)}
    {trait.tags?.find(tag => tag.name === "Slots")?.slotNumber === null && <div>
      <Button variant="outline-primary"
        onClick={() => setTraitState(traitIndex, oldState => ({ ...oldState, slots: [...oldState.slots!, null] }))}>Add Slot</Button>
      <Button variant="outline-secondary"
        onClick={() => setTraitState(traitIndex, oldState => ({ ...oldState, slots: [...oldState.slots!.slice(0, oldState.slots!.length - 1)] }))}>Delete Slot</Button>
    </div>}
    {trait.input && <div>
      <p>{trait.input.name}</p>
      {trait.input.choices ? <select defaultValue={state.inputValue}
        onChange={e => setTraitState(traitIndex, oldState => ({ ...oldState, inputValue: e.target.value }))}>
        {trait.input.choices.map(choice => <option value={choice} key={choice}>{choice}</option>)}
      </select> :
        <input type="text" onChange={e => setTraitState(traitIndex, oldState => ({ ...oldState, inputValue: e.target.value }))} />
      }
    </div>}
  </div>
}
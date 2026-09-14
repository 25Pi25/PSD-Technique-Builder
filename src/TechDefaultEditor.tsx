import type { Dispatch, SetStateAction } from 'react';
import { type TechDefault } from './types';
import { Button } from 'react-bootstrap';
import { traits, positiveTraits } from './traits';

interface Props {
  techDefaults: TechDefault[],
  setTechDefaults: Dispatch<SetStateAction<TechDefault[]>>
}

export default function TechDefaultEditor({ techDefaults, setTechDefaults }: Props) {
  function setTechDefault(techIndex: number, callback: (techDefault: TechDefault) => TechDefault) {
    setTechDefaults(oldState => ([
      ...oldState.slice(0, techIndex),
      callback(oldState[techIndex]),
      ...oldState.slice(techIndex + 1)
    ]));
  }

  return <fieldset>
    <legend>Tech Defaults</legend>
    {techDefaults.map((techDefault, techIndex) => <div key={techDefault.id}>
      <select defaultValue={techDefault.name}
        onChange={e => setTechDefault(techIndex, oldState => ({ ...oldState, name: e.target.value, inputTarget: traits[e.target.value].input ? oldState.inputTarget || null : null }))}>
        {Object.values(positiveTraits).map(trait => <option value={trait.name} key={trait.name}>{trait.name}</option>)}
      </select>
      <input type="text" value={techDefault.inputTarget ?? ""} disabled={!traits[techDefault.name].input}
        onChange={e => setTechDefault(techIndex, oldState => ({ ...oldState, inputTarget: e.target.value }))} />
      <Button variant='danger' onClick={() => setTechDefaults(oldState => ([...oldState.slice(0, techIndex), ...oldState.slice(techIndex + 1)]))}>Delete</Button>
    </div>)}
    <Button variant='success' onClick={() => setTechDefaults(oldState => ([...oldState, { id: globalThis.crypto.randomUUID(), name: "Strong", inputTarget: null }]))}>Add Tech Default</Button>
  </fieldset>
}
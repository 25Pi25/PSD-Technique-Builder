import Button from 'react-bootstrap/Button'
import { type Skill, type TechDefault, type Technique, type TechniqueSet } from './types'
import { useEffect, useMemo, type Dispatch, type SetStateAction } from 'react'
import { getPrimarySkills, getSecondarySkills, getTechniqueCost } from './util';
import TraitEditor from './TraitEditor';
import { isCyclic } from './validate';
import { traits } from './traits';

export interface TechniqueProps {
  uuid: string,
  technique: Technique,
  techniques: TechniqueSet,
  techDefaults: TechDefault[],
  setTechniques: Dispatch<SetStateAction<TechniqueSet>>
}

export default function TechniqueEditor(props: TechniqueProps) {
  const { uuid, technique, techniques, setTechniques, techDefaults } = props;

  const primarySkills = useMemo(() => getPrimarySkills(technique), [technique]);
  const secondarySkills = useMemo(() => getSecondarySkills(technique), [technique]);

  useEffect(() => { // hotfix to update available choices for primary/secondary skill
    if (technique.primarySkill && !primarySkills.includes(technique.primarySkill)) {
      setTechniques(oldState => ({
        ...oldState,
        [uuid]: {
          ...oldState[uuid],
          primarySkill: primarySkills[0] as Skill
        }
      }));
    }
    if (technique.secondarySkill && !secondarySkills.includes(technique.secondarySkill)) {
      setTechniques(oldState => ({
        ...oldState,
        [uuid]: {
          ...oldState[uuid],
          secondarySkill: secondarySkills[0] as Skill ?? null 
        }
      }));
    }
  }, [technique]);

  function thisDelete() {
    setTechniques(oldState => {
      const newState = { ...oldState };
      delete newState[uuid];
      return newState;
    });
  }

  function addTrait() {
    setTechniques(oldState => ({
      ...oldState,
      [uuid]: {
        ...oldState[uuid],
        traits: [...oldState[uuid].traits, { name: "Strong", id: globalThis.crypto.randomUUID() }]
      }
    }));
  }

  function setTechnique(uuid: string, callback: (technique: Technique) => Technique) {
    setTechniques(oldState => ({
      ...oldState,
      [uuid]: callback(oldState[uuid])
    }));
  }

  return <form onSubmit={e => e.preventDefault()}>
    <fieldset>
      <legend>
        <input
          type="text"
          value={technique.name}
          onChange={e => setTechniques(oldState => ({ ...oldState, [uuid]: { ...oldState[uuid], name: e.target.value } }))} />
        <p>({!isCyclic(technique, techniques) && (getTechniqueCost(technique, techniques, techDefaults) ?? "???")} FP)</p>
      </legend>
      {!!primarySkills.length && <p>Primary: <select defaultValue={technique.primarySkill ?? primarySkills[0]} onChange={e => setTechnique(uuid, oldState => ({ ...oldState, primarySkill: e.target.value as Skill }))}>
        {primarySkills.map(skill => <option value={skill} key={skill}>{skill}</option>)}
      </select>
      </p>}
      {!!secondarySkills.length && <p>Secondary: <select defaultValue={technique.secondarySkill ?? secondarySkills[0]} onChange={e => setTechnique(uuid, oldState => ({ ...oldState, secondarySkill: e.target.value as Skill }))}>
        {secondarySkills.map(skill => <option value={skill} key={skill}>{skill}</option>)}
      </select>
      </p>}
      <fieldset>
        <legend>Traits</legend>
        {technique.traits.map((state, traitIndex) => <TraitEditor {...props} trait={traits[state.name]} state={state} traitIndex={traitIndex} key={state.id} />)}
        <Button variant="outline-success" onClick={addTrait}>Add Trait</Button>
      </fieldset>
      <Button variant="danger" onClick={thisDelete}>Delete</Button>
    </fieldset>
  </form>
}
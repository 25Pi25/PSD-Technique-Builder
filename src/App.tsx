import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { TechDefault, Technique, type TechniqueSet, type Warning } from './types';
import TechniqueEditor from './TechniqueEditor';
import { validate } from './validate';
import WarningBox from './WarningBox';
import TechDefaultEditor from './TechDefaultEditor';
import z from 'zod';

export default function App() {
  const [techniques, setTechniques] = useState<TechniqueSet>({});
  const [techDefaults, setTechDefaults] = useState<TechDefault[]>([]);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [allowSaving, setAllowSaving] = useState<boolean>(false);

  useEffect(() => {
    const techniques = localStorage.getItem("techniques");
    const techDefaults = localStorage.getItem("techDefaults");
    if (techniques && techDefaults) {
      try {
        setTechniques(() => z.parse(z.record(z.string(), Technique), JSON.parse(techniques)));
        setTechDefaults(() => z.parse(z.array(TechDefault), JSON.parse(techDefaults)));
      } catch (e) {
        console.error(e);
      }
    }
    setAllowSaving(true);
  }, []);

  useEffect(() => {
    if (allowSaving) localStorage.setItem("techniques", JSON.stringify(techniques));
  }, [techniques]);

  useEffect(() => {
    if (allowSaving) localStorage.setItem("techDefaults", JSON.stringify(techDefaults));
  }, [techDefaults]);


  function addTechnique() {
    const uuid = globalThis.crypto.randomUUID();
    setTechniques(oldState => ({
      ...oldState,
      [uuid]: {
        id: uuid,
        name: "My Technique",
        traits: [],
        primarySkill: "Coordination",
        secondarySkill: null
      }
    }));
  }

  return <div>
    <TechDefaultEditor techDefaults={techDefaults} setTechDefaults={setTechDefaults} />
    <WarningBox warnings={warnings} />
    <Button variant="primary" onClick={() => setWarnings(validate(techniques, [...techDefaults]).warnings)}>Validate</Button>
    <Button variant="success" onClick={addTechnique}>Add Technique</Button>
    {Object.values(techniques).map(technique =>
      <TechniqueEditor uuid={technique.id} technique={technique} techniques={techniques} setTechniques={setTechniques} techDefaults={[...techDefaults]} key={technique.id} />)}
  </div>
}
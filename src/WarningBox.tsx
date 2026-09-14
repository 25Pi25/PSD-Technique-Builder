import type { Warning } from './types'

export default function WarningBox({ warnings }: { warnings: Warning[] }) {
  if (!warnings.length) return <div><p>No errors found.</p></div>
  return <div>
    {warnings.map((warning, index)=> <div key={index}>
      <p>{warning.reason}</p>
      <p>From: {warning.technique.name}</p>
    </div>)}
  </div>
}
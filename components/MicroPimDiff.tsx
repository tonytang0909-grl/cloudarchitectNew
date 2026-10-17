'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, GitCompareArrows, ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react';

const fields = [
  { label: 'Product name', base: 'Trail backpack', live: 'Trail backpack — curated edition', incoming: 'Trail backpack', kind: 'protected', note: 'The supplier value matches the snapshot. Keep the merchant’s enriched title.' },
  { label: 'Material', base: 'Nylon', live: 'Nylon', incoming: 'Recycled nylon', kind: 'update', note: 'Only the supplier changed this field. The new material can be accepted.' },
  { label: 'Description', base: 'Everyday backpack', live: 'Made for the long way home.', incoming: 'Lightweight, weather-resistant backpack', kind: 'conflict', note: 'Both versions differ from the snapshot. Choose which description to keep.' },
];

export default function MicroPimDiff({ paused }: { paused: boolean }) {
  const [stage, setStage] = useState(0);
  const [choice, setChoice] = useState<'live' | 'incoming' | null>(null);
  const [published, setPublished] = useState(false);
  const [active, setActive] = useState(2);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function compare() {
    if (timer.current) clearTimeout(timer.current);
    setChoice(null); setPublished(false); setStage(paused ? 2 : 1);
    if (!paused) timer.current = setTimeout(() => setStage(2), 850);
  }
  const compared = stage === 2;
  return <div className="pim-demo">
    <div className="pim-toolbar"><span><GitCompareArrows size={19} /><strong>micro pim</strong><span className="pim-toolbar-sub">/ product enrichment</span></span><span className="pim-status">{published ? 'Preview applied' : compared ? choice ? 'Ready to review' : '1 decision needed' : stage === 1 ? 'Comparing versions…' : 'Ready to compare'}</span></div>
    <div className="pim-product"><div className="pim-product-icon">↔</div><div><strong>One product. Three perspectives.</strong><span>TRAIL-001 · Sample product</span></div><button disabled={stage === 1} onClick={compare}>{compared ? <RotateCcw size={12} /> : <GitCompareArrows size={13} />}{compared ? 'Reset demo' : stage === 1 ? 'Comparing…' : 'Compare versions'}</button></div>
    <div className={`pim-table-wrap ${stage === 1 ? 'pim-scanning' : ''}`}>
      <table className="pim-table"><thead><tr><th>FIELD</th><th><span className="version-number">01</span> Last snapshot<small>Previous sync</small></th><th><span className="version-number">02</span> BigCommerce<small>Current store data</small></th><th><span className="version-number">03</span> Incoming supplier<small>Next update</small></th></tr></thead><tbody>{fields.map((field, i) => <tr key={field.label} className={`${compared ? field.kind : ''} ${active === i ? 'pim-selected' : ''}`}><th><button onClick={() => setActive(i)} aria-pressed={active === i}>{field.label}<small>{compared ? { protected: 'STORE EDIT', update: 'SUPPLIER UPDATE', conflict: choice ? 'RESOLVED' : 'CONFLICT' }[field.kind] : 'AWAITING DIFF'}</small></button></th><td>{field.base}</td><td className={compared && (field.kind === 'protected' || (field.kind === 'conflict' && choice === 'live')) ? 'pim-kept' : ''}>{field.live}</td><td className={compared && (field.kind === 'update' || (field.kind === 'conflict' && choice === 'incoming')) ? 'pim-kept' : ''}>{field.incoming}</td></tr>)}</tbody></table>
    </div>
    <div className="pim-explanation"><ShieldCheck size={17} /><p>{compared ? fields[active].note : 'Compare all three versions to reveal supplier updates and edits made directly in the store.'}</p></div>
    {compared && <div className="pim-resolution"><div><span className="pim-label">{choice ? 'DESCRIPTION RESOLVED' : 'BOTH SIDES CHANGED'}</span><strong>{choice ? 'Your choice. Your catalog.' : 'Which description should win?'}</strong></div><div className="pim-choices"><button disabled={published} aria-pressed={choice === 'live'} onClick={() => setChoice('live')}>{choice === 'live' && <Check size={12} />}Keep store edit</button><button disabled={published} aria-pressed={choice === 'incoming'} onClick={() => setChoice('incoming')}>{choice === 'incoming' && <Check size={12} />}Use supplier</button></div></div>}
    {choice && <div className="pim-result"><div className="pim-result-title"><span>MERGED PREVIEW</span><span><Check size={11} /> Conflict resolved</span></div><dl>{fields.map(field => <div key={field.label}><dt>{field.label}</dt><dd>{field.kind === 'update' ? field.incoming : field.kind === 'conflict' && choice === 'incoming' ? field.incoming : field.live}</dd></div>)}</dl></div>}
    <div className="pim-footer"><span role="status">{published ? '✓ Applied to this demo only. Your store is untouched.' : 'ILLUSTRATIVE DATA · NO STORE CONNECTION'}</span>{compared && <button disabled={!choice || published} onClick={() => setPublished(true)}>{published ? 'Demo complete' : 'Apply to demo'}{published ? <Check size={14} /> : <ArrowRight size={14} />}</button>}</div>
  </div>;
}

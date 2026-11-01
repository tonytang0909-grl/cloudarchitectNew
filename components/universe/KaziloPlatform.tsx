'use client';
import { useRef, useState } from 'react';
import { ArrowUpRight, Braces, Cloud, Workflow, Check } from 'lucide-react';
const platforms = [
  { name: 'Adobe Commerce', mark: 'A', role: 'Commerce operations', color: '#ff947c', event: 'Order received', action: 'Route fulfilment', detail: 'A dedicated frontend for Adobe Commerce users, connected to the shared authoring and execution capabilities.' },
  { name: 'BigCommerce', mark: 'B', role: 'Merchant workspace', color: '#b8a2ff', event: 'Order created', action: 'Notify the team', detail: 'A platform-specific merchant experience, with the integration engine and cloud infrastructure underneath.' },
  { name: 'Akeneo', mark: 'a', role: 'Product operations', color: '#a6e8c6', event: 'Product updated', action: 'Publish enrichment', detail: 'A dedicated frontend for product teams, bringing the same workflow capabilities into an Akeneo-focused experience.' },
];
export default function KaziloPlatform() {
 const [selected,setSelected] = useState(0);
 const controls = useRef<(HTMLButtonElement|null)[]>([]);
 const p = platforms[selected];
 return <section className="platform-showcase" aria-label="Kazilo platform architecture" style={{'--platform-color':p.color} as React.CSSProperties}>
  <div className="platform-story"><span className="eyeline">ONE PLATFORM. BUILT END TO END.</span><h2>Three front doors.<br/><em>One powerful engine.</em></h2><p>I built the backend, cloud infrastructure, execution engine and three distinct frontends. Familiar where people work. Connected underneath.</p><div className="ownership-stamp"><span>01</span><div><strong>Sole engineering owner</strong><small>Architecture → infrastructure → product</small></div></div></div>
  <div className="platform-theatre"><div className="platform-switch" role="tablist" aria-label="Platform frontend">{platforms.map((item,i)=><button key={item.name} role="tab" ref={el => { controls.current[i] = el; }} tabIndex={selected===i ? 0 : -1} onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;setSelected(next);controls.current[next]?.focus();}}} id={`platform-${i}`} aria-selected={selected===i} aria-controls="platform-preview" onClick={()=>setSelected(i)} style={{'--tab-color':item.color} as React.CSSProperties}><b>{item.mark}</b><span>{item.name}</span></button>)}</div>
  <div className="platform-window" id="platform-preview" role="tabpanel" aria-labelledby={`platform-${selected}`}><div className="window-chrome"><span><i/><i/><i/></span><small>{p.name} / Kazilo</small><ArrowUpRight size={13}/></div><div className="platform-window-body" key={p.name}><aside><b>{p.mark}</b><span/><span/><span/></aside><div><span className="eyeline">{p.role}</span><h3>Your next connection.</h3><div className="mini-flow"><span><Workflow size={15}/>{p.event}</span><i/><span><Check size={15}/>{p.action}</span></div><p>{p.detail}</p></div></div><div className="platform-caption">ILLUSTRATIVE INTERFACE · EXAMPLE WORKFLOW</div></div>
  <div className="engine-bridges" aria-hidden="true"><i/><i/><i/></div><div className="shared-engine"><span className="engine-symbol">✳</span><div><small>KAZILO / SHARED CORE</small><strong>From intent to execution.</strong></div><span className="engine-live"><i/> CONNECTED</span></div><div className="engine-layers"><span><Braces size={13}/> Backend & APIs</span><span><Workflow size={13}/> Execution engine</span><span><Cloud size={13}/> Cloud infrastructure</span></div></div>
 </section>;
}

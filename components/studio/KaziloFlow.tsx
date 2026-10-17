'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Check, GitBranch, Pause, Play, RotateCcw, ShoppingBag, Sparkles, Tag, Send } from 'lucide-react';

const nodes = [
  { id: 'order', x: 285, y: 25, title: 'Order created', subtitle: 'BigCommerce · Event trigger', icon: ShoppingBag, color: 'lavender', detail: 'A new order starts the workflow. Its customer and order data travel with it.' },
  { id: 'condition', x: 285, y: 145, title: 'Order total > $200?', subtitle: 'Condition · Choose a path', icon: GitBranch, color: 'peach', detail: 'The condition checks the order total, then routes the payload down the matching branch.' },
  { id: 'enrich', x: 95, y: 285, title: 'Map priority fields', subtitle: 'Data mapper · Shape the payload', icon: Sparkles, color: 'lavender', detail: 'Map the high-value order into the fields required by the priority fulfilment action.' },
  { id: 'tag', x: 475, y: 285, title: 'Tag for fulfillment', subtitle: 'Action · Standard order', icon: Tag, color: 'blue', detail: 'Standard orders take the other branch and are tagged for the fulfillment team.' },
  { id: 'send', x: 95, y: 405, title: 'Notify priority team', subtitle: 'Action · Send notification', icon: Send, color: 'green', detail: 'Send the mapped order details to the priority team through a configured action.' },
  { id: 'done', x: 475, y: 405, title: 'Ready to fulfill', subtitle: 'Action · Notify the team', icon: Check, color: 'green', detail: 'Notify the team that the order is ready for fulfillment.' },
];
const paths = [
  'M380 97 L380 145',
  'M380 217 L380 242 Q380 253 369 253 L201 253 Q190 253 190 264 L190 285',
  'M380 217 L380 242 Q380 253 391 253 L559 253 Q570 253 570 264 L570 285',
  'M190 357 L190 405',
  'M570 357 L570 405',
];

const mobilePaths = ['M170 104 L170 170.5', 'M170 230.5 L170 260 Q170 270 160 270 L95 270 Q85 270 85 280 L85 313.5', 'M170 230.5 L170 260 Q170 270 180 270 L245 270 Q255 270 255 280 L255 313.5', 'M85 373.5 L85 440', 'M255 373.5 L255 440'];

export default function KaziloFlow({ paused }: { paused: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(-1);
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [vip, setVip] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setStep(s => s < 0 ? 0 : s);
    }, { threshold: .25 });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || !playing || paused || step < 0) return;
    const timer = setTimeout(() => {
      if (step === 7) { setRun(r => r + 1); setStep(0); }
      else setStep(s => s + 1);
    }, step === 7 ? 3200 : step % 2 ? 900 : 1100);
    return () => clearTimeout(timer);
  }, [visible, playing, paused, step]);
  const activeId = step < 2 ? 'order' : step < 4 ? 'condition' : step < 6 ? (vip ? 'enrich' : 'tag') : (vip ? 'send' : 'done');
  const completed = step === 7;
  const current = nodes.find(n => n.id === (selected ?? activeId))!;
  function choose(value: boolean) { setVip(value); setRun(r => r + 1); setStep(paused ? 7 : 0); setPlaying(true); setSelected(null); }
  function nodeState(id: string) {
    if (step < 0) return '';
    if ((vip && ['tag', 'done'].includes(id)) || (!vip && ['enrich', 'send'].includes(id))) return step >= 3 ? 'bypassed' : '';
    const stage = id === 'order' ? 0 : id === 'condition' ? 2 : ['enrich', 'tag'].includes(id) ? 4 : 6;
    return step > stage ? 'complete' : step === stage ? 'active' : '';
  }
  return <div ref={root} className="orkest-experience">
    <div className="orkest-toolbar"><div className="orkest-brand"><span>✳</span><strong>kazilo</strong><span className="flow-slash">/</span><span>Make every order count</span></div><span className={`flow-status ${completed ? 'success' : ''}`}><i />{completed ? 'Run complete' : step < 0 ? 'Ready to run' : paused || !playing ? 'Paused' : 'Workflow running'}</span></div>
    <div className="flow-controls"><div><span className="flow-control-label">TRY AN ORDER</span><div className="order-switch" aria-label="Example order"><button aria-pressed={vip} onClick={() => choose(true)}>$280 <span>VIP</span></button><button aria-pressed={!vip} onClick={() => choose(false)}>$65 <span>STANDARD</span></button></div></div><div className="flow-playback"><button aria-label="Replay Kazilo workflow" onClick={() => { setStep(paused ? 7 : 0); setRun(r => r + 1); setPlaying(true); }}><RotateCcw size={14} /></button><button disabled={paused} aria-label={playing ? 'Pause Kazilo workflow' : 'Play Kazilo workflow'} onClick={() => setPlaying(p => !p)}>{playing && !paused ? <Pause size={14} /> : <Play size={14} />}</button></div></div>
    <div className="flow-scroll"><div className={`flow-canvas ${!playing || paused || !visible ? 'flow-paused' : ''}`}>
      <div className="canvas-caption"><span>COMMERCE, CHOREOGRAPHED.</span><span>01 — ORDER EXPERIENCE</span></div>
      {[false, true].map(mobile => <svg key={String(mobile)} viewBox={mobile ? "0 0 340 550" : "0 0 760 510"} className={`flow-wires ${mobile ? "mobile-wires" : "desktop-wires"}`} fill="none" aria-hidden="true">
        {(mobile ? mobilePaths : paths).map((path, i) => {
          const start = i === 0 ? 1 : i < 3 ? 3 : 5;
          const chosen = i === 0 || (vip ? [1, 3].includes(i) : [2, 4].includes(i));
          return <g key={i}><path d={path} className="wire-base" />{chosen && step >= start && <motion.path key={`${run}-${i}`} d={path} className="wire-progress" initial={{ pathLength: paused ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: paused ? 0 : .8, ease: 'easeInOut' }} />}{chosen && step === start && <circle r="5" className="data-packet" style={{ offsetPath: `path('${path}')` }} />}</g>;
        })}
      </svg>)}
      <span className={`branch-label branch-yes ${step >= 3 && vip ? 'chosen' : ''}`}>✓ YES</span><span className={`branch-label branch-no ${step >= 3 && !vip ? 'chosen' : ''}`}>↳ NO</span>
      {nodes.map(node => { const Icon = node.icon; const state = nodeState(node.id); return <button key={node.id} className={`flow-node ${node.color} ${state} ${selected === node.id ? 'inspected' : ''}`} style={{ left: `${node.x / 760 * 100}%`, top: `${node.y / 510 * 100}%` }} onClick={() => setSelected(node.id)} aria-label={`Inspect ${node.title}`} aria-pressed={selected === node.id}>
        <span className="node-port port-in" /><span className="node-icon"><Icon size={17} /></span><span className="node-copy"><strong>{node.title}</strong><small>{node.subtitle}</small></span><span className="node-state">{state === 'complete' ? <Check size={11} /> : state === 'active' ? <span className="node-spinner" /> : null}</span><span className="node-port port-out" />
      </button>; })}
      <div className={`payload-chip ${step > 1 ? 'payload-passed' : ''}`}><span>↳</span> order.total <b>${vip ? '280.00' : '65.00'}</b></div>
      {completed && <div role="status" className="flow-completion" key={`complete-${run}`}><Check size={13} /><span>{vip ? 'Priority order mapped and routed.' : 'Another order, effortlessly routed.'}</span><span className="completion-spark">✳</span></div>}
    </div></div>
    <div className="flow-inspector"><span className="inspector-icon"><current.icon size={18} /></span><div><strong>{current.title}</strong><p>{current.detail}</p></div><ArrowUpRight size={17} /></div>
    <div className="flow-footnote"><span>ILLUSTRATIVE WORKFLOW · NO LIVE ORDERS</span><span>CLICK A NODE TO EXPLORE ↗</span></div>
  </div>;
}

'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, ArrowRight, Check, CheckCheck, ChevronRight, CircleAlert, Code2, Database, Mail, Pause, Play, RotateCcw, ScanLine, ShoppingBag, Sparkles, Workflow, X } from 'lucide-react';

const examples = [
  { name: 'Order notification', prompt: 'When an order arrives, notify the fulfilment team by email.', event: 'order.created', eventName: 'Order created', action: 'email.send', actionName: 'Notify the team', wrong: 'team.notify', field: 'to: fulfilment@example.test', icon: ShoppingBag },
  { name: 'Product update', prompt: 'When a product changes, send the updated product to a webhook.', event: 'product.updated', eventName: 'Product updated', action: 'webhook.send', actionName: 'Send product update', wrong: 'product.syncAll', field: 'url: https://example.test/products', icon: Database },
];
const phases = ['Discover', 'Generate', 'Validate', 'Refine', 'Ready'];

export default function KaziloAI({ paused }: { paused: boolean }) {
  const [scenario, setScenario] = useState(0);
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [inspect, setInspect] = useState<number | null>(null);
  const [mode, setMode] = useState<'feedback' | 'definition'>('feedback');
  const sample = examples[scenario];
  useEffect(() => {
    if (!running || paused || step < 0 || step >= 4) return;
    const timer = setTimeout(() => { setStep(s => s + 1); setInspect(null); }, step === 2 ? 2800 : 1600);
    return () => clearTimeout(timer);
  }, [step, running, paused]);
  const next = () => { setStep(s => Math.min(4, s + 1)); setInspect(null); };
  function begin() { setStep(0); setRunning(true); setInspect(null); setMode('feedback'); }
  function choose(i: number) { setScenario(i); setStep(-1); setRunning(false); setInspect(null); }
  const corrected = step >= 3;
  const definition = { trigger: sample.event, actions: [{ id: corrected ? sample.action : sample.wrong, config: scenario === 0 ? { to: 'fulfilment@example.test' } : { url: 'https://example.test/products' } }], status: step === 4 ? 'validated' : 'draft' };
  const states = [
    { title: 'Start with what exists.', text: 'The capability API returns the events and actions available to this workspace.', code: `GET /capabilities\n\nevents\n  order.created\n  product.updated\n\nactions\n  email.send\n  webhook.send`, label: 'REGISTRY LOOKUP' },
    { title: 'A draft, not a promise.', text: 'Generation uses the discovered capabilities. This example deliberately includes an unsupported action so you can see the feedback path.', code: `draft.action = "${sample.wrong}"\nvalidation = pending`, label: 'MODEL OUTPUT · DRAFT' },
    { title: 'That action doesn’t exist.', text: 'Validation catches the unsupported identifier. The issue and available alternatives return to the generator.', code: `ACTION_NOT_FOUND\n\nreceived: ${sample.wrong}\navailable: email.send, webhook.send\n\n↳ feedback to generator`, label: 'VALIDATION FEEDBACK' },
    { title: 'A correction with context.', text: 'The draft is revised to use a registered action. The revised definition is checked again.', code: `− ${sample.wrong}\n+ ${sample.action}\n\nrevalidate(updatedFlow)`, label: 'REFINED DEFINITION' },
    { title: 'A flow you can inspect.', text: 'The sample definition now references available capabilities. Validation is complete; no workflow has been deployed or executed.', code: `✓ event: ${sample.event}\n✓ action: ${sample.action}\n✓ example validation passed`, label: 'READY FOR REVIEW' },
  ];
  const current = states[Math.max(0, step)];
  const EventIcon = sample.icon;
  return <div className={`ai-workbench ${paused ? 'ai-paused' : ''}`}>
    <div className="ai-topline"><span><Sparkles size={14} /> KAZILO / AI FLOW STUDIO</span><span className="demo-badge">Interactive simulation</span></div>
    <div className="ai-prompt-area">
      <div className="ai-examples" aria-label="Example request">{examples.map((e, i) => <button key={e.name} aria-pressed={scenario === i} onClick={() => choose(i)}>{e.name}</button>)}</div>
      <div className="ai-prompt"><Sparkles className="prompt-star" size={22} /><p>{sample.prompt}</p><button className="generate-button" onClick={begin} aria-label={step < 0 ? 'Generate example flow' : 'Restart generation'}>{step < 0 ? <ArrowUp size={22} /> : <RotateCcw size={19} />}</button></div>
      <div className="prompt-meta"><span>Two curated examples · fictional capability IDs</span><span>CLAUDE / GPT IN THE REAL PRODUCT</span></div>
    </div>
    <div className="ai-phasebar" aria-label="Generation progress">{phases.map((phase, i) => <span key={phase} className={`${step === i ? 'phase-active' : ''} ${step > i ? 'phase-complete' : ''}`}>{step > i ? <Check size={12} /> : <i>{i + 1}</i>}{phase}{i < 4 && <ChevronRight size={12} />}</span>)}</div>
    <div className="ai-main">
      <div className="ai-canvas">
        <div className="canvas-meta"><span>WORKFLOW / {scenario === 0 ? 'ORDER EXPERIENCE' : 'PRODUCT SYNC'}</span><span>01</span></div>
        <div className="ai-node-stack">
          <motion.button layout className={`ai-node ${step < 0 ? 'node-ghost' : ''} ${inspect === 0 ? 'node-inspected' : ''}`} onClick={() => setInspect(0)} aria-label="Inspect trigger node"><span className="ai-node-icon violet"><EventIcon size={20} /></span><span><strong>{sample.eventName}</strong><small>{step < 0 ? 'Trigger · awaiting discovery' : sample.event}</small></span>{step >= 0 && <Check size={15} className="node-check" />}<i className="node-socket" /></motion.button>
          <div className={`ai-connection ${step >= 1 ? 'connected' : ''}`}><span /></div>
          <motion.button layout animate={paused ? {} : { x: step === 2 ? [0, -5, 5, -3, 0] : 0 }} transition={{ duration: .4 }} className={`ai-node ${step < 1 ? 'node-ghost' : ''} ${step === 2 ? 'node-invalid' : ''} ${corrected ? 'node-corrected' : ''} ${inspect === 1 ? 'node-inspected' : ''}`} onClick={() => setInspect(1)} aria-label="Inspect action node"><span className={`ai-node-icon ${step === 2 ? 'orange' : 'lime'}`}>{step === 2 ? <CircleAlert size={20} /> : scenario === 0 ? <Mail size={20} /> : <Workflow size={20} />}</span><span><strong>{step === 1 || step === 2 ? 'Unregistered action' : sample.actionName}</strong><small>{step < 1 ? 'Action · awaiting generation' : corrected ? sample.action : sample.wrong}</small></span>{corrected && <Check size={15} className="node-check" />}<i className="node-socket" /></motion.button>
          <AnimatePresence>{step === 2 && <motion.div className="feedback-return" initial={paused ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}><span>↰</span> Unknown action → generation feedback</motion.div>}</AnimatePresence>
          <div className={`ai-connection ${step === 4 ? 'connected success' : ''}`}><span /></div>
          <div className={`ai-finish ${step === 4 ? 'finish-ready' : ''}`}><CheckCheck size={17} /><span>{step === 4 ? 'Validated · ready to review' : 'Validate the definition'}</span></div>
        </div>
        <div className="canvas-instruction"><ScanLine size={13} /> Select a node to inspect its definition</div>
      </div>
      <aside className="ai-inspector">
        <div className="inspector-tabbar"><button aria-pressed={mode === 'feedback'} onClick={() => setMode('feedback')}>Feedback</button><button aria-pressed={mode === 'definition'} onClick={() => setMode('definition')}><Code2 size={13} /> Definition</button></div>
        {mode === 'definition' ? <div className="ai-inspector-body"><span className="micro-label">SIMPLIFIED FLOW JSON</span><pre>{JSON.stringify(definition, null, 2)}</pre><p>This explains the generation state; it is not a deployable workflow artifact.</p></div> : inspect !== null ? <div className="ai-inspector-body"><div className="inspection-title"><span className="micro-label">NODE INSPECTOR</span><button aria-label="Close node inspection" onClick={() => setInspect(null)}><X size={15} /></button></div><h4>{inspect === 0 ? sample.eventName : sample.actionName}</h4><p>{inspect === 0 ? 'A registered event supplies the workflow’s starting context.' : 'An action identifier must match the discovered registry. Configuration is validated before the flow is ready.'}</p><pre>{inspect === 0 ? `type: trigger\nid: ${sample.event}\nsource: capability registry` : `type: action\nid: ${corrected ? sample.action : step >= 1 ? sample.wrong : '(not generated)'}\n${sample.field}`}</pre></div> : <div className="ai-inspector-body" aria-live="polite"><span className="micro-label">{step < 0 ? 'BEFORE THE FIRST TOKEN' : current.label}</span><h4>{step < 0 ? 'Possibility, with boundaries.' : current.title}</h4><p>{step < 0 ? 'Choose an example and generate its flow. Watch capability discovery, a deliberate validation failure, and the correction that follows.' : current.text}</p>{step >= 0 ? <pre className={step === 2 ? 'error-code' : ''}>{current.code}</pre> : <div className="idle-inspector"><Database size={23} /><span>Discover</span><ArrowRight size={14} /><Sparkles size={23} /><span>Generate</span></div>}</div>}
      </aside>
    </div>
    <div className="ai-bottom"><span role="status"><i className={step === 2 ? 'status-warning' : ''} />{step < 0 ? 'Ready for your first example' : step === 4 ? 'Example validated. Nothing deployed.' : `${phases[step]} ${paused || !running ? '· paused' : '· in progress'}`}</span><div>{step >= 0 && step < 4 && <><button className="quiet-button" onClick={() => setRunning(!running)} disabled={paused}>{running && !paused ? <Pause size={13} /> : <Play size={13} />}{running && !paused ? 'Pause' : 'Resume'}</button><button className="quiet-button" onClick={() => { setRunning(false); next(); }}>Next step <ArrowRight size={14} /></button></>}{step === 4 && <button className="quiet-button" onClick={begin}>Replay <RotateCcw size={13} /></button>}</div></div>
  </div>;
}

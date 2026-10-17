'use client';

import { useEffect, useState } from 'react';
import { Braces, Check, CloudUpload, GripVertical, Layers, Play, RotateCcw, ShieldCheck } from 'lucide-react';

type ActionId = 'sku' | 'quantity' | 'address';
const actions: { id: ActionId; title: string; detail: string }[] = [
  { id: 'sku', title: 'Validate SKU', detail: 'Check the product reference' },
  { id: 'quantity', title: 'Check quantity', detail: 'Validate the requested quantity' },
  { id: 'address', title: 'Check address', detail: 'Validate the delivery address' },
];
const clients = ['Client A', 'Client B', 'Client C'];

export default function OrderValidator({ paused }: { paused: boolean }) {
  const [inside, setInside] = useState<ActionId[]>(['sku', 'quantity']);
  const [dragged, setDragged] = useState<ActionId | null>(null);
  const [stage, setStage] = useState<'design' | 'compiling' | 'compiled'>('design');
  const [selected, setSelected] = useState('Client A');
  const [deployed, setDeployed] = useState<string[]>([]);
  const [notice, setNotice] = useState('Move a node into the area to include it in the Map state.');
  useEffect(() => {
    if (stage !== 'compiling') return;
    const timer = setTimeout(() => { setStage('compiled'); setNotice('Definition compiled. Choose a configured client for the deployment preview.'); }, paused ? 0 : 950);
    return () => clearTimeout(timer);
  }, [stage, paused]);
  function move(id: ActionId, toMap: boolean) {
    setInside(current => toMap ? current.includes(id) ? current : [...current, id] : current.filter(value => value !== id));
    setStage('design'); setDeployed([]); setDragged(null);
    setNotice(`${actions.find(action => action.id === id)!.title} ${toMap ? 'is inside the Map area' : 'now runs at order level'}. Compile to update the definition.`);
  }
  const definition = {
    name: 'validate-order',
    states: [
      ...actions.filter(action => !inside.includes(action.id)).map(action => ({ type: 'Task', action: action.id })),
      ...(inside.length ? [{ type: 'Map', items: 'order.items', body: inside.map(id => ({ type: 'Task', action: id })) }] : []),
    ],
  };
  function card(action: typeof actions[number], inMap: boolean) {
    return <div className={`validator-node ${dragged === action.id ? 'dragging' : ''}`} key={action.id} draggable onDragStart={event => { event.dataTransfer.setData('text/plain', action.id); event.dataTransfer.effectAllowed = 'move'; setDragged(action.id); }} onDragEnd={() => setDragged(null)}><GripVertical size={14} /><div><strong>{action.title}</strong><small>{action.detail}</small></div><button onClick={() => move(action.id, !inMap)} aria-label={`${inMap ? 'Move out of Map' : 'Move into Map'}: ${action.title}`}>{inMap ? 'Move out ↗' : 'To Map ↓'}</button></div>;
  }
  function drop(event: React.DragEvent, toMap: boolean) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    if (actions.some(action => action.id === id)) move(id as ActionId, toMap);
  }
  return <div className="validator-demo">
    <div className="validator-toolbar"><span><Layers size={18} /><strong>order validator</strong><small>DESIGN → COMPILE → DEPLOY</small></span><button aria-label="Reset Order Validator demo" onClick={() => { setInside(['sku', 'quantity']); setStage('design'); setDeployed([]); setNotice('Canvas reset. Two item checks are inside the Map area.'); }}><RotateCcw size={14} /></button></div>
    <div className="validator-story"><h4>Draw the boundary.<br /><em>Define the execution.</em></h4><p>The canvas produces a JSON flow definition. A dedicated area gives its enclosed actions Map semantics; the compiled flow can then target any pre-configured client.</p></div>
    <div className="validator-workbench">
      <div className="validator-design"><div className="validator-panel-heading"><span>01 / DESIGN TIME</span><span>DRAG OR USE MOVE BUTTONS</span></div>
        <div className={`order-scope ${dragged ? 'drop-ready' : ''}`} onDragOver={event => event.preventDefault()} onDrop={event => drop(event, false)}><span className="validator-scope-label">ORDER LEVEL</span>{actions.filter(action => !inside.includes(action.id)).map(action => card(action, false))}{inside.length === actions.length && <p className="validator-empty">Drop a node here to run it outside the Map.</p>}</div>
        <div className={`map-scope ${dragged ? 'drop-ready' : ''} ${stage === 'compiling' ? 'scope-compiling' : ''}`} onDragOver={event => event.preventDefault()} onDrop={event => drop(event, true)}><div className="map-scope-title"><span><Layers size={14} /> MAP AREA</span><code>order.items[]</code></div>{inside.map(id => card(actions.find(action => action.id === id)!, true))}{!inside.length && <p className="validator-empty">Drop an action here to create a Map state.</p>}<div className="map-scope-caption">{inside.length} enclosed {inside.length === 1 ? 'action' : 'actions'} → {inside.length ? '1 Map state' : 'no Map state'}</div></div>
        <div className="validator-design-foot"><span>Spatial grouping becomes execution structure.</span><button disabled={stage === 'compiling'} onClick={() => { setStage(paused ? 'compiled' : 'compiling'); setDeployed([]); setNotice(paused ? 'Compiled. Choose a configured client for the deployment preview.' : 'Compiling canvas groups into a flow definition…'); }}><Play size={12} />{stage === 'compiling' ? 'Compiling…' : 'Compile flow'}</button></div>
      </div>
      <div className="validator-output"><div className="validator-panel-heading"><span>02 / COMPILED DEFINITION</span><Braces size={15} /></div><div className={`validator-code ${stage === 'compiled' ? 'code-ready' : ''}`}><span className="validator-code-label">{stage === 'compiled' ? 'COMPILED · SIMPLIFIED JSON' : stage === 'compiling' ? 'BUILDING DEFINITION…' : 'COMPILE TO GENERATE JSON'}</span><pre>{stage === 'compiled' ? JSON.stringify(definition, null, 2) : '{\n  "name": "validate-order",\n  "states": […]\n}'}</pre>{stage === 'compiled' && <span className="validator-code-success"><Check size={13} /> Same definition. Different clients.</span>}</div></div>
    </div>
    <div className="validator-deployment"><div><span className="validator-panel-heading">03 / DEPLOYMENT TARGET</span><strong>Build once. Select a client.</strong></div><div className="validator-clients">{clients.map(client => <button key={client} aria-pressed={selected === client} onClick={() => setSelected(client)}>{deployed.includes(client) ? <Check size={12} /> : <span className="client-dot" />}{client}</button>)}</div><button className="validator-deploy-button" disabled={stage !== 'compiled' || deployed.includes(selected)} onClick={() => { setDeployed(current => [...current, selected]); setNotice(`Deployment simulated for ${selected}. The same compiled definition is available for the other clients.`); }}><CloudUpload size={14} />{deployed.includes(selected) ? 'Preview deployed' : 'Simulate deploy'}</button></div>
    <p className="validator-notice" role="status">{notice}</p>
    <div className="validator-architecture"><span><ShieldCheck size={14} /><b>Cognito</b> User management</span><span><b>RDS Serverless</b></span><span><b>DynamoDB + S3</b> Core flow</span></div>
    <div className="validator-difference"><strong>Different by design.</strong><p><b>Orkest</b> makes commerce workflows visual. <b>Order Validator</b> adds a compilation layer: canvas regions become execution semantics, and generated definitions can be deployed to configured clients.</p></div>
    <div className="validator-disclaimer">ILLUSTRATIVE CHECKS & CLIENTS · SIMPLIFIED COMPILED STRUCTURE · NO AWS DEPLOYMENT</div>
  </div>;
}

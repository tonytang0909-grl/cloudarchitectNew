'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Code2, Fingerprint, Layers3, Play, Sparkles } from 'lucide-react';
import KaziloAI from './KaziloAI';
import { Flex, Lamb, Nexus, Notifications } from '../studio/ProjectStudio';
import { Work, work } from './content';

export default function ProjectExperience({ project, paused, back, select }: { project: Work; paused: boolean; back: () => void; select: (slug: string) => void }) {
  const [tab, setTab] = useState('experience');
  useEffect(() => { document.getElementById('project-main')?.focus({ preventScroll: true }); }, []);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = work.findIndex(p => p.slug === project.slug);
  const next = work[(index + 1) % work.length];
  const tabItems = [['experience', 'Experience it', Play], ['architecture', 'Under the hood', Layers3], ['contribution', 'My contribution', Fingerprint]] as const;
  return <motion.main className="project-page" id="project-main" tabIndex={-1} style={{ '--project-accent': project.color, '--accent': project.color } as React.CSSProperties} initial={paused ? false : { opacity: 0, y: 34, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: .65, ease: [.16, 1, .3, 1] }}>
    <div className="project-breadcrumb"><button onClick={back}><ArrowLeft size={15} /> Project universe</button><span>{String(index + 1).padStart(2, '0')} / 05</span></div>
    <div className="project-intro"><div><span className="eyeline"><i />{project.eyebrow}</span><h1>{project.headline[0]}<br /><em>{project.headline[1]}</em></h1></div><div className="project-summary"><span className="project-wordmark">{project.name}<ArrowUpRight size={21} /></span><p>{project.intro}</p><span className="project-status"><i />{project.status}</span></div></div>
    <div className="project-navigation"><div role="tablist" aria-label="Case study view">{tabItems.map(([id, label, Icon], i) => <button key={id} ref={el => { tabs.current[i] = el; }} role="tab" id={`tab-${id}`} aria-selected={tab === id} aria-controls="case-panel" tabIndex={tab === id ? 0 : -1} onClick={() => setTab(id)} onKeyDown={e => { if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const at = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (i + (e.key === 'ArrowRight' ? 1 : 2)) % 3; setTab(tabItems[at][0]); tabs.current[at]?.focus(); } }}><Icon size={15} />{label}</button>)}</div><span>EXPLORE THE WORK <ArrowDown size={12} /></span></div>
    <div id="case-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
      {tab === 'experience' && <>
        {project.slug === 'kazilo' ? <KaziloAI paused={paused} /> : <div className={`studio-stage new-studio ${paused ? 'studio-paused' : ''}`}>{project.slug === 'flexval' ? <Flex /> : project.slug === 'nexusmf' ? <Nexus /> : project.slug === 'lamb' ? <Lamb paused={paused} /> : <Notifications paused={paused} />}</div>}
        <div className="demo-disclosure"><span><Sparkles size={12} /> RECREATED PRODUCT EXPERIENCE</span><p>Synthetic data, scripted interactions, no live services. Explore the architecture for delivered capabilities and planned work.</p></div>
      </>}
      {tab === 'architecture' && <section className="architecture-view"><div className="architecture-heading"><span className="eyeline">THE SYSTEM BEHIND THE EXPERIENCE</span><h2>Good connections.<br /><em>Deliberate boundaries.</em></h2><p>{project.architectureNote}</p></div><div className="architecture-path">{project.architecture.map((n, i) => <div key={n}><span className="architecture-step"><small>{String(i + 1).padStart(2, '0')}</small><Code2 size={19} /><strong>{n}</strong></span>{i < project.architecture.length - 1 && <ArrowRight size={17} className="architecture-arrow" />}</div>)}</div>{project.slug === 'kazilo' && <div className="feedback-architecture"><span>↰</span> Validation feedback returns to generation before the flow is ready for review.</div>}<div className="decision-grid">{project.decisions.map(([title, description], i) => <article key={title}><span className="decision-number">0{i + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>}
      {tab === 'contribution' && <section className="contribution-view"><div className="contribution-statement"><Fingerprint size={35} /><span className="eyeline">THE PART I PLAYED</span><h2>From decisions<br /><em>to delivery.</em></h2><p>{project.contribution}</p></div><div className="contribution-context"><span className="eyeline">CONTEXT & OWNERSHIP</span><p>{project.attribution}</p><div className="scope-box"><Check size={18} /><p>{project.note}</p></div><span className="eyeline">TECHNOLOGIES & TOOLS</span><div className="tech-pills">{project.tags.map(t => <span key={t}>{t}</span>)}</div></div></section>}
    </div>
    <div className="project-bottom-note"><span>THE ENGINEERING IDEA</span><p>{project.solution}</p><button onClick={() => setTab(tab === 'architecture' ? 'experience' : 'architecture')}>{tab === 'architecture' ? 'Back to the demo' : 'Explore the architecture'} <ArrowUpRight size={17} /></button></div>
    <button className="next-project" onClick={() => select(next.slug)}><span className="eyeline">NEXT CONNECTION / {String((index + 1) % 5 + 1).padStart(2, '0')}</span><strong>{next.name}</strong><ArrowRight size={36} /></button>
  </motion.main>;
}

'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Copy, Github, Linkedin, Mail, Pause, Play } from 'lucide-react';
import ProjectExperience from '@/components/universe/ProjectExperience';
import SystemMap from '@/components/universe/SystemMap';
import { work } from '@/components/universe/content';

const subscribeMotion = (callback: () => void) => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); media.addEventListener('change', callback); return () => media.removeEventListener('change', callback); };
const readMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Portfolio() {
  const reduced = useSyncExternalStore(subscribeMotion, readMotion, () => false);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const paused = motionOverride ?? reduced;
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const focusAfterNavigation = useRef(false);
  const pendingAnchor = useRef<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const project = work.find(p => p.slug === selected);
  useEffect(() => {
    function sync() {
      const slug = window.location.hash.replace('#project/', '');
      setSelected(work.some(p => p.slug === slug) ? slug : null);
    }
    sync(); window.addEventListener('hashchange', sync);
    return () => { window.removeEventListener('hashchange', sync); if (copyTimer.current) clearTimeout(copyTimer.current); };
  }, []);
  useEffect(() => {
    document.title = project ? `${project.name} — Tony Tang` : 'Tony Tang — Connecting the disconnected';

  }, [project]);
  function select(slug: string | null) {
    focusAfterNavigation.current = true;
    window.location.hash = slug ? `project/${slug}` : 'work';
    setSelected(slug);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function navigateTo(id: string) {
    pendingAnchor.current = id;
    setSelected(null); window.location.hash = id;
    if (!project || id === 'connect') finishNavigation();
  }
  function finishNavigation() {
    if (pendingAnchor.current) {
      const target = document.getElementById(pendingAnchor.current);
      if (target) { target.scrollIntoView({ behavior: paused ? 'instant' : 'smooth' }); pendingAnchor.current = null; }
    }
    if (focusAfterNavigation.current) {
      const target = document.getElementById(project ? 'project-main' : 'work');
      if (target) { target.focus({ preventScroll: true }); focusAfterNavigation.current = false; }
    }
  }
  async function copyEmail() {
    try { await navigator.clipboard.writeText('tonytang1199@gmail.com'); setCopied(true); if (copyTimer.current) clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(false), 2200); }
    catch { window.location.href = 'mailto:tonytang1199@gmail.com'; }
  }
  return <MotionConfig reducedMotion={paused ? 'always' : 'user'}><div className={`portfolio-universe ${paused ? 'motion-off' : ''}`}>
    <a className="skip-link" href={project ? '#project-main' : '#project-index'} onClick={e => { e.preventDefault(); const target = document.getElementById(project ? 'project-main' : 'project-index'); target?.focus(); target?.scrollIntoView(); }}>Skip to project content</a>
    <header className="site-header"><button className="wordmark" aria-label="Tony Tang home" onClick={() => select(null)}>tony<span>✳</span></button><nav aria-label="Main navigation"><button className={!project ? 'nav-current' : ''} onClick={() => select(null)}>Selected work <sup>05</sup></button><button onClick={() => navigateTo('about')}>About</button><button onClick={() => navigateTo('connect')}>Connect <ArrowUpRight size={13} /></button></nav><button className="motion-switch" aria-label={paused ? 'Enable animations' : 'Pause animations'} aria-pressed={paused} onClick={() => setMotionOverride(!paused)}>{paused ? <Play size={12} /> : <Pause size={12} />}<span>MOTION {paused ? 'OFF' : 'ON'}</span></button></header>
    <AnimatePresence mode="wait" initial={false} onExitComplete={() => requestAnimationFrame(() => requestAnimationFrame(finishNavigation))}>
      {project ? <ProjectExperience key={project.slug} project={project} paused={paused} back={() => select(null)} select={select} /> : <motion.main key="universe" onAnimationComplete={finishNavigation} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={paused ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: .3 }}>
        <section className="hero-section" id="work" tabIndex={-1}>
          <div className="hero-kicker"><span><i className="signal-dot" /> TONY TANG / INTEGRATION ENGINEER & CLOUD ARCHITECT</span><span>ADELAIDE, AU <span className="tiny-star">✳</span></span></div>
          <div className="editorial-hero"><svg className="editorial-pipes" viewBox="0 0 650 650" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M130 -70V155Q130 220 200 220H370Q440 220 440 290V370Q440 440 370 440H160Q90 440 90 510V720"/><path d="M710 90H540Q475 90 475 155V310Q475 375 410 375H280Q215 375 215 440V720"/><path d="M-100 535H380Q540 535 540 375V330Q540 260 610 260H740"/></svg><h1><span>Complex</span><span>systems.</span><span>Clear</span><span>connections.</span></h1><div className="editorial-intro"><span className="eyeline">SYSTEMS MIND.<br/>BUILDER’S INSTINCT.</span><p>I design and build integrations that connect commerce platforms, business systems and cloud services.</p><button onClick={() => select('kazilo')}>Explore the work <ArrowUpRight size={18}/></button></div></div>
          <div className="editorial-footer"><p>From architecture to delivery.<br/>Built to work together.</p><span>FIVE PROJECTS / ONE CONNECTED PRACTICE</span><button onClick={()=>navigateTo('project-index')}>Selected projects <ArrowDown size={14}/></button></div>
        </section>
        <section className="featured-case"><div><span className="eyeline">01 / FEATURED PROJECT</span><h2>Kazilo AI</h2><h3>Built end to end.</h3><p>Three platform-specific frontends. One shared integration engine. I owned and built the backend, infrastructure, execution and user experiences.</p><button className="feature-link" onClick={()=>select('kazilo')}>Explore the platform <ArrowUpRight size={18}/></button><div className="feature-meta">ADOBE COMMERCE / BIGCOMMERCE / AKENEO<br/>VISUAL AUTHORING + AI-ASSISTED WORKFLOWS</div></div><SystemMap project={work[0]} compact/></section>
        <section className="work-index" id="project-index" tabIndex={-1}><div className="section-title"><span className="eyeline">01 / THE WORK</span><h2>Behind every connection,<br /><em>a deliberate decision.</em></h2><p>Five different problems. Explore the experience,<br className="desktop-only" /> the architecture, and the part I played.</p></div><div className="index-grid">{work.map((p, i) => <button className={`index-card index-${p.slug}`} key={p.slug} style={{ '--project-accent': p.color } as React.CSSProperties} onClick={() => select(p.slug)}><span className="index-top"><span>0{i + 1} / {p.eyebrow}</span><ArrowUpRight size={19} /></span><span className={`index-art art-${p.shape}`} aria-hidden="true"><i /><i /><i /><b>{['✳', '⌘', '≋', 'λ', '↗'][i]}</b></span><span className="index-bottom"><strong>{p.name}</strong><span>{p.short}</span><small>{p.status}</small></span></button>)}</div></section>
        <section className="about-section" id="about"><div className="about-graphic" aria-hidden="true"><span className="eyeline">THE HUMAN IN THE SYSTEM</span><div className="human-symbol">t<span>✳</span></div><span className="about-coordinate">CURIOSITY → CLARITY → CONNECTION</span></div><div className="about-text"><span className="eyeline">02 / A LITTLE ABOUT ME</span><h2>A systems mind.<br />A <em>builder’s heart.</em></h2><p>I’m Zhuang Tang—Tony for short. An integration engineer and cloud architect connecting commerce platforms, business systems and cloud services.</p><p>I design and build integrations that keep data consistent, automate complex workflows and make failures easier to diagnose and recover from. My focus is making the connections businesses depend on reliable, adaptable and easy to operate.</p><div className="current-work"><span className="signal-dot" /> Currently building at <strong>Aligent Consulting</strong></div><a href="https://www.linkedin.com/in/zhuangtang" target="_blank" rel="noreferrer">More of my story <ArrowUpRight size={16} /></a></div></section>
        <section className="practice-section"><span className="eyeline">03 / THE PRACTICE</span><div>{['Integration architecture', 'Event-driven systems', 'Workflow orchestration', 'Commerce platforms', 'Developer experience'].map((x, i) => <span key={x}><small>0{i + 1}</small>{x}<ArrowUpRight size={18} /></span>)}</div></section>
      </motion.main>}
    </AnimatePresence>
    <section className="connect-section" id="connect"><div><span className="eyeline">GOOD SYSTEMS START WITH GOOD CONVERSATIONS.</span><h2>Always curious about<br /><em>what connects us.</em></h2></div><div className="connect-links"><a href="https://www.linkedin.com/in/zhuangtang" target="_blank" rel="noreferrer"><Linkedin size={17} />Find me on LinkedIn<ArrowUpRight size={18} /></a><a href="https://github.com/tonytang0909-grl" target="_blank" rel="noreferrer"><Github size={17} />Explore my GitHub<ArrowUpRight size={18} /></a><button onClick={copyEmail}><Mail size={17} /><span aria-live="polite">{copied ? 'Email copied' : 'tonytang1199@gmail.com'}</span>{copied ? <Check size={16} /> : <Copy size={15} />}</button></div></section>
    <footer className="site-footer"><span>© {new Date().getFullYear()} TONY TANG</span><span>SELECTED WORK & ENGINEERING EXPERIMENTS</span><button onClick={() => window.scrollTo({ top: 0, behavior: paused ? 'instant' : 'smooth' })}>BACK TO TOP <ArrowRight size={12} /></button></footer>
  </div></MotionConfig>;
}

'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Copy, Github, Linkedin, List, Mail, Pause, Play, Sparkles } from 'lucide-react';
import ProjectExperience from '@/components/universe/ProjectExperience';
import { work } from '@/components/universe/content';

const UniverseScene = dynamic(() => import('@/components/universe/UniverseScene'), { ssr: false, loading: () => <div className="universe-loading" aria-hidden="true"><span>✳</span></div> });
const subscribeMotion = (callback: () => void) => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); media.addEventListener('change', callback); return () => media.removeEventListener('change', callback); };
const readMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Portfolio() {
  const reduced = useSyncExternalStore(subscribeMotion, readMotion, () => false);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const paused = motionOverride ?? reduced;
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [list, setList] = useState(false);
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
    <header className="site-header"><button className="wordmark" aria-label="Tony Tang home" onClick={() => select(null)}>tony<span>✳</span></button><nav aria-label="Main navigation"><button className={!project ? 'nav-current' : ''} onClick={() => select(null)}>Selected work <sup>05</sup></button><button onClick={() => navigateTo('about')}>The human</button><button onClick={() => navigateTo('connect')}>Connect <ArrowUpRight size={13} /></button></nav><button className="motion-switch" aria-label={paused ? 'Enable animations' : 'Pause animations'} aria-pressed={paused} onClick={() => setMotionOverride(!paused)}>{paused ? <Play size={12} /> : <Pause size={12} />}<span>MOTION {paused ? 'OFF' : 'ON'}</span></button></header>
    <AnimatePresence mode="wait" initial={false} onExitComplete={() => requestAnimationFrame(() => requestAnimationFrame(finishNavigation))}>
      {project ? <ProjectExperience key={project.slug} project={project} paused={paused} back={() => select(null)} select={select} /> : <motion.main key="universe" onAnimationComplete={finishNavigation} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={paused ? { opacity: 0 } : { opacity: 0, scale: 1.035, filter: 'blur(8px)' }} transition={{ duration: .3 }}>
        <section className="hero-section" id="work" tabIndex={-1}>
          <div className="hero-kicker"><span><i className="signal-dot" /> TONY TANG / INTEGRATION ENGINEER & CLOUD ARCHITECT</span><span>ADELAIDE, AU <span className="tiny-star">✳</span></span></div>
          <div className="hero-title-row"><h1>I connect the<br /><em>disconnected.</em><span className="title-period">✳</span></h1><div className="hero-aside"><span className="eyeline">SYSTEMS THINKING.<br />BUILDER’S INSTINCT.</span><p>I turn complicated connections into systems people can depend on.</p><button onClick={() => select('kazilo')}>Enter the work <ArrowUpRight size={18} /></button></div></div>
          <div className="universe-toolbar"><span className="eyeline"><span className="tiny-star">✳</span> FIVE PROJECTS. ONE CONNECTED PRACTICE.</span><button className="quiet-button" aria-pressed={list} onClick={() => setList(!list)}>{list ? <Sparkles size={14} /> : <List size={14} />}{list ? 'Universe view' : 'List view'}</button></div>
          {list ? <div className="hero-project-list">{work.map((p, i) => <button key={p.slug} onClick={() => select(p.slug)} style={{ '--project-accent': p.color } as React.CSSProperties}><span>0{i + 1}</span><strong>{p.name}</strong><small>{p.short}</small><ArrowUpRight size={22} /></button>)}</div> : <div className="universe-space"><div className="universe-aura" /><UniverseScene paused={paused} active={hovered} /><div className="universe-orbit orbit-one" /><div className="universe-orbit orbit-two" />{work.map((p, i) => <button key={p.slug} className={`project-portal portal-${p.slug}`} style={{ left: `${p.x}%`, top: `${p.y}%`, '--project-accent': p.color } as React.CSSProperties} onPointerEnter={() => setHovered(p.slug)} onPointerLeave={() => setHovered(null)} onFocus={() => setHovered(p.slug)} onBlur={() => setHovered(null)} onClick={() => select(p.slug)} aria-label={`Explore ${p.name}`}><span className="portal-touch" /><span className="portal-label"><small>0{i + 1} / {p.slug === 'kazilo' ? 'AI + AUTOMATION' : p.eyebrow}</small><strong>{p.name}<ArrowUpRight size={15} /></strong><span>{p.short}</span></span></button>)}<span className="universe-coordinate coordinate-left">X: INTENT<br />Y: POSSIBILITY</span><span className="universe-coordinate coordinate-right">SELECT A PROJECT<br />EXPLORE WHAT’S INSIDE ↗</span></div>}
          <div className="hero-baseline"><span>ARCHITECTURE YOU CAN EXPLORE.</span><button onClick={() => navigateTo('project-index')}>A closer look <ArrowDown size={13} /></button><span>BUILT WITH INTENTION. CONNECTED BY DESIGN.</span></div>
        </section>
        <section className="work-index" id="project-index" tabIndex={-1}><div className="section-title"><span className="eyeline">01 / THE WORK</span><h2>Behind every connection,<br /><em>a deliberate decision.</em></h2><p>Five different problems. Explore the experience,<br className="desktop-only" /> the architecture, and the part I played.</p></div><div className="index-grid">{work.map((p, i) => <button className={`index-card index-${p.slug}`} key={p.slug} style={{ '--project-accent': p.color } as React.CSSProperties} onClick={() => select(p.slug)}><span className="index-top"><span>0{i + 1} / {p.eyebrow}</span><ArrowUpRight size={19} /></span><span className={`index-art art-${p.shape}`} aria-hidden="true"><i /><i /><i /><b>{['✳', '⌘', '≋', 'λ', '↗'][i]}</b></span><span className="index-bottom"><strong>{p.name}</strong><span>{p.short}</span><small>{p.status}</small></span></button>)}</div></section>
        <section className="about-section" id="about"><div className="about-graphic" aria-hidden="true"><span className="eyeline">THE HUMAN IN THE SYSTEM</span><div className="human-symbol">t<span>✳</span></div><span className="about-coordinate">CURIOSITY → CLARITY → CONNECTION</span></div><div className="about-text"><span className="eyeline">02 / A LITTLE ABOUT ME</span><h2>A systems mind.<br />A <em>builder’s heart.</em></h2><p>I’m Zhuang Tang—Tony for short. An integration engineer and cloud architect connecting commerce platforms, business systems and cloud services.</p><p>I design and build integrations that keep data consistent, automate complex workflows and make failures easier to diagnose and recover from. My focus is making the connections businesses depend on reliable, adaptable and easy to operate.</p><div className="current-work"><span className="signal-dot" /> Currently building at <strong>Aligent Consulting</strong></div><a href="https://www.linkedin.com/in/zhuangtang" target="_blank" rel="noreferrer">More of my story <ArrowUpRight size={16} /></a></div></section>
        <section className="practice-section"><span className="eyeline">03 / THE PRACTICE</span><div>{['Integration architecture', 'Event-driven systems', 'Workflow orchestration', 'Commerce platforms', 'Developer experience'].map((x, i) => <span key={x}><small>0{i + 1}</small>{x}<ArrowUpRight size={18} /></span>)}</div></section>
      </motion.main>}
    </AnimatePresence>
    <section className="connect-section" id="connect"><div><span className="eyeline">GOOD SYSTEMS START WITH GOOD CONVERSATIONS.</span><h2>Always curious about<br /><em>what connects us.</em></h2></div><div className="connect-links"><a href="https://www.linkedin.com/in/zhuangtang" target="_blank" rel="noreferrer"><Linkedin size={17} />Find me on LinkedIn<ArrowUpRight size={18} /></a><a href="https://github.com/tonytang0909-grl" target="_blank" rel="noreferrer"><Github size={17} />Explore my GitHub<ArrowUpRight size={18} /></a><button onClick={copyEmail}><Mail size={17} /><span aria-live="polite">{copied ? 'Email copied' : 'tonytang1199@gmail.com'}</span>{copied ? <Check size={16} /> : <Copy size={15} />}</button></div></section>
    <footer className="site-footer"><span>© {new Date().getFullYear()} TONY TANG</span><span>SELECTED WORK & ENGINEERING EXPERIMENTS</span><button onClick={() => window.scrollTo({ top: 0, behavior: paused ? 'instant' : 'smooth' })}>BACK TO TOP <ArrowRight size={12} /></button></footer>
  </div></MotionConfig>;
}

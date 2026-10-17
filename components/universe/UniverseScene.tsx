'use client';
import { useEffect, useRef, useState } from 'react';
import { work } from './content';

export default function UniverseScene({ paused, active }: { paused: boolean; active: string | null }) {
  const host = useRef<HTMLDivElement>(null);
  const preferences = useRef({ paused, active });
  const [ready, setReady] = useState(false);
  useEffect(() => { preferences.current = { paused, active }; }, [paused, active]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    import('three').then(THREE => {
      if (cancelled) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
      catch { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      element.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-7, 7, 4, -4, .1, 100);
      camera.position.set(0, 0, 15);
      scene.add(new THREE.AmbientLight(0xb0a2e8, 2.2));
      const light = new THREE.DirectionalLight(0xe3d8ff, 5);
      light.position.set(-4, 6, 8); scene.add(light);
      const rim = new THREE.PointLight(0x9871ff, 40, 20); rim.position.set(0, 0, 4); scene.add(rim);
      const meshes: InstanceType<typeof THREE.Group>[] = [];
      const animated: InstanceType<typeof THREE.Object3D>[] = [];
      const wireMaterial = (color: string) => new THREE.LineBasicMaterial({ color, transparent: true, opacity: .55 });
      work.forEach((p, index) => {
        const group = new THREE.Group();
        const material = new THREE.MeshPhysicalMaterial({ color: p.color, metalness: .45, roughness: .2, transparent: true, opacity: .82, clearcoat: 1 });
        if (p.shape === 'core') {
          const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(.66, 0), material);
          crystal.rotation.set(.3, .4, .2); group.add(crystal);
          const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(.88, 0)), wireMaterial(p.color));
          group.add(frame); animated.push(frame);
          for (let k = 0; k < 2; k++) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(1.12 + k * .17, .009, 6, 100), new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: .4 }));
            ring.rotation.set(1.1 + k * .6, k * .5, -.4); group.add(ring);
          }
        } else if (p.shape === 'frames') {
          for (let k = 0; k < 3; k++) {
            const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1 - k * .21, 1 - k * .21, 1 - k * .21)), wireMaterial(p.color));
            box.rotation.set(.35 + k * .2, .6 + k * .3, .2); group.add(box); animated.push(box);
          }
          group.add(new THREE.Mesh(new THREE.BoxGeometry(.29, .29, .29), material));
        } else if (p.shape === 'layers') {
          for (let k = 0; k < 3; k++) {
            const layer = new THREE.Mesh(new THREE.BoxGeometry(1.2, .78, .035), material.clone());
            layer.position.set(k * .16 - .16, k * .16 - .16, k * .23); layer.rotation.set(-.3, -.55, -.2); group.add(layer);
            layer.add(new THREE.LineSegments(new THREE.EdgesGeometry(layer.geometry), wireMaterial(p.color)));
          }
        } else if (p.shape === 'rings') {
          for (let k = 0; k < 3; k++) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(.57, .045, 12, 80), material);
            ring.rotation.set(.4 + k * .9, k * .8, .3); group.add(ring); animated.push(ring);
          }
          group.add(new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 16), new THREE.MeshBasicMaterial({ color: p.color })));
        } else {
          group.add(new THREE.Mesh(new THREE.OctahedronGeometry(.36), material));
          for (let k = 0; k < 7; k++) {
            const bead = new THREE.Mesh(new THREE.SphereGeometry(.065, 12, 12), material);
            const a = k / 7 * Math.PI * 2; bead.position.set(Math.cos(a) * .78, Math.sin(a) * .53, Math.sin(a * 2) * .3); group.add(bead);
          }
          const ring = new THREE.Mesh(new THREE.TorusGeometry(.77, .008, 6, 80), material); ring.scale.y = .7; group.add(ring);
        }
        group.userData.index = index; scene.add(group); meshes.push(group);
      });
      let height = 8;
      let paths: InstanceType<typeof THREE.CatmullRomCurve3>[] = [];
      const connections = new THREE.Group(); scene.add(connections);
      const particles = Array.from({ length: 4 }, () => new THREE.Mesh(new THREE.SphereGeometry(.025, 8, 8), new THREE.MeshBasicMaterial({ color: 0xd0c0ff })));
      particles.forEach(p => scene.add(p));
      function clearConnections() {
        connections.children.forEach(obj => { const l = obj as InstanceType<typeof THREE.Line>; l.geometry.dispose(); (l.material as InstanceType<typeof THREE.Material>).dispose(); });
        connections.clear();
      }
      function resize() {
        if (!element) return;
        const width = element.clientWidth, h = element.clientHeight;
        if (!width || !h) return;
        height = 14 * h / width; camera.top = height / 2; camera.bottom = -height / 2; camera.updateProjectionMatrix();
        renderer.setSize(width, h);
        meshes.forEach((g, i) => { const p = work[i]; g.position.set((p.x / 100 - .5) * 14, (.5 - p.y / 100) * height + .38, 0); });
        clearConnections(); paths = [];
        for (let i = 1; i < meshes.length; i++) {
          const start = meshes[0].position.clone(), end = meshes[i].position.clone();
          const middle = start.clone().lerp(end, .5); middle.y -= .6; middle.z = -.6;
          const curve = new THREE.CatmullRomCurve3([start, middle, end]); paths.push(curve);
          connections.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), new THREE.LineBasicMaterial({ color: 0x8d76bb, transparent: true, opacity: .22 })));
        }
      }
      const positions = new Float32Array(110 * 3);
      for (let i = 0; i < 110; i++) { positions[i * 3] = Math.sin(i * 127.1) * 7; positions[i * 3 + 1] = Math.cos(i * 311.7) * 5; positions[i * 3 + 2] = -2; }
      const stars = new THREE.BufferGeometry(); stars.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ size: .018, color: 0xa59ab9, transparent: true, opacity: .4 })));
      const observer = new ResizeObserver(resize); observer.observe(element); resize();
      let inView = true, frame = 0, last = 0, elapsed = 0;
      const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }); visibility.observe(element);
      let pointerX = 0, pointerY = 0;
      const pointer = (e: PointerEvent) => { const rect = element.getBoundingClientRect(); pointerX = (e.clientX - rect.left) / rect.width - .5; pointerY = (e.clientY - rect.top) / rect.height - .5; };
      const parent = element.parentElement!; parent.addEventListener('pointermove', pointer);
      const reset = () => { pointerX = 0; pointerY = 0; }; parent.addEventListener('pointerleave', reset);
      function animate(now: number) {
        frame = requestAnimationFrame(animate);
        const delta = Math.min((now - last) / 1000, .05); last = now;
        if (!inView || document.hidden) return;
        const { paused: stop, active: selected } = preferences.current;
        if (!stop) elapsed += delta;
        meshes.forEach((g, i) => {
          const hover = work[i].slug === selected;
          const target = hover ? 1.15 : 1;
          g.scale.setScalar(stop ? target : THREE.MathUtils.lerp(g.scale.x, target, .07));
          if (!stop) { g.rotation.y = Math.sin(elapsed * .22 + i) * .2 + pointerX * .15; g.rotation.z = Math.sin(elapsed * .3 + i) * .045; }
        });
        if (!stop) animated.forEach((g, i) => { g.rotation.y += delta * .08 * (i % 2 ? 1 : -1); });
        particles.forEach((p, i) => { if (paths[i]) p.position.copy(paths[i].getPointAt((elapsed * .1 + i * .23) % 1)); p.visible = !stop; });
        camera.position.x = stop ? 0 : THREE.MathUtils.lerp(camera.position.x, pointerX * .15, .04);
        camera.position.y = stop ? 0 : THREE.MathUtils.lerp(camera.position.y, -pointerY * .1, .04);
        renderer.render(scene, camera);
      }
      frame = requestAnimationFrame(animate); setReady(true);
      const lost = (event: Event) => { event.preventDefault(); setReady(false); cancelAnimationFrame(frame); };
      renderer.domElement.addEventListener('webglcontextlost', lost);
      dispose = () => {
        cancelAnimationFrame(frame); observer.disconnect(); visibility.disconnect(); parent.removeEventListener('pointermove', pointer); parent.removeEventListener('pointerleave', reset);
        renderer.domElement.removeEventListener('webglcontextlost', lost);
        scene.traverse(obj => { const mesh = obj as InstanceType<typeof THREE.Mesh>; mesh.geometry?.dispose(); if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => m.dispose()); });
        renderer.dispose(); renderer.domElement.remove();
      };
    }).catch(() => { /* The accessible HTML project controls remain available. */ });
    return () => { cancelled = true; dispose?.(); };
  }, []);
  return <div ref={host} className={`universe-render ${ready ? 'render-ready' : ''}`} aria-hidden="true">{!ready && <div className="universe-fallback">{work.map(p => <span key={p.slug} style={{ left: `${p.x}%`, top: `${p.y}%`, color: p.color }}>◇</span>)}</div>}</div>;
}

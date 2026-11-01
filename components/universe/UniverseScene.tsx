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
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' }); }
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
          const sculpture = new THREE.Group();
          const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(.59, .18, 180, 24, 2, 3), new THREE.MeshPhysicalMaterial({color: '#aaa0ff', metalness: .8, roughness: .19, clearcoat: 1, emissive: '#3b176c', emissiveIntensity: .35}));
          sculpture.add(knot);
          const halo = new THREE.Mesh(new THREE.TorusGeometry(1.12, .006, 6, 160), new THREE.MeshBasicMaterial({color:'#c6b9ff',transparent:true,opacity:.65}));
          halo.rotation.set(.95, .3, -.4); sculpture.add(halo); group.add(sculpture); animated.push(sculpture);
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
      const particles = Array.from({ length: 64 }, () => new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 6), new THREE.MeshBasicMaterial({ color: 0xd0c0ff })));
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
          connections.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), new THREE.LineBasicMaterial({ color: 0x8d76bb, transparent: true, opacity: .14 })));
        }
      }
      const count = window.innerWidth < 760 ? 1600 : 4200;
      const riverPositions = new Float32Array(count * 3);
      const riverColors = new Float32Array(count * 3);
      const river = new THREE.BufferGeometry();
      const palette = [new THREE.Color('#bca1ff'),new THREE.Color('#71c8db'),new THREE.Color('#ecc1f6')];
      for (let i=0;i<count;i++) { const c=palette[i%3]; riverColors.set([c.r,c.g,c.b],i*3); }
      river.setAttribute('position',new THREE.BufferAttribute(riverPositions,3));
      river.setAttribute('color',new THREE.BufferAttribute(riverColors,3));
      const riverMaterial = new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true,uniforms:{uPixel:{value:Math.min(window.devicePixelRatio,1.7)}},vertexShader:`uniform float uPixel; varying vec3 vColor; void main(){vColor=color;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=2.3*uPixel;}`,fragmentShader:`varying vec3 vColor;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.05,d);gl_FragColor=vec4(vColor,a*.62);}`});
      scene.add(new THREE.Points(river,riverMaterial));
      function updateRiver(t:number) {
        for(let i=0;i<count;i++) {
          const lane=i%7;
          const u=((i/count+t*.018)%1);
          const angle=u*Math.PI*2;
          const spread=Math.sin(i*127.1)*.075;
          const radius=2.05+lane*.105+spread;
          riverPositions[i*3]=Math.cos(angle)*radius*1.65;
          riverPositions[i*3+1]=Math.sin(angle)*radius*.55 + Math.sin(angle*3+t*.25+lane*.13)*.27 + (height>9 ? .3 : 0);
          riverPositions[i*3+2]=Math.sin(angle)*1.05-1.3;
        }
        river.attributes.position.needsUpdate=true;
      }
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
        particles.forEach((p, i) => { const path = paths[i % 4]; if (path) p.position.copy(path.getPointAt((elapsed * .065 + Math.floor(i / 4) / 16) % 1)); p.visible = true; p.scale.setScalar(i % 4 + 1 === work.findIndex(w => w.slug === selected) ? 1.8 : 1); });
        updateRiver(elapsed);
        riverMaterial.opacity = selected ? .9 : .7;
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

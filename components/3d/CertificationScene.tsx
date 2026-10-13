'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, Stars, useGLTF, useProgress } from '@react-three/drei';
import Image from 'next/image';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

// Put both files in /public/assets/3d_models/
const ROCKET_URL = '/assets/3d_models/v2_rocket.glb';
const PLANETS_URL = '/assets/3d_models/toy_cartoon_planets.glb';

// toy_cartoon_planets.glb contains 10 planets: Toy_Planet_1 ... Toy_Planet_10
// (Toy_Planet_9 and Toy_Planet_10 have rings). Pick any node name per stop.
type Vec3 = [number, number, number];

type Certification = {
  title: string;
  description: string;
  year: string;
  planet: string; // node name inside toy_cartoon_planets.glb
  position: Vec3; // planet position in the scene
  radius: number; // planet body radius, in scene units
  image: string;
  link: string;
};

const certifications: Certification[] = [
  {
    title: 'Oracle OCI',
    description: 'Generative AI Certified',
    year: '2025',
    planet: 'Toy_Planet_1',
    position: [-2.6, 4, -1.5],
    radius: 0.9,
    image:
      '/assets/oracle.png',
    link: 'https://www.oracle.com/artificial-intelligence/',
  },
  {
    title: 'Udemy',
    description: 'Advanced Java',
    year: '2025',
    planet: 'Toy_Planet_5',
    position: [2.6, 8.5, -1.5],
    radius: 0.9,
    image:
      '/assets/java.jpg',
    link: 'https://www.udemy.com/',
  },
  {
    title: 'HackerRank',
    description: 'Problem Solving',
    year: '2025',
    planet: 'Toy_Planet_9',
    position: [-2.6, 13, -1.5],
    radius: 0.9,
    image:
      '/assets/ps.jfif',
    link: 'https://www.hackerrank.com/',
  },
];

const PLANET_MODEL_RADIUS = 100; // every planet body is ~100 units wide in the GLB
const ROCKET_LENGTH = 1.4; // rocket length in scene units
const DOCK_OFFSET = 2.3; // horizontal gap between a planet and the parked rocket

const HOME = new THREE.Vector3(0, 0, 0);
const UP = new THREE.Vector3(0, 1, 0);

const planetVectors = certifications.map((c) => new THREE.Vector3(...c.position));

// Where the rocket parks for each stop: beside the planet, on the side facing the centre line.
const dockVectors = certifications.map((c, i) => {
  const p = planetVectors[i];
  const side = p.x >= 0 ? -1 : 1;
  return new THREE.Vector3(p.x + side * DOCK_OFFSET, p.y - 0.3, p.z + 0.9);
});

if (typeof window !== 'undefined') {
  useGLTF.preload(ROCKET_URL);
  useGLTF.preload(PLANETS_URL);
}

type Phase = 'idle' | 'flying' | 'docked';
type Flight = { id: number; to: number }; // to = stop index, or -1 for "go home"

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* -------------------------------------------------------------------------- */
/*  UI + state                                                                */
/* -------------------------------------------------------------------------- */

const primaryButton =
  'pointer-events-auto rounded-full bg-violet-400 px-7 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-violet-500/30 transition hover:bg-violet-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-violet-400';
const secondaryButton =
  'pointer-events-auto rounded-full border border-slate-500/50 bg-slate-950/60 px-5 py-2 text-sm font-medium text-slate-200 backdrop-blur-md transition hover:border-violet-300/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200';

export function CertificationScene() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [stop, setStop] = useState(-1); // last stop reached (-1 = still at the start)
  const [flight, setFlight] = useState<Flight>({ id: 0, to: -1 });

  const lastStop = certifications.length - 1;

  const flyTo = useCallback((to: number) => {
    setFlight((f) => ({ id: f.id + 1, to }));
    setPhase('flying');
  }, []);

  const handleArrive = useCallback((to: number) => {
    setStop(to);
    setPhase(to === -1 ? 'idle' : 'docked');
  }, []);

  const returning = phase === 'flying' && flight.to === -1;
  const shown = stop >= 0 ? certifications[stop] : null;
  const cardVisible = phase === 'docked' && shown !== null;

  return (
    <div className="relative h-[calc(100vh-5rem)] w-full overflow-hidden bg-slate-950 pt-20">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 1, 10], fov: 40, near: 0.1, far: 200 }}>
        <color attach="background" args={['#020617']} />
        <Suspense fallback={<Loader />}>
          <SceneContent phase={phase} stop={stop} flight={flight} onArrive={handleArrive} />
        </Suspense>
      </Canvas>

      {/* Top pill with progress */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-6">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-violet-300/30 bg-slate-950/70 px-4 py-2 shadow-lg shadow-violet-500/10 backdrop-blur-md">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            {certifications.map((c, i) => (
              <span
                key={c.title}
                className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                  i <= stop ? 'bg-violet-400' : 'bg-slate-600'
                }`}
              />
            ))}
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-violet-200">
            Certification Flight
          </span>
        </div>
      </div>

      {/* Bottom: certification card + controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-5 px-4">
        <div
          aria-live="polite"
          className={`w-full max-w-sm overflow-hidden rounded-3xl border border-violet-300/30 bg-slate-950/85 shadow-[0_22px_70px_-18px_rgba(168,85,247,0.5)] backdrop-blur-xl transition-all duration-500 ${
            cardVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {shown && (
            <>
              <div className="h-24 overflow-hidden border-b border-white/10">
                <Image
                  src={shown.image}
                  alt={shown.title}
                  width={900}
                  height={240}
                  className="h-full w-full object-cover"
                  sizes="(max-width: 768px) 100vw, 20rem"
                />
              </div>

              <div className="space-y-3 p-4 text-left">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-violet-400/40 bg-violet-500/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-200">
                    Credential
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">{shown.year}</span>
                </div>

                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-violet-300">
                    {shown.title} · {stop + 1}/{certifications.length}
                  </div>
                  <div className="mt-1.5 text-lg font-semibold text-white">{shown.description}</div>
                </div>

                <a
                  href={shown.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-violet-400/35 bg-violet-500/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-violet-100 transition hover:border-violet-300 hover:bg-violet-500/15"
                >
                  Verify
                </a>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          {phase === 'idle' && (
            <button type="button" onClick={() => flyTo(0)} className={primaryButton}>
              Start
            </button>
          )}

          {phase === 'flying' && (
            <button type="button" disabled className={primaryButton}>
              {returning ? 'Returning…' : 'In flight…'}
            </button>
          )}

          {phase === 'docked' && stop < lastStop && (
            <button type="button" onClick={() => flyTo(stop + 1)} className={primaryButton}>
              Next
            </button>
          )}

          {phase === 'docked' && stop === lastStop && (
            <button type="button" onClick={() => flyTo(-1)} className={primaryButton}>
              Return to start
            </button>
          )}

          {/* Always available once the flight has started (except on the last stop, where it is the main button) */}
          {phase !== 'idle' && !returning && !(phase === 'docked' && stop === lastStop) && (
            <button type="button" onClick={() => flyTo(-1)} className={secondaryButton}>
              Return to start
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  3D                                                                        */
/* -------------------------------------------------------------------------- */

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <span className="text-sm text-violet-200">{Math.round(progress)}%</span>
    </Html>
  );
}

type Leg = {
  from: THREE.Vector3;
  ctrl: THREE.Vector3;
  to: THREE.Vector3;
  t: number;
  duration: number;
  target: number;
};

function SceneContent({
  phase,
  stop,
  flight,
  onArrive,
}: {
  phase: Phase;
  stop: number;
  flight: Flight;
  onArrive: (to: number) => void;
}) {
  const rocket = useGLTF(ROCKET_URL);

  // Clone, soften the metal (no environment map here, full metal would render black) and normalise size.
  const rocketScene = useMemo(() => {
    const clone = rocket.scene.clone(true);
    clone.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      const material = (mesh.material as THREE.MeshStandardMaterial).clone();
      material.metalness = Math.min(material.metalness, 0.25);
      mesh.material = material;
    });
    return clone;
  }, [rocket.scene]);

  const { rocketScale, rocketOffset } = useMemo(() => {
    rocketScene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(rocketScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    // The V2 is modelled along Y (nose at +Y, fins at -Y).
    return { rocketScale: ROCKET_LENGTH / size.y, rocketOffset: center.negate() };
  }, [rocketScene]);

  const rocketRef = useRef<THREE.Group>(null); // position + heading
  const bobRef = useRef<THREE.Group>(null); // idle hover
  const spinRef = useRef<THREE.Group>(null); // roll around its own axis
  const flameRef = useRef<THREE.Group>(null);
  const leg = useRef<Leg | null>(null);

  const focus = useRef(new THREE.Vector3());
  const cameraReady = useRef(false);
  const tmp = useMemo(
    () => ({
      target: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
    }),
    [],
  );

  // Start a new leg every time the parent asks for a new flight.
  useEffect(() => {
    const body = rocketRef.current;
    if (!body || flight.id === 0) return;

    const from = body.position.clone();
    const to = (flight.to >= 0 ? dockVectors[flight.to] : HOME).clone();
    const dir = to.clone().sub(from);
    const dist = dir.length();

    if (dist < 1e-3) {
      onArrive(flight.to);
      return;
    }

    // Curved trajectory: control point pushed sideways in the screen plane.
    const bow = new THREE.Vector3(-dir.y, dir.x, 0);
    if (bow.lengthSq() < 1e-6) bow.set(1, 0, 0);
    bow.normalize().multiplyScalar(dist * 0.18 * (flight.to % 2 === 0 ? 1 : -1));
    const ctrl = from.clone().add(to).multiplyScalar(0.5).add(bow);

    leg.current = {
      from,
      ctrl,
      to,
      t: 0,
      duration: THREE.MathUtils.clamp(dist / 4, 1.6, 3.4),
      target: flight.to,
    };
  }, [flight, onArrive]);

  useFrame((state, delta) => {
    const body = rocketRef.current;
    if (!body) return;
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    /* --- Rocket motion --- */
    const current = leg.current;
    let flying = false;

    if (current) {
      flying = true;
      current.t = Math.min(1, current.t + dt / current.duration);
      const u = easeInOutCubic(current.t);
      const a = (1 - u) * (1 - u);
      const b = 2 * (1 - u) * u;
      const c = u * u;

      body.position.set(
        a * current.from.x + b * current.ctrl.x + c * current.to.x,
        a * current.from.y + b * current.ctrl.y + c * current.to.y,
        a * current.from.z + b * current.ctrl.z + c * current.to.z,
      );

      // Nose follows the curve tangent.
      tmp.tangent
        .set(
          2 * (1 - u) * (current.ctrl.x - current.from.x) + 2 * u * (current.to.x - current.ctrl.x),
          2 * (1 - u) * (current.ctrl.y - current.from.y) + 2 * u * (current.to.y - current.ctrl.y),
          2 * (1 - u) * (current.ctrl.z - current.from.z) + 2 * u * (current.to.z - current.ctrl.z),
        )
        .normalize();
      tmp.quat.setFromUnitVectors(UP, tmp.tangent);

      if (current.t >= 1) {
        leg.current = null;
        onArrive(current.target);
      }
    } else {
      tmp.quat.identity(); // hover, nose up
    }

    body.quaternion.slerp(tmp.quat, 1 - Math.exp(-7 * dt));

    if (bobRef.current) bobRef.current.position.y = flying ? 0 : Math.sin(time * 2) * 0.04;
    if (spinRef.current) spinRef.current.rotation.y += dt * (flying ? 2.4 : 0.4);

    if (flameRef.current) {
      const targetScale = flying ? 1 + Math.sin(time * 40) * 0.18 : 0.25;
      flameRef.current.scale.y = THREE.MathUtils.damp(flameRef.current.scale.y, targetScale, 10, dt);
      flameRef.current.scale.x = flameRef.current.scale.z = flying ? 1 : 0.6;
    }

    /* --- Camera: follows the rocket, framing the planet when docked --- */
    tmp.target.copy(body.position);
    if (phase === 'docked' && stop >= 0) tmp.target.lerp(planetVectors[stop], 0.5);
    else if (phase === 'idle') tmp.target.lerp(dockVectors[0], 0.35);

    if (!cameraReady.current) {
      focus.current.copy(tmp.target);
      cameraReady.current = true;
    } else {
      focus.current.lerp(tmp.target, 1 - Math.exp(-3.2 * dt));
    }

    const aspect = state.size.width / state.size.height;
    const distance = THREE.MathUtils.clamp(6 / aspect, 9, 15); // wider framing on portrait screens
    state.camera.position.set(focus.current.x, focus.current.y + 1, focus.current.z + distance);
    // Look slightly below the focus so the content sits above the bottom card.
    state.camera.lookAt(focus.current.x, focus.current.y - 0.9, focus.current.z);
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 6]} intensity={2.4} color="#e0e7ff" />
      <directionalLight position={[-5, 2, 3]} intensity={1.1} color="#c084fc" />

      <Stars radius={60} depth={40} count={1800} factor={3} fade speed={0.6} />

      {certifications.map((certification, index) => (
        <Planet
          key={certification.title}
          certification={certification}
          index={index}
          active={phase === 'docked' && stop === index}
        />
      ))}

      <group ref={rocketRef} position={HOME}>
        <group ref={bobRef}>
          <group ref={spinRef} scale={rocketScale}>
            <primitive object={rocketScene} position={rocketOffset} />
          </group>

          {/* Engine flame, anchored at the tail */}
          <group ref={flameRef} position={[0, -ROCKET_LENGTH / 2, 0]}>
            <mesh position={[0, -0.28, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.11, 0.56, 16]} />
              <meshBasicMaterial color="#fb923c" transparent opacity={0.85} />
            </mesh>
            <mesh position={[0, -0.18, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.06, 0.36, 16]} />
              <meshBasicMaterial color="#fde68a" />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}

function Planet({
  certification,
  index,
  active,
}: {
  certification: Certification;
  index: number;
  active: boolean;
}) {
  const { nodes } = useGLTF(PLANETS_URL);

  // The GLB holds all planets in one scene: pick ONE node and clone it.
  // (Re-using a single Object3D in several <primitive> tags only renders the last one.)
  const object = useMemo(() => {
    const source = nodes[certification.planet];
    if (!source) {
      console.warn(`[CertificationScene] Node "${certification.planet}" not found in ${PLANETS_URL}`);
      return null;
    }
    const clone = source.clone(true);
    clone.position.set(0, 0, 0); // drop the planet's offset inside the original grid layout
    return clone;
  }, [nodes, certification.planet]);

  const pulseRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (spinRef.current) spinRef.current.rotation.y += dt * (active ? 0.5 : 0.18);
    if (pulseRef.current) {
      const s = THREE.MathUtils.damp(pulseRef.current.scale.x, active ? 1.12 : 1, 5, dt);
      pulseRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={certification.position}>
      <Float speed={1.4} rotationIntensity={0} floatIntensity={0.5}>
        <group ref={pulseRef}>
          {/* Tilt so rings (planets 9 and 10) are visible from the camera */}
          <group rotation={[0.45, index * 0.6, 0.25]}>
            <group ref={spinRef} scale={certification.radius / PLANET_MODEL_RADIUS}>
              {object ? (
                <primitive object={object} />
              ) : (
                <mesh>
                  <sphereGeometry args={[PLANET_MODEL_RADIUS, 32, 32]} />
                  <meshStandardMaterial color="#7c3aed" />
                </mesh>
              )}
            </group>
          </group>
        </group>
      </Float>
    </group>
  );
}
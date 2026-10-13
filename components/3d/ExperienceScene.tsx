'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import Image from 'next/image';
import ProfileCard from '../ui/ProfileCard';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ElementRef } from 'react';
import * as THREE from 'three';
import HireMeLoader from '../ui/HireMeLoader';

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

// Put these files in /public/assets/3d_models/
const CAR_URL = '/assets/3d_models/cartoon_car.glb';
const ROAD_URL = '/assets/3d_models/road.glb';

type Vec3 = [number, number, number];

type Experience = {
  title: string;
  description: string;
  stopX: number; // where the car parks on the road (x axis)
  pin: Vec3; // floating marker, placed above the matching building
  image: string;
  link: string;
  tag: string;
};

// road.glb is a street along the X axis with buildings on the north side (z < 0).
// Stops are placed in front of: a tower (x≈-6.2), a mid-size block (x≈-1.0) and the hospital (x≈6.9).
const experiences: Experience[] = [
  {
    title: 'Maison de L intelligence Artificielle',
    description: 'GDPR compliance assessment SaaS built with React and Spring Boot, with a Python RAG pipeline.',
    stopX: -6.2,
    pin: [-6.2, 3.1, -5.2],
    image: '/assets/experience/maison-ia.jpg',
    link: 'https://www.oracle.com',
    tag: 'AI & compliance',
  },
  {
    title: 'Freelance Projects',
    description: '3D and full-stack development, plus AI agent development for individual agents and multi-agent systems.',
    stopX: -3.4,
    pin: [-3.4, 3.8, -5.2],
    image: '/assets/experience/freelancing.jpg',
    link: 'https://clinic-agent-six.vercel.app/chat',
    tag: 'Freelance',
  },
  {
    title: 'CAM / Al Filahi Cash',
    description: 'Oracle-to-PostgreSQL migration and Java/JPA backend refactoring.',
    stopX: 1.8,
    pin: [1.8, 2.9, -5.3],
    image: '/assets/experience/cam1.jpeg',
    link: 'https://www.creditagricole.ma',
    tag: 'Backend modernisation',
  },
  {
    title: 'Open-Source Contributions',
    description: 'Contribute regularly in solving problems, adding features and writing documentation for open source projects.',
    stopX: 6.9,
    pin: [6.9, 3.9, -5.3],
    image: '/assets/experience/open-source.png',
    link: 'https://github.com/Regyl/yagfi-back/graphs/contributors?from=04%2F10%2F2025',
    tag: 'Open source',
  },
];

// road.glb is ~0.98 units wide (Sketchfab bakes a 0.01 scale), x20 brings the street to ~19.6 units.
const ROAD_SCALE = 20;
const CAR_LENGTH = 1.5; // longest side of the car, in scene units
const ROAD_Y = 0.07; // top of the asphalt
const LANE_Z = -0.06; // centre of the lane closest to the buildings
const START_X = -9;

// If the car drives sideways or backwards, adjust this (Math.PI, Math.PI / 2, -Math.PI / 2).
const CAR_HEADING_OFFSET = 0;

const HOME = new THREE.Vector3(START_X, ROAD_Y, LANE_Z);
const stopPositions = experiences.map((e) => new THREE.Vector3(e.stopX, ROAD_Y, LANE_Z));
const HEADING_FORWARD = Math.PI / 2 + CAR_HEADING_OFFSET; // facing +X

// Camera framing, relative to the point being looked at.
const CAMERA_OFFSET_DESKTOP = new THREE.Vector3(0, 4.4, 10.5);
const CAMERA_OFFSET_PORTRAIT = new THREE.Vector3(0, 4.6, 14.5);
const FOCUS_Y = -0.4; // look slightly below the car so it sits above the bottom card
const FOCUS_Z = -1.8; // look slightly towards the buildings

// Night sky + glow on the (otherwise empty) left side of the scene. Tweak to taste.
const LEFT_LIGHT_INTENSITY = 30; // coloured point lights (physical units, three r155+)
const STAR_COUNTS = { tiny: 420, medium: 170, bright: 36 };
const ORB_COUNT = 16;

type Phase = 'idle' | 'driving' | 'parked';
type Trip = { id: number; to: number }; // to = stop index, or -1 for "back to start"
type MarkerStatus = 'active' | 'next' | 'done' | 'later';

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

// Frame-rate independent angle smoothing that always turns the short way round.
const dampAngle = (current: number, target: number, lambda: number, dt: number) => {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + diff * (1 - Math.exp(-lambda * dt));
};

/* -------------------------------------------------------------------------- */
/*  UI + state                                                                */
/* -------------------------------------------------------------------------- */

const primaryButton =
  'pointer-events-auto rounded-full bg-sky-400 px-7 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-sky-400';
const secondaryButton =
  'pointer-events-auto rounded-full border border-slate-500/50 bg-slate-950/60 px-5 py-2 text-sm font-medium text-slate-200 backdrop-blur-md transition hover:border-sky-300/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-200';

export function ExperienceScene() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [stop, setStop] = useState(-1); // last stop reached (-1 = at the start)
  const [trip, setTrip] = useState<Trip>({ id: 0, to: -1 });
  
    // Loader : au moins 1,8 s, et tant que les modèles 3D chargent (abandon après 8 s)
  const { active } = useProgress();
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  useEffect(() => {
    const min = setTimeout(() => setMinTimeDone(true), 1000);
    const max = setTimeout(() => setGaveUp(true), 8000);
    return () => {
      clearTimeout(min);
      clearTimeout(max);
    };
  }, []);
  const booting = !minTimeDone || (active && !gaveUp);


  const lastStop = experiences.length - 1;

  const driveTo = useCallback((to: number) => {
    setTrip((t) => ({ id: t.id + 1, to }));
    setPhase('driving');
  }, []);

  const handleArrive = useCallback((to: number) => {
    setStop(to);
    setPhase(to === -1 ? 'idle' : 'parked');
  }, []);

  const returning = phase === 'driving' && trip.to === -1;
  const shown = stop >= 0 ? experiences[stop] : null;
  const cardVisible = phase === 'parked' && shown !== null;

  return (
    <div className="relative h-[calc(100vh_-_5rem)] w-full overflow-hidden ">

      <HireMeLoader visible={booting} />
      <Canvas aria-hidden="true" shadows dpr={[1, 2]} camera={{ position: [-9, 3, 9], fov: 42, near: 0.1, far: 120 }}>
        <color attach="background" args={['#0f0f0f']} />
        <Suspense fallback={<Loader />}>
          <SceneContent phase={phase} stop={stop} trip={trip} onArrive={handleArrive} />
        </Suspense>
      </Canvas>

      <ProfileCard visible={phase === 'idle'} />

      <ul className="sr-only" aria-label="Professional experience">
        {experiences.map((experience) => (
          <li key={experience.title}>
            <h2>{experience.title}</h2>
            <p>{experience.description}</p>
          </li>
        ))}
      </ul>

      {/* Top pill with progress */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-6">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-sky-300/30 bg-slate-950/70 px-4 py-2 shadow-lg shadow-sky-500/10 backdrop-blur-md">
          <span className="flex items-center gap-1.5" aria-hidden="true">
            {experiences.map((e, i) => (
              <span
                key={e.title}
                className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                  i <= stop ? 'bg-sky-400' : 'bg-slate-600'
                }`}
              />
            ))}
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-sky-200">Career Road</span>
        </div>
      </div>

      {/* Bottom: experience card + controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-5 px-4">
        <div
          aria-live="polite"
          className={`w-full max-w-md overflow-hidden rounded-3xl border border-sky-200/25 bg-slate-950/80 shadow-[0_22px_70px_-18px_rgba(56,189,248,0.45)] backdrop-blur-xl transition-all duration-500 ${
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
                  sizes="(max-width: 768px) 100vw, 24rem"
                />
              </div>

              <div className="space-y-3 p-4 text-left">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-sky-400/40 bg-sky-500/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-200">
                    {shown.tag}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.22em] text-slate-400">
                    {stop + 1}/{experiences.length}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold leading-6 text-white">{shown.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{shown.description}</p>
                </div>

                <a
                  href={shown.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-sky-100 transition hover:border-sky-300 hover:bg-sky-500/15"
                >
                  View project
                </a>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          {phase === 'idle' && (
            <button type="button" onClick={() => driveTo(0)} className={primaryButton}>
              Start
            </button>
          )}

          {phase === 'driving' && (
            <button type="button" disabled className={primaryButton}>
              {returning ? 'Returning…' : 'On the way…'}
            </button>
          )}

          {phase === 'parked' && stop < lastStop && (
            <button type="button" onClick={() => driveTo(stop + 1)} className={primaryButton}>
              Next
            </button>
          )}

          {phase === 'parked' && stop === lastStop && (
            <button type="button" onClick={() => driveTo(-1)} className={primaryButton}>
              Return to start
            </button>
          )}

          {/* Available at any time once the trip has started (on the last stop it is the main button) */}
          {phase !== 'idle' && !returning && !(phase === 'parked' && stop === lastStop) && (
            <button type="button" onClick={() => driveTo(-1)} className={secondaryButton}>
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
      <span className="text-sm text-sky-200">{Math.round(progress)}%</span>
    </Html>
  );
}

type Leg = {
  from: THREE.Vector3;
  to: THREE.Vector3;
  t: number;
  duration: number;
  target: number;
};

function SceneContent({
  phase,
  stop,
  trip,
  onArrive,
}: {
  phase: Phase;
  stop: number;
  trip: Trip;
  onArrive: (to: number) => void;
}) {
  const { camera, size } = useThree();
  const isPortrait = size.width / size.height < 0.8;

  const car = useGLTF(CAR_URL);
  const road = useGLTF(ROAD_URL);

  /* --- Road: clone, enable shadows, light up the windows --- */
  const roadScene = useMemo(() => {
    const clone = road.scene.clone(true);
    clone.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = !mesh.name.startsWith('Road_'); // the ground only receives
      mesh.receiveShadow = true;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        // This material has no colour in the GLB (renders flat white): turn it into lit windows.
        if (material.name === 'B_Windows2') {
          const standard = material as THREE.MeshStandardMaterial;
          standard.color.set('#fde7a8');
          standard.emissive.set('#f59e0b');
          standard.emissiveIntensity = 0.35;
        }
      });
    });
    return clone;
  }, [road.scene]);

  /* --- Car: clone, normalise size, sit on the ground --- */
  const carScene = useMemo(() => {
    const clone = car.scene.clone(true);
    clone.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    return clone;
  }, [car.scene]);

  const { carScale, carOffset } = useMemo(() => {
    carScene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(carScene);
    const dims = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = CAR_LENGTH / Math.max(dims.x, dims.y, dims.z);
    return {
      carScale: scale,
      // centred on x/z, wheels on y = 0
      carOffset: new THREE.Vector3(-center.x * scale, -box.min.y * scale, -center.z * scale),
    };
  }, [carScene]);

  const carRef = useRef<THREE.Group>(null); // position + heading
  const bodyRef = useRef<THREE.Group>(null); // little road bounce
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);
  const skyRef = useRef<THREE.Group>(null); // distant stars, follows the camera position
  const leftGlowRef = useRef<THREE.Group>(null); // orbs + coloured lights, follows the car on x
  const leg = useRef<Leg | null>(null);
  const yaw = useRef(HEADING_FORWARD);
  const headingTarget = useRef(HEADING_FORWARD);
  const focus = useRef(new THREE.Vector3());
  const cameraReady = useRef(false);
  const tmp = useMemo(() => ({ target: new THREE.Vector3(), delta: new THREE.Vector3() }), []);

  // Wider field of view on portrait screens (and re-frame the camera when the orientation changes).
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.fov = isPortrait ? 52 : 42;
    camera.updateProjectionMatrix();
    cameraReady.current = false;
  }, [camera, isPortrait]);

  // Start a new leg whenever the parent asks for a new trip.
  useEffect(() => {
    const body = carRef.current;
    if (!body || trip.id === 0) return;

    const from = body.position.clone();
    const to = (trip.to >= 0 ? stopPositions[trip.to] : HOME).clone();
    const dir = to.clone().sub(from);
    const dist = dir.length();

    if (dist < 1e-3) {
      onArrive(trip.to);
      return;
    }

    headingTarget.current = Math.atan2(dir.x, dir.z) + CAR_HEADING_OFFSET;
    const speed = trip.to === -1 ? 4 : 2.6;
    leg.current = { from, to, t: 0, duration: THREE.MathUtils.clamp(dist / speed, 1.4, 5), target: trip.to };
  }, [trip, onArrive]);

  useFrame((state, delta) => {
    const body = carRef.current;
    const controls = controlsRef.current;
    if (!body || !controls) return;
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    /* --- Car motion: eased start/stop, turns smoothly towards its direction --- */
    const current = leg.current;
    let moving = false;

    if (current) {
      moving = true;
      current.t = Math.min(1, current.t + dt / current.duration);
      body.position.lerpVectors(current.from, current.to, easeInOutSine(current.t));

      if (current.t >= 1) {
        leg.current = null;
        if (current.target === -1) headingTarget.current = HEADING_FORWARD; // ready to leave again
        onArrive(current.target);
      }
    }

    yaw.current = dampAngle(yaw.current, headingTarget.current, 7, dt);
    body.rotation.y = yaw.current;

    if (bodyRef.current) {
      bodyRef.current.position.y = moving ? Math.abs(Math.sin(time * 16)) * 0.012 : 0;
    }

    /* --- Camera follows the car; OrbitControls still lets the visitor look around --- */
    tmp.target.set(body.position.x, FOCUS_Y, body.position.z + FOCUS_Z);

    if (!cameraReady.current) {
      focus.current.copy(tmp.target);
      camera.position.copy(focus.current).add(isPortrait ? CAMERA_OFFSET_PORTRAIT : CAMERA_OFFSET_DESKTOP);
      controls.target.copy(focus.current);
      cameraReady.current = true;
    } else {
      focus.current.lerp(tmp.target, 1 - Math.exp(-3 * dt));
      tmp.delta.copy(focus.current).sub(controls.target);
      controls.target.add(tmp.delta);
      camera.position.add(tmp.delta);
    }
    controls.update();

    // Distant stars never drift when the car drives; the glow rig stays on the left of the view.
    skyRef.current?.position.copy(camera.position);
    leftGlowRef.current?.position.set(focus.current.x, 0, 0);
  });

  const markerStatus = (index: number): MarkerStatus => {
    if (phase === 'parked' && stop === index) return 'active';
    if (index <= stop) return 'done';
    if (index === stop + 1) return 'next';
    return 'later';
  };

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight
        castShadow
        position={[6, 10, 8]}
        intensity={2.2}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />

      <group ref={skyRef}>
        <LeftStars />
      </group>
      <group ref={leftGlowRef}>
        <LeftGlow />
      </group>

      <primitive object={roadScene} scale={ROAD_SCALE} />

      {experiences.map((experience, index) => (
        <StopMarker
          key={experience.title}
          road={stopPositions[index]}
          pin={experience.pin}
          status={markerStatus(index)}
        />
      ))}

      <group ref={carRef} position={HOME}>
        <group ref={bodyRef}>
          <primitive object={carScene} scale={carScale} position={carOffset} />
        </group>
      </group>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        enableDamping
        minPolarAngle={0.9}
        maxPolarAngle={1.45}
        minAzimuthAngle={-0.8}
        maxAzimuthAngle={0.8}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Left-side sky: stars + glowing orbs                                       */
/* -------------------------------------------------------------------------- */

// Small seeded PRNG so the sky is identical on every render.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Soft round sprite, used for stars and halos. */
function useGlowTexture() {
  const texture = useMemo(() => {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, 'rgba(255,255,255,1)');
      gradient.addColorStop(0.2, 'rgba(255,255,255,0.85)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.25)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

const STAR_TINTS = ['#ffffff', '#ffffff', '#dbeafe', '#bae6fd', '#e0e7ff', '#fef3c7'].map((c) => new THREE.Color(c));

type StarLayerProps = {
  count: number;
  size: number;
  seed: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleAmount: number;
  texture: THREE.Texture;
};

/** One layer of far-away stars, biased towards the left of the default view. */
function StarLayer({ count, size, seed, opacity, twinkleSpeed, twinkleAmount, texture }: StarLayerProps) {
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const geometry = useMemo(() => {
    const rand = mulberry32(seed);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 55 + rand() * 35;
      // Azimuth 0 = straight ahead (-z), negative = left. Density is highest on the far left.
      const azimuth = THREE.MathUtils.degToRad(-62 + Math.pow(rand(), 1.35) * 80);
      const elevation = THREE.MathUtils.degToRad(-30 + rand() * 50);

      positions[i * 3] = radius * Math.cos(elevation) * Math.sin(azimuth);
      positions[i * 3 + 1] = radius * Math.sin(elevation);
      positions[i * 3 + 2] = -radius * Math.cos(elevation) * Math.cos(azimuth);

      const tint = STAR_TINTS[Math.floor(rand() * STAR_TINTS.length)];
      const shade = 0.55 + rand() * 0.45;
      colors[i * 3] = tint.r * shade;
      colors[i * 3 + 1] = tint.g * shade;
      colors[i * 3 + 2] = tint.b * shade;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [count, seed]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!materialRef.current) return;
    const t = state.clock.elapsedTime;
    materialRef.current.opacity = opacity + Math.sin(t * twinkleSpeed + seed) * twinkleAmount;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={materialRef}
        map={texture}
        size={size}
        sizeAttenuation
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

function LeftStars() {
  const texture = useGlowTexture();
  return (
    <>
      <StarLayer count={STAR_COUNTS.tiny} size={0.5} seed={11} opacity={0.7} twinkleSpeed={1.3} twinkleAmount={0.18} texture={texture} />
      <StarLayer count={STAR_COUNTS.medium} size={0.9} seed={23} opacity={0.8} twinkleSpeed={0.9} twinkleAmount={0.2} texture={texture} />
      <StarLayer count={STAR_COUNTS.bright} size={1.7} seed={37} opacity={0.85} twinkleSpeed={0.6} twinkleAmount={0.15} texture={texture} />
    </>
  );
}

const ORB_COLORS = ['#c2c5c6', '#c37509', '#a78bfa', '#f0abfc', '#fde68a'];

/** Floating glowing orbs + two coloured lights that wash the left side of the street. */
function LeftGlow() {
  const texture = useGlowTexture();
  const groups = useRef<(THREE.Group | null)[]>([]);

  const orbs = useMemo(() => {
    const rand = mulberry32(5);
    return Array.from({ length: ORB_COUNT }, (_, i) => ({
      x: -22 + rand() * 18,
      y: 0.6 + rand() * 4.9,
      z: -5 + rand() * 15,
      size: 0.05 + rand() * 0.08,
      color: ORB_COLORS[i % ORB_COLORS.length],
      speed: 0.5 + rand() * 0.9,
      phase: rand() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    orbs.forEach((orb, i) => {
      const group = groups.current[i];
      if (!group) return;
      group.position.set(
        orb.x + Math.sin(t * 0.25 * orb.speed + orb.phase) * 0.7,
        orb.y + Math.sin(t * orb.speed + orb.phase) * 0.35,
        orb.z,
      );
      group.scale.setScalar(0.8 + 0.2 * Math.sin(t * 1.6 * orb.speed + orb.phase));
    });
  });

  return (
    <>
      <pointLight position={[-7, 3.2, 2.5]} color="#38bdf8" intensity={LEFT_LIGHT_INTENSITY} distance={26} decay={2} />
      <pointLight position={[-13, 2.4, -4]} color="#a78bfa" intensity={LEFT_LIGHT_INTENSITY * 0.8} distance={26} decay={2} />

      {orbs.map((orb, i) => (
        <group
          key={i}
          ref={(el) => {
            groups.current[i] = el;
          }}
        >
          <sprite scale={[orb.size * 16, orb.size * 16, 1]}>
            <spriteMaterial
              map={texture}
              color={orb.color}
              transparent
              opacity={0.55}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </sprite>
          <mesh>
            <sphereGeometry args={[orb.size, 12, 12]} />
            <meshBasicMaterial color={orb.color} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

const markerColors: Record<MarkerStatus, string> = {
  active: '#bae6fd',
  next: '#38bdf8',
  done: '#64748b',
  later: '#334155',
};

/** A ring painted on the asphalt where the car will park + a floating gem above the matching building. */
function StopMarker({
  road,
  pin,
  status,
}: {
  road: THREE.Vector3;
  pin: Vec3;
  status: MarkerStatus;
}) {
  const ringMaterial = useRef<THREE.MeshBasicMaterial>(null);
  const gemRef = useRef<THREE.Group>(null);
  const color = markerColors[status];

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    if (ringMaterial.current) {
      const opacity = { active: 1, next: 0.6 + Math.sin(time * 3.2) * 0.3, done: 0.35, later: 0.18 }[status];
      ringMaterial.current.opacity = opacity;
    }

    if (gemRef.current) {
      gemRef.current.rotation.y += dt * 1.4;
      gemRef.current.position.y = Math.sin(time * 2 + pin[0]) * 0.07;
      const scale = THREE.MathUtils.damp(gemRef.current.scale.x, status === 'active' ? 1.5 : 1, 6, dt);
      gemRef.current.scale.setScalar(scale);
    }
  });

  return (
    <>
      <mesh position={[road.x, ROAD_Y + 0.012, road.z]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 1, 1]}>
        <ringGeometry args={[0.5, 0.62, 48]} />
        <meshBasicMaterial ref={ringMaterial} color={color} transparent toneMapped={false} />
      </mesh>

      <group position={pin}>
        <group ref={gemRef}>
          <mesh scale={[1, 1.6, 1]}>
            <octahedronGeometry args={[0.16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} />
          </mesh>
        </group>
      </group>
    </>
  );
}
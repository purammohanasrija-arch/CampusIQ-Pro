/**
 * CampusIQ Pro — Interactive 3D Campus Digital Twin
 * Upgraded with animated 3D student characters:
 * - Students walking along campus pathways with natural swing cycles (legs, arms, vertical bobbing)
 * - Student scanning digital QR gate pass at the security gateway with animated laser scanner beam
 * - Students seated in the central green quad reading and studying
 * - Interactive click & hover states on both buildings and student pedestrians
 * - Damped OrbitControls, cinematic tour, transit shuttle, and time-of-day lighting engine
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  RotateCcw,
  Compass,
  Search,
  ExternalLink,
  Map as MapIcon,
  Eye,
  Building,
  Info,
  Sun,
  Moon,
  Sunset,
  Zap,
  Users,
  Activity,
  Layers,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  Video,
  QrCode,
  UserCheck
} from 'lucide-react';
import { NavTab } from './Sidebar';

export interface CampusBuildingData {
  id: string;
  name: string;
  category: string;
  shortDesc: string;
  targetTab: NavTab;
  position: [number, number, number];
  size: [number, number, number];
  color: number;
  stats: string;
  details: string;
  occupancyPercent: number;
  solarKw: number;
  activeLabs: number;
}

export const CAMPUS_BUILDINGS: CampusBuildingData[] = [
  {
    id: 'bldg-admin',
    name: 'Main Academic & Administration Hall',
    category: 'Governance & Dean',
    shortDesc: 'Office of the Dean, Controller of Examinations, Registrar, and Central Auditorium.',
    targetTab: 'exams',
    position: [-10, 0, -10],
    size: [12, 7, 10],
    color: 0x065f46,
    stats: 'Deans Office · Examination Board · LHC 101-304',
    details: 'Houses the controller of exams where Autumn 2026 hall tickets and seating charts are coordinated.',
    occupancyPercent: 84,
    solarKw: 42.8,
    activeLabs: 4
  },
  {
    id: 'bldg-cs',
    name: 'Turing Computer Science & AI Complex',
    category: 'Engineering Department',
    shortDesc: 'Department of Computer Science & Engineering, Autonomous Robotics Lab, and GPU Clusters.',
    targetTab: 'students',
    position: [10, 0, -10],
    size: [11, 8, 9],
    color: 0x047857,
    stats: '480 Undergraduates · 8 Specialization Labs · 32 Faculty',
    details: 'Center for high-performance computing, cybersecurity testbeds, and capstone project development.',
    occupancyPercent: 92,
    solarKw: 56.4,
    activeLabs: 8
  },
  {
    id: 'bldg-library',
    name: 'Central University Library',
    category: 'Academic Knowledge Center',
    shortDesc: '3-story digital library with RFID automated circulation, 20,000+ volumes, and quiet study cubicles.',
    targetTab: 'library',
    position: [-12, 0, 8],
    size: [9, 5, 8],
    color: 0x059669,
    stats: '1,080 Active Loans · Self-Checkout QR Desks · Study Labs',
    details: 'Features automated barcode indexing and instant borrowing via student digital ID QR passes.',
    occupancyPercent: 68,
    solarKw: 28.2,
    activeLabs: 3
  },
  {
    id: 'bldg-labs',
    name: 'Advanced Engineering & VLSI Labs',
    category: 'Hardware & Mechatronics',
    shortDesc: 'Precision instrumentation, 6-DOF robotic arms, digital storage oscilloscopes, and FPGA kits.',
    targetTab: 'lab',
    position: [12, 0, 8],
    size: [9, 5, 8],
    color: 0x0d9488,
    stats: 'Optimal Condition · Real-Time Equipment Allocation Tracker',
    details: 'Equipped with QR-tagged oscilloscopes, robotic workstations, and preventative maintenance schedules.',
    occupancyPercent: 77,
    solarKw: 34.0,
    activeLabs: 6
  },
  {
    id: 'bldg-canteen',
    name: 'Campus Dining Pavilion & Canteen',
    category: 'Dining & Student Services',
    shortDesc: 'Wholesome dining hall, artisanal cafe, high-protein grain bowls, and QR contactless counter pickup.',
    targetTab: 'canteen',
    position: [-2, 0, 14],
    size: [7, 3.5, 6],
    color: 0xd97706,
    stats: 'Campus Wallet Debiting · Counter 2 Pickup QR Verified',
    details: 'Integrated with CampusIQ dining order queue for live preparation updates and token redemption.',
    occupancyPercent: 88,
    solarKw: 18.5,
    activeLabs: 0
  },
  {
    id: 'bldg-expo',
    name: 'Innovation Arena & Project Expo',
    category: 'Exhibition & Events',
    shortDesc: 'Open exhibition hall hosting collegiate hackathons, project showcases, and student voting.',
    targetTab: 'projects',
    position: [0, 0, -18],
    size: [14, 4.5, 7],
    color: 0x0284c7,
    stats: 'Booth Placards · Anti-Duplicate Voting · Judge Scorecards',
    details: 'Current exhibition hosting National AI & Robotics Hackathon 2026 with live leaderboards.',
    occupancyPercent: 95,
    solarKw: 48.0,
    activeLabs: 2
  },
  {
    id: 'bldg-parking',
    name: 'Smart Parking Quad (Zone A & B)',
    category: 'Vehicle Logistics',
    shortDesc: 'Automated barrier gate, EV charging stations, and sensor-monitored vehicle bays.',
    targetTab: 'parking',
    position: [18, 0, -2],
    size: [8, 1.5, 10],
    color: 0x64748b,
    stats: 'Zone A & B Slots · RFID Boom Barrier · License Plate Matching',
    details: 'Monitors real-time parking spot occupancy and generates QR permits for enrolled student vehicles.',
    occupancyPercent: 62,
    solarKw: 22.0,
    activeLabs: 0
  },
  {
    id: 'bldg-gate',
    name: 'Main Campus Security Gateway',
    category: 'Security & Access Control',
    shortDesc: 'Central checkpoint for student gate passes, visitor identity registration, and RFID card scans.',
    targetTab: 'gatepass',
    position: [0, 0, 22],
    size: [8, 3, 3],
    color: 0x1e293b,
    stats: 'Terminal 1 Terminal · Real-Time Verification Audit Logging',
    details: 'Universal verification station enforcing single-use departure and campus re-entry pass rules.',
    occupancyPercent: 45,
    solarKw: 12.0,
    activeLabs: 0
  }
];

// Helper to construct a composite 3D student character
interface StudentAnimRefs {
  group: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  torso: THREE.Mesh;
  head: THREE.Mesh;
  phoneMesh?: THREE.Mesh;
  bookMesh?: THREE.Mesh;
  waypoints?: [number, number][];
  currentWpIndex?: number;
  speed?: number;
  action: 'walk' | 'scan_qr' | 'sit_quad' | 'sit_exam' | 'read';
  name: string;
  activityLabel: string;
}

function buildStudentCharacter(config: {
  shirtColor: number;
  pantsColor: number;
  backpackColor?: number;
  hasPhone?: boolean;
  hasBook?: boolean;
  name: string;
  activityLabel: string;
  action: 'walk' | 'scan_qr' | 'sit_quad' | 'sit_exam' | 'read';
  scale?: number;
}): StudentAnimRefs {
  const scale = config.scale || 1.0;
  const group = new THREE.Group();
  group.scale.set(scale, scale, scale);

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: config.shirtColor, roughness: 0.5 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: config.pantsColor, roughness: 0.7 });

  // 1. Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.3), shirtMat);
  torso.position.y = 0.95;
  torso.castShadow = true;
  group.add(torso);

  // Backpack
  if (config.backpackColor) {
    const bpMat = new THREE.MeshStandardMaterial({ color: config.backpackColor, roughness: 0.6 });
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.2), bpMat);
    backpack.position.set(0, 0.95, -0.22);
    backpack.castShadow = true;
    group.add(backpack);
  }

  // 2. Head & Hair
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), skinMat);
  head.position.y = 1.45;
  head.castShadow = true;
  group.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.8), hairMat);
  hair.position.set(0, 1.48, 0);
  group.add(hair);

  // 3. Legs
  const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.65, 8);
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.16, 0.35, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.16, 0.35, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  // 4. Arms
  const armGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.6, 8);
  const leftArm = new THREE.Mesh(armGeo, shirtMat);
  leftArm.position.set(-0.35, 0.92, 0);
  leftArm.castShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, shirtMat);
  rightArm.position.set(0.35, 0.92, 0);
  rightArm.castShadow = true;
  group.add(rightArm);

  // 5. Props: Smartphone (Glowing for QR Scan) or Book
  let phoneMesh: THREE.Mesh | undefined;
  let bookMesh: THREE.Mesh | undefined;

  if (config.hasPhone) {
    const phoneMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9
    });
    phoneMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.02), phoneMat);
    phoneMesh.position.set(0.2, 0.95, 0.4);
    phoneMesh.rotation.x = -Math.PI / 4;
    group.add(phoneMesh);
  }

  if (config.hasBook) {
    const bookMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 });
    bookMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.08), bookMat);
    bookMesh.position.set(0, 0.9, 0.28);
    bookMesh.rotation.x = Math.PI / 6;
    group.add(bookMesh);
  }

  group.userData = {
    isStudent: true,
    name: config.name,
    activityLabel: config.activityLabel,
    action: config.action
  };

  return {
    group,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    torso,
    head,
    phoneMesh,
    bookMesh,
    action: config.action,
    name: config.name,
    activityLabel: config.activityLabel
  };
}

const _scratchRaycaster = new THREE.Raycaster();
const _scratchMouse = new THREE.Vector2();

function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
  gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.20)');
  gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface ThreeCampusDigitalTwinProps {
  onNavigate: (tab: NavTab) => void;
}

export const ThreeCampusDigitalTwin: React.FC<ThreeCampusDigitalTwinProps> = ({ onNavigate }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuildingData | null>(CAMPUS_BUILDINGS[0]);
  const [hoveredBuilding, setHoveredBuilding] = useState<CampusBuildingData | null>(null);
  const [hoveredStudent, setHoveredStudent] = useState<{ name: string; activity: string } | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [searchFilter, setSearchFilter] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'dusk' | 'night'>('day');
  const [visLayer, setVisLayer] = useState<'arch' | 'occupancy' | 'energy'>('arch');
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [isTourRunning, setIsTourRunning] = useState(false);

  // References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(26, 28, 32));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isTransitioningCamera = useRef<boolean>(true);

  const buildingGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const buildingCoresRef = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());
  const beaconMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const treeFoliageRefs = useRef<THREE.Mesh[]>([]);
  const windowMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const shuttleRef = useRef<THREE.Group | null>(null);
  const fountainMeshRef = useRef<THREE.Mesh | null>(null);
  const haloRingRef = useRef<THREE.Mesh | null>(null);
  const qrLaserBeamRef = useRef<THREE.Mesh | null>(null);

  const studentsRef = useRef<StudentAnimRefs[]>([]);

  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  const hoveredIdRef = useRef<string | null>(null);
  const tourIndexRef = useRef<number>(0);
  const tourTimerRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current || viewMode !== '3d') return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const initialSky = 0xe2e8f0;
    scene.background = new THREE.Color(initialSky);
    scene.fog = new THREE.FogExp2(initialSky, 0.012);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 250);
    camera.position.set(26, 28, 32);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);

    const gl = renderer.getContext();
    const dbgRenderInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbgRenderInfo ? gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);

    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 8;
    controls.maxDistance = 85;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      isTransitioningCamera.current = false;
      setIsTourRunning(false);
    });

    // 5. Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd1fae5, 0.45);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
    sunLight.position.set(34, 45, 22);
    sunLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.bias = -0.0004;
    }
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 7. Ground & Roads
    const shadowTexture = createRadialShadowTexture();

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9, metalness: 0.05 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 36),
      new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.85, metalness: 0.02 })
    );
    quad.rotation.x = -Math.PI / 2;
    quad.position.y = 0.02;
    quad.receiveShadow = true;
    scene.add(quad);

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6, metalness: 0.1 });
    const roadX = new THREE.Mesh(new THREE.PlaneGeometry(74, 4.4), roadMat);
    roadX.rotation.x = -Math.PI / 2;
    roadX.position.set(0, 0.03, 0);
    roadX.receiveShadow = true;
    scene.add(roadX);

    const roadZ = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 74), roadMat);
    roadZ.rotation.x = -Math.PI / 2;
    roadZ.position.set(0, 0.03, 0);
    roadZ.receiveShadow = true;
    scene.add(roadZ);

    const ringRoad = new THREE.Mesh(new THREE.RingGeometry(24, 28, 32), new THREE.MeshStandardMaterial({ color: 0xa1a1aa, roughness: 0.7 }));
    ringRoad.rotation.x = -Math.PI / 2;
    ringRoad.position.set(0, 0.025, 0);
    ringRoad.receiveShadow = true;
    scene.add(ringRoad);

    // 8. Central Fountain
    const fountainGroup = new THREE.Group();
    const fountainRim = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.4, 0.5, 24),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.6, metalness: 0.2 })
    );
    fountainRim.position.y = 0.25;
    fountainRim.castShadow = true;
    fountainGroup.add(fountainRim);

    const fountainWater = new THREE.Mesh(
      new THREE.CircleGeometry(3.0, 24),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85
      })
    );
    fountainWater.rotation.x = -Math.PI / 2;
    fountainWater.position.y = 0.42;
    fountainGroup.add(fountainWater);
    fountainMeshRef.current = fountainWater;

    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.3, 0.9, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 })
    );
    nozzle.position.y = 0.6;
    fountainGroup.add(nozzle);
    scene.add(fountainGroup);

    // 9. Procedural Trees
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.4, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const foliageGeo = new THREE.DodecahedronGeometry(1.2);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });

    treeFoliageRefs.current = [];
    const treePositions: [number, number][] = [
      [-5, -5], [5, -5], [-5, 5], [5, 5],
      [-14, 0], [14, 0], [0, -12], [0, 12],
      [-7, 10], [7, 10], [-7, -10], [7, -10],
      [-18, 14], [18, 14], [-18, -14], [18, -14]
    ];

    treePositions.forEach(([x, z]) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.7;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(foliageGeo, foliageMat.clone());
      foliage.position.y = 2.1;
      foliage.castShadow = true;
      tree.add(foliage);
      treeFoliageRefs.current.push(foliage);

      scene.add(tree);
    });

    // 10. Autonomous Campus Shuttle
    const shuttle = new THREE.Group();
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.1, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3, metalness: 0.4 })
    );
    chassis.position.y = 0.8;
    chassis.castShadow = true;
    shuttle.add(chassis);

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75
    });
    const shuttleGlass = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 1.25), glassMat);
    shuttleGlass.position.y = 1.2;
    shuttle.add(shuttleGlass);

    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    [[-0.8, 0.3, 0.65], [0.8, 0.3, 0.65], [-0.8, 0.3, -0.65], [0.8, 0.3, -0.65]].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      shuttle.add(wheel);
    });

    const hlMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 1.5 });
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.2), hlMat);
    hlL.position.set(1.22, 0.75, 0.35);
    shuttle.add(hlL);
    const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.2), hlMat);
    hlR.position.set(1.22, 0.75, -0.35);
    shuttle.add(hlR);

    scene.add(shuttle);
    shuttleRef.current = shuttle;

    // 11. Holographic Selection Halo Ring
    const haloMesh = new THREE.Mesh(
      new THREE.RingGeometry(3.5, 4.2, 32),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    haloMesh.rotation.x = -Math.PI / 2;
    haloMesh.position.set(-10, 0.05, -10);
    scene.add(haloMesh);
    haloRingRef.current = haloMesh;

    // 12. Composite Architectural Buildings & 3D Waypoint Beacons
    buildingGroupsRef.current.clear();
    buildingCoresRef.current.clear();
    beaconMeshesRef.current.clear();
    windowMaterialsRef.current = [];

    CAMPUS_BUILDINGS.forEach(bldg => {
      const group = new THREE.Group();
      group.position.set(bldg.position[0], 0, bldg.position[2]);
      group.userData = { id: bldg.id, data: bldg, baseY: 0 };

      const [sx, sy, sz] = bldg.size;

      // Contact shadow
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(sx * 1.5, sz * 1.5),
        new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: 0.7, depthWrite: false })
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = 0.015;
      group.add(shadowPlane);

      // Plinth
      const plinthHeight = 0.4;
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(sx + 0.8, plinthHeight, sz + 0.8),
        new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85, metalness: 0.15 })
      );
      plinth.position.y = plinthHeight / 2;
      plinth.receiveShadow = true;
      plinth.castShadow = true;
      group.add(plinth);

      // Core
      const coreHeight = sy - plinthHeight;
      const coreMat = new THREE.MeshStandardMaterial({
        color: bldg.color,
        roughness: 0.25,
        metalness: 0.35,
        emissive: 0x000000,
        emissiveIntensity: 0.0
      });
      const coreMesh = new THREE.Mesh(new THREE.BoxGeometry(sx, coreHeight, sz), coreMat);
      coreMesh.position.y = plinthHeight + coreHeight / 2;
      coreMesh.castShadow = true;
      coreMesh.receiveShadow = true;
      coreMesh.userData = { id: bldg.id, data: bldg };
      group.add(coreMesh);
      buildingCoresRef.current.set(bldg.id, coreMat);

      // Windows
      const windowRows = 3;
      const windowCols = Math.max(3, Math.floor(sx / 2));
      const winMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        emissive: 0x0284c7,
        emissiveIntensity: 0.1,
        roughness: 0.15,
        metalness: 0.85
      });
      windowMaterialsRef.current.push(winMat);

      for (let r = 0; r < windowRows; r++) {
        for (let c = 0; c < windowCols; c++) {
          const winW = (sx / windowCols) * 0.65;
          const winH = (coreHeight / windowRows) * 0.55;
          const winBox = new THREE.BoxGeometry(winW, winH, 0.08);

          const winFront = new THREE.Mesh(winBox, winMat);
          const posX = -sx / 2 + (c + 0.5) * (sx / windowCols);
          const posY = plinthHeight + (r + 0.5) * (coreHeight / windowRows);
          winFront.position.set(posX, posY, sz / 2 + 0.05);
          group.add(winFront);

          const winBack = new THREE.Mesh(winBox, winMat);
          winBack.position.set(posX, posY, -sz / 2 - 0.05);
          group.add(winBack);
        }
      }

      // Roof Cornice & Solar Panels
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(sx + 0.5, 0.35, sz + 0.5),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.5 })
      );
      roof.position.y = plinthHeight + coreHeight + 0.35 / 2;
      roof.castShadow = true;
      group.add(roof);

      const solarArrayCount = Math.max(2, Math.floor(sx / 3));
      const spGeo = new THREE.BoxGeometry(1.6, 0.1, 1.2);
      const spMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.1, metalness: 0.9 });
      for (let s = 0; s < solarArrayCount; s++) {
        const panel = new THREE.Mesh(spGeo, spMat);
        panel.position.set(-sx / 3 + s * 1.8, plinthHeight + coreHeight + 0.45, 0);
        panel.rotation.x = 0.18;
        panel.castShadow = true;
        group.add(panel);
      }

      // Canopy
      const canopy = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.15, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
      );
      canopy.position.set(0, 1.2, sz / 2 + 0.7);
      canopy.castShadow = true;
      group.add(canopy);

      // 3D Waypoint Beacon above roof
      const beaconGroup = new THREE.Group();
      beaconGroup.position.set(0, sy + 1.8, 0);

      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55),
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.8,
          roughness: 0.2,
          metalness: 0.8
        })
      );
      beaconGroup.add(gem);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.04, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.7 })
      );
      ring.rotation.x = Math.PI / 2;
      beaconGroup.add(ring);

      group.add(beaconGroup);
      beaconMeshesRef.current.set(bldg.id, beaconGroup);

      scene.add(group);
      buildingGroupsRef.current.set(bldg.id, group);
    });

    // 13. ANIMATED 3D STUDENT CHARACTERS ON CAMPUS
    studentsRef.current = [];

    // Character 1: Walking from Main Gate to CS Dept
    const student1 = buildStudentCharacter({
      shirtColor: 0x0284c7, // Blue hoodie
      pantsColor: 0x1e293b,
      backpackColor: 0x7c3aed,
      name: 'Aarav Sharma (241FA04001)',
      activityLabel: 'Walking to Turing AI Robotics Complex',
      action: 'walk'
    });
    student1.waypoints = [
      [2, 18],
      [2, 4],
      [8, 2],
      [8, -6],
      [2, 4]
    ];
    student1.currentWpIndex = 0;
    student1.speed = 2.4;
    student1.group.position.set(2, 0, 18);
    scene.add(student1.group);
    studentsRef.current.push(student1);

    // Character 2: Walking from Library to Canteen
    const student2 = buildStudentCharacter({
      shirtColor: 0xd97706, // Amber jacket
      pantsColor: 0x334155,
      backpackColor: 0x059669,
      hasBook: true,
      name: 'Priya Patel (EC-2024-042)',
      activityLabel: 'Carrying Library Book to Dining Hall',
      action: 'walk'
    });
    student2.waypoints = [
      [-8, 6],
      [-2, 6],
      [-2, 12],
      [-8, 12],
      [-8, 6]
    ];
    student2.currentWpIndex = 0;
    student2.speed = 2.0;
    student2.group.position.set(-8, 0, 6);
    scene.add(student2.group);
    studentsRef.current.push(student2);

    // Character 3: Walking along Academic Loop
    const student3 = buildStudentCharacter({
      shirtColor: 0x10b981, // Emerald t-shirt
      pantsColor: 0x0f172a,
      name: 'Rohan Verma (ME-2024-115)',
      activityLabel: 'Heading to Engineering Workshop',
      action: 'walk'
    });
    student3.waypoints = [
      [6, -6],
      [-6, -6],
      [-6, -14],
      [6, -14],
      [6, -6]
    ];
    student3.currentWpIndex = 0;
    student3.speed = 2.2;
    student3.group.position.set(6, 0, -6);
    scene.add(student3.group);
    studentsRef.current.push(student3);

    // Character 4: Scanning Digital QR Gate Pass at Security Gateway Turnstile!
    const studentScanner = buildStudentCharacter({
      shirtColor: 0xef4444, // Red varsity jacket
      pantsColor: 0x1e293b,
      hasPhone: true,
      name: 'Ananya Sen (CS-2024-064)',
      activityLabel: 'Scanning Digital QR Pass at Main Gate',
      action: 'scan_qr'
    });
    studentScanner.group.position.set(1.8, 0, 20.8);
    studentScanner.group.rotation.y = Math.PI; // Facing the gate terminal
    studentScanner.rightArm.rotation.x = -1.1; // Arm raised forward holding phone
    scene.add(studentScanner.group);
    studentsRef.current.push(studentScanner);

    // QR Turnstile Pedestal & Glowing Laser Fan
    const turnstilePedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 1.1, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
    );
    turnstilePedestal.position.set(1.8, 0.55, 20.1);
    scene.add(turnstilePedestal);

    // Laser Beam Fan (Pulsing Green)
    const laserBeam = new THREE.Mesh(
      new THREE.PlaneGeometry(0.5, 0.6),
      new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      })
    );
    laserBeam.position.set(1.8, 1.05, 20.45);
    laserBeam.rotation.x = Math.PI / 3;
    scene.add(laserBeam);
    qrLaserBeamRef.current = laserBeam;

    // Character 5: Seated on Quad Grass reading notebook
    const studentQuad = buildStudentCharacter({
      shirtColor: 0x6366f1, // Indigo sweater
      pantsColor: 0x475569,
      hasBook: true,
      name: 'Sneha Rao (EE-2024-019)',
      activityLabel: 'Studying Course Notes on Quad Lawn',
      action: 'sit_quad'
    });
    studentQuad.group.position.set(4, 0.2, 3);
    studentQuad.group.rotation.y = -0.5;
    studentQuad.leftLeg.rotation.x = Math.PI / 2.2;
    studentQuad.rightLeg.rotation.x = Math.PI / 2.2;
    studentQuad.torso.position.y = 0.5;
    studentQuad.head.position.y = 1.0;
    scene.add(studentQuad.group);
    studentsRef.current.push(studentQuad);

    // 14. Pointer & Click Handlers (Buildings & Students)
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      _scratchMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _scratchMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _scratchRaycaster.setFromCamera(_scratchMouse, camera);

      // Test Buildings
      const bldgHitCandidates: THREE.Object3D[] = [];
      buildingGroupsRef.current.forEach(grp => {
        grp.traverse(child => {
          if ((child as THREE.Mesh).isMesh && child.userData?.id) {
            bldgHitCandidates.push(child);
          }
        });
      });

      // Test Students
      const studentHitCandidates: THREE.Object3D[] = [];
      studentsRef.current.forEach(s => {
        s.group.traverse(child => {
          if ((child as THREE.Mesh).isMesh) {
            studentHitCandidates.push(child);
          }
        });
      });

      const bldgIntersects = _scratchRaycaster.intersectObjects(bldgHitCandidates, false);
      const studentIntersects = _scratchRaycaster.intersectObjects(studentHitCandidates, false);

      if (studentIntersects.length > 0) {
        let cur = studentIntersects[0].object;
        while (cur && !cur.userData?.isStudent && cur.parent) {
          cur = cur.parent;
        }
        if (cur?.userData?.isStudent) {
          setHoveredStudent({
            name: cur.userData.name,
            activity: cur.userData.activityLabel
          });
          setHoveredBuilding(null);
          container.style.cursor = 'pointer';
          return;
        }
      }

      setHoveredStudent(null);

      if (bldgIntersects.length > 0) {
        const hitId = bldgIntersects[0].object.userData.id;
        const matched = CAMPUS_BUILDINGS.find(b => b.id === hitId);
        hoveredIdRef.current = hitId;
        setHoveredBuilding(matched || null);
        container.style.cursor = 'pointer';
      } else {
        hoveredIdRef.current = null;
        setHoveredBuilding(null);
        container.style.cursor = 'grab';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      _scratchMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _scratchMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _scratchRaycaster.setFromCamera(_scratchMouse, camera);

      // Check students first
      const studentHitCandidates: THREE.Object3D[] = [];
      studentsRef.current.forEach(s => {
        s.group.traverse(child => {
          if ((child as THREE.Mesh).isMesh) {
            studentHitCandidates.push(child);
          }
        });
      });

      const studentIntersects = _scratchRaycaster.intersectObjects(studentHitCandidates, false);
      if (studentIntersects.length > 0) {
        let cur = studentIntersects[0].object;
        while (cur && !cur.userData?.isStudent && cur.parent) {
          cur = cur.parent;
        }
        if (cur) {
          const { x, z } = cur.position;
          targetCameraPos.current.set(x + 5, 4, z + 5.5);
          targetLookAt.current.set(x, 1.2, z);
          isTransitioningCamera.current = true;
          return;
        }
      }

      // Check buildings
      const hitCandidates: THREE.Object3D[] = [];
      buildingGroupsRef.current.forEach(grp => {
        grp.traverse(child => {
          if ((child as THREE.Mesh).isMesh && child.userData?.id) {
            hitCandidates.push(child);
          }
        });
      });

      const intersects = _scratchRaycaster.intersectObjects(hitCandidates, false);
      if (intersects.length > 0) {
        const hitId = intersects[0].object.userData.id;
        const matched = CAMPUS_BUILDINGS.find(b => b.id === hitId);
        if (matched) {
          selectBuilding(matched);
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth || 800;
      const h = mountRef.current.clientHeight || 560;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 15. Damped Render Loop with Student Animations
    let animationFrameId: number;
    let shuttleAngle = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Camera Glide
      if (isTransitioningCamera.current) {
        camera.position.lerp(targetCameraPos.current, 0.055);
        controls.target.lerp(targetLookAt.current, 0.055);

        if (camera.position.distanceTo(targetCameraPos.current) < 0.1) {
          isTransitioningCamera.current = false;
        }
      }

      controls.update();

      // Automated Tour
      if (isTourRunning) {
        tourTimerRef.current += delta;
        if (tourTimerRef.current > 4.5) {
          tourTimerRef.current = 0;
          tourIndexRef.current = (tourIndexRef.current + 1) % CAMPUS_BUILDINGS.length;
          const nextBldg = CAMPUS_BUILDINGS[tourIndexRef.current];
          setSelectedBuilding(nextBldg);
          const [bx, , bz] = nextBldg.position;
          targetCameraPos.current.set(bx + 14, 16, bz + 16);
          targetLookAt.current.set(bx, 2, bz);
          isTransitioningCamera.current = true;
        }
      }

      // ANIMATE WALKING STUDENTS
      studentsRef.current.forEach((student, idx) => {
        if (student.action === 'walk' && student.waypoints && student.waypoints.length > 0) {
          const wpIdx = student.currentWpIndex || 0;
          const [targetX, targetZ] = student.waypoints[wpIdx];
          const curPos = student.group.position;

          const dx = targetX - curPos.x;
          const dz = targetZ - curPos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < 0.5) {
            student.currentWpIndex = (wpIdx + 1) % student.waypoints.length;
          } else {
            const moveSpeed = (student.speed || 2.0) * delta;
            curPos.x += (dx / dist) * moveSpeed;
            curPos.z += (dz / dist) * moveSpeed;

            // Face direction of walking
            const angle = Math.atan2(dx, dz);
            student.group.rotation.y = angle;

            // Natural Leg & Arm Swing Cycle
            const legSwing = Math.sin(elapsed * 7 + idx * 2) * 0.55;
            student.leftLeg.rotation.x = legSwing;
            student.rightLeg.rotation.x = -legSwing;

            student.leftArm.rotation.x = -legSwing * 0.7;
            student.rightArm.rotation.x = legSwing * 0.7;

            // Subtle vertical bounce
            curPos.y = Math.abs(Math.sin(elapsed * 7 + idx * 2)) * 0.08;
          }
        } else if (student.action === 'scan_qr') {
          // Subtle breathing & phone jitter
          student.rightArm.rotation.x = -1.1 + Math.sin(elapsed * 3) * 0.05;
          student.head.rotation.x = 0.2 + Math.sin(elapsed * 2) * 0.03;

          // Pulse QR Laser Beam
          if (qrLaserBeamRef.current) {
            const laserPulse = 0.4 + Math.sin(elapsed * 6) * 0.35;
            (qrLaserBeamRef.current.material as THREE.MeshBasicMaterial).opacity = laserPulse;
          }
        } else if (student.action === 'sit_quad') {
          // Subtle head turning / looking around quad
          student.head.rotation.y = Math.sin(elapsed * 0.8) * 0.3;
          student.head.rotation.x = 0.15 + Math.sin(elapsed * 1.5) * 0.05;
        }
      });

      // Hover elevation on buildings
      buildingGroupsRef.current.forEach((grp, bldgId) => {
        const isHovered = hoveredIdRef.current === bldgId;
        const targetElevation = isHovered ? 0.35 : 0;
        grp.position.y = THREE.MathUtils.damp(grp.position.y, targetElevation, 10, delta);

        const mat = buildingCoresRef.current.get(bldgId);
        if (mat) {
          const targetGlow = isHovered ? 0.45 : 0;
          mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, targetGlow, 8, delta);
          if (isHovered) {
            mat.emissive.setHex(0x10b981);
          }
        }

        const beacon = beaconMeshesRef.current.get(bldgId);
        if (beacon) {
          beacon.position.y = (grp.userData.data.size[1] + 1.8) + Math.sin(elapsed * 2.5 + bldgId.length) * 0.25;
          beacon.rotation.y += delta * 1.5;
          const beaconScale = isHovered ? 1.3 : 1.0;
          beacon.scale.lerp(new THREE.Vector3(beaconScale, beaconScale, beaconScale), 0.1);
        }
      });

      // Wind sway on trees
      treeFoliageRefs.current.forEach((foliage, idx) => {
        foliage.rotation.z = Math.sin(elapsed * 1.8 + idx) * 0.05;
        foliage.rotation.x = Math.cos(elapsed * 1.4 + idx) * 0.04;
      });

      // Shuttle movement
      if (shuttleRef.current) {
        shuttleAngle += delta * 0.45;
        const radius = 26;
        const sx = Math.cos(shuttleAngle) * radius;
        const sz = Math.sin(shuttleAngle) * radius;
        shuttleRef.current.position.set(sx, 0, sz);
        shuttleRef.current.rotation.y = -shuttleAngle - Math.PI / 2;
      }

      // Fountain ripple
      if (fountainMeshRef.current) {
        const waveScale = 1 + Math.sin(elapsed * 3.5) * 0.035;
        fountainMeshRef.current.scale.set(waveScale, waveScale, 1);
      }

      // Selection halo pulse
      if (haloRingRef.current) {
        const pulse = 1 + Math.sin(elapsed * 3) * 0.08;
        haloRingRef.current.scale.set(pulse, pulse, 1);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [viewMode, isTourRunning]);

  // Dynamic Lighting
  useEffect(() => {
    if (!sceneRef.current || !sunLightRef.current || !hemiLightRef.current) return;
    const scene = sceneRef.current;
    const sun = sunLightRef.current;
    const hemi = hemiLightRef.current;

    if (timeOfDay === 'day') {
      const daySky = 0xe2e8f0;
      scene.background = new THREE.Color(daySky);
      if (scene.fog) scene.fog.color = new THREE.Color(daySky);
      sun.color = new THREE.Color(0xfffbeb);
      sun.intensity = 1.35;
      hemi.intensity = 0.45;

      windowMaterialsRef.current.forEach(mat => {
        mat.emissive = new THREE.Color(0x0284c7);
        mat.emissiveIntensity = 0.1;
      });
    } else if (timeOfDay === 'dusk') {
      const duskSky = 0xfde68a;
      scene.background = new THREE.Color(0xd97706);
      if (scene.fog) scene.fog.color = new THREE.Color(0xd97706);
      sun.color = new THREE.Color(0xfb923c);
      sun.intensity = 1.0;
      hemi.intensity = 0.35;

      windowMaterialsRef.current.forEach(mat => {
        mat.emissive = new THREE.Color(0xf59e0b);
        mat.emissiveIntensity = 0.7;
      });
    } else {
      const nightSky = 0x0f172a;
      scene.background = new THREE.Color(nightSky);
      if (scene.fog) scene.fog.color = new THREE.Color(nightSky);
      sun.color = new THREE.Color(0x38bdf8);
      sun.intensity = 0.3;
      hemi.intensity = 0.15;

      windowMaterialsRef.current.forEach(mat => {
        mat.emissive = new THREE.Color(0x38bdf8);
        mat.emissiveIntensity = 1.6;
      });
    }
  }, [timeOfDay]);

  // Visual Layer
  useEffect(() => {
    buildingCoresRef.current.forEach((mat, bldgId) => {
      const bldg = CAMPUS_BUILDINGS.find(b => b.id === bldgId);
      if (!bldg) return;

      if (visLayer === 'arch') {
        mat.color.setHex(bldg.color);
      } else if (visLayer === 'occupancy') {
        if (bldg.occupancyPercent > 85) {
          mat.color.setHex(0xef4444);
        } else if (bldg.occupancyPercent >= 70) {
          mat.color.setHex(0xf59e0b);
        } else {
          mat.color.setHex(0x10b981);
        }
      } else if (visLayer === 'energy') {
        mat.color.setHex(0x06b6d4);
      }
    });
  }, [visLayer]);

  const selectBuilding = (building: CampusBuildingData) => {
    setSelectedBuilding(building);
    setIsTourRunning(false);
    const [bx, , bz] = building.position;

    if (haloRingRef.current) {
      haloRingRef.current.position.set(bx, 0.05, bz);
      const [sx, , sz] = building.size;
      const radiusScale = Math.max(sx, sz) * 0.16;
      haloRingRef.current.scale.set(radiusScale, radiusScale, 1);
    }

    targetCameraPos.current.set(bx + 14, 18, bz + 18);
    targetLookAt.current.set(bx, 2, bz);
    isTransitioningCamera.current = true;
  };

  const resetCamera = () => {
    setIsTourRunning(false);
    targetCameraPos.current.set(26, 28, 32);
    targetLookAt.current.set(0, 0, 0);
    isTransitioningCamera.current = true;
  };

  const toggleTour = () => {
    const nextState = !isTourRunning;
    setIsTourRunning(nextState);
    if (nextState) {
      tourTimerRef.current = 0;
      const bldg = CAMPUS_BUILDINGS[tourIndexRef.current];
      selectBuilding(bldg);
    }
  };

  const filteredBuildings = useMemo(() => {
    if (!searchFilter.trim()) return CAMPUS_BUILDINGS;
    const q = searchFilter.toLowerCase();
    return CAMPUS_BUILDINGS.filter(
      b => b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q) || b.stats.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  return (
    <div className="space-y-4">
      {/* Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
            <Building className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 leading-tight">CampusIQ Pro 3D Digital Twin</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Student Avatars
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Interactive 3D campus twin featuring walking student pedestrians, QR gate scanning, and courtyard study groups.
            </p>
          </div>
        </div>

        {/* View Controls & Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleTour}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isTourRunning
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs animate-pulse'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200 shadow-2xs'
            }`}
            title="Automated scenic drone tour across all campus complexes"
          >
            {isTourRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-700" />}
            <span>{isTourRunning ? 'Tour Playing' : 'Cinematic Tour'}</span>
          </button>

          <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setTimeOfDay('day')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition-all ${
                timeOfDay === 'day' ? 'bg-white shadow-xs text-amber-600 font-semibold' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Daylight Sun"
            >
              <Sun className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Day</span>
            </button>
            <button
              onClick={() => setTimeOfDay('dusk')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition-all ${
                timeOfDay === 'dusk' ? 'bg-white shadow-xs text-orange-600 font-semibold' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Golden Dusk"
            >
              <Sunset className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Dusk</span>
            </button>
            <button
              onClick={() => setTimeOfDay('night')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition-all ${
                timeOfDay === 'night' ? 'bg-stone-900 shadow-xs text-sky-400 font-semibold' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Cyber Night & Window Lights"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Night</span>
            </button>
          </div>

          <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setVisLayer('arch')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                visLayer === 'arch' ? 'bg-white shadow-xs text-emerald-800' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Architectural
            </button>
            <button
              onClick={() => setVisLayer('occupancy')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                visLayer === 'occupancy' ? 'bg-white shadow-xs text-amber-700' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Crowd Heat</span>
            </button>
            <button
              onClick={() => setVisLayer('energy')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                visLayer === 'energy' ? 'bg-white shadow-xs text-cyan-700' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Solar Grid</span>
            </button>
          </div>

          <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === '3d' ? 'bg-white shadow-xs text-emerald-800' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              3D View
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === '2d' ? 'bg-white shadow-xs text-emerald-800' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              2D Directory
            </button>
          </div>
        </div>
      </div>

      {/* 3D Viewport */}
      {viewMode === '3d' ? (
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-950">
          <div
            ref={mountRef}
            className="w-full h-[580px] cursor-grab active:cursor-grabbing select-none"
          />

          {/* Top-Right Quick Camera Preset Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={resetCamera}
              className="px-3 py-1.5 bg-stone-900/90 hover:bg-stone-800 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 shadow-sm flex items-center gap-1.5 transition-colors"
              title="Reset Aerial Vista"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Vista</span>
            </button>
            <button
              onClick={() => {
                setIsTourRunning(false);
                targetCameraPos.current.set(0, 48, 0.1);
                targetLookAt.current.set(0, 0, 0);
                isTransitioningCamera.current = true;
              }}
              className="px-3 py-1.5 bg-stone-900/90 hover:bg-stone-800 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 shadow-sm flex items-center gap-1.5 transition-colors"
              title="Top-Down Orthographic View"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Top-Down</span>
            </button>
          </div>

          {/* Hovered Student HUD Card */}
          {hoveredStudent && (
            <div className="absolute top-4 left-4 bg-emerald-950/95 text-white px-3.5 py-2.5 rounded-xl border border-emerald-500 shadow-xl text-xs pointer-events-none z-10 flex items-center gap-2.5 animate-in fade-in duration-150">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="font-bold block text-emerald-200 text-sm flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {hoveredStudent.name}
                </span>
                <span className="text-[11px] text-stone-200 font-medium">
                  {hoveredStudent.activity}
                </span>
              </div>
            </div>
          )}

          {/* Hovered Building HUD Card */}
          {!hoveredStudent && hoveredBuilding && (
            <div className="absolute top-4 left-4 bg-stone-900/95 text-stone-100 px-3.5 py-2.5 rounded-xl border border-stone-700 shadow-xl text-xs pointer-events-none z-10 flex items-center gap-2.5 animate-in fade-in duration-150">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <span className="font-bold block text-white text-sm">{hoveredBuilding.name}</span>
                <span className="text-[11px] text-stone-400">
                  {hoveredBuilding.category} · Click to focus & launch module
                </span>
              </div>
            </div>
          )}

          {/* Tour Status Banner */}
          {isTourRunning && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500/95 text-stone-950 px-4 py-1.5 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 z-10">
              <Video className="w-3.5 h-3.5 animate-pulse" />
              <span>Cinematic Drone Tour Active (Click canvas to take control)</span>
            </div>
          )}

          {/* Collapsible Bottom Control Dock */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-20">
            <div className="bg-stone-900/95 text-stone-100 rounded-2xl border border-stone-700/80 shadow-2xl overflow-hidden transition-all duration-200">
              <div className="px-4 py-2.5 flex items-center justify-between border-b border-stone-800 bg-stone-950/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {selectedBuilding ? selectedBuilding.name : 'Select a Campus Complex'}
                  </span>
                  {selectedBuilding && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                      {selectedBuilding.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedBuilding && (
                    <button
                      onClick={() => onNavigate(selectedBuilding.targetTab)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <span>Launch Module</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setDockCollapsed(!dockCollapsed)}
                    className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                    title={dockCollapsed ? 'Expand Details' : 'Collapse Details'}
                  >
                    {dockCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!dockCollapsed && selectedBuilding && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2 space-y-1.5">
                    <p className="text-stone-300 leading-relaxed font-normal">
                      {selectedBuilding.shortDesc}
                    </p>
                    <p className="text-stone-400 text-[11px] leading-relaxed">
                      {selectedBuilding.details}
                    </p>
                  </div>

                  <div className="space-y-2 bg-stone-950/80 p-3 rounded-xl border border-stone-800">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-amber-400" /> Occupancy:
                      </span>
                      <span className="font-mono font-bold text-white">{selectedBuilding.occupancyPercent}%</span>
                    </div>
                    <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${selectedBuilding.occupancyPercent}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className="text-stone-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400" /> Solar Generation:
                      </span>
                      <span className="font-mono font-bold text-cyan-300">{selectedBuilding.solarKw} kW/h</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-400" /> Active Labs:
                      </span>
                      <span className="font-mono font-bold text-stone-200">{selectedBuilding.activeLabs} Active</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 2D Accessible Blueprint Map */
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-emerald-800" />
              <span>Campus Map Directory & Locations (2D Alternative)</span>
            </h3>
            <span className="text-xs text-stone-500">{CAMPUS_BUILDINGS.length} Registered Quadrants</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBuildings.map(bldg => (
              <div
                key={bldg.id}
                className="p-4 rounded-xl border border-stone-200 hover:border-emerald-500/60 bg-stone-50 hover:bg-white transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                      {bldg.category}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      Coord: {bldg.position[0]}, {bldg.position[2]}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 mt-1">{bldg.name}</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">{bldg.shortDesc}</p>
                  <p className="text-[11px] text-stone-500 mt-2 font-medium">{bldg.details}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-stone-400">{bldg.stats}</span>
                  <button
                    onClick={() => onNavigate(bldg.targetTab)}
                    className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold shadow-2xs flex items-center gap-1"
                  >
                    <span>Open Module</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Location Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-stone-400 font-semibold text-[10px] uppercase shrink-0">Quick Fly-To:</span>
        {CAMPUS_BUILDINGS.map(b => (
          <button
            key={b.id}
            onClick={() => {
              if (viewMode !== '3d') setViewMode('3d');
              selectBuilding(b);
            }}
            className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors text-xs font-medium ${
              selectedBuilding?.id === b.id
                ? 'bg-emerald-800 text-white border-emerald-800 font-semibold'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            {b.name.split(' ')[0]} {b.name.split(' ')[1] || ''}
          </button>
        ))}
      </div>
    </div>
  );
};

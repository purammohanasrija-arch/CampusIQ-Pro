/**
 * CampusIQ Pro — 3D Examination Hall Planner & Seating Grid
 * Upgraded with realistic 3D examinees and invigilator:
 * - Seated student avatars at examination desks actively writing on answer booklets with rhythmic hand writing motions
 * - Chief Proctor / Invigilator pacing along the center aisle surveying examinees with an invigilation clipboard
 * - Question papers and admit card QR credentials procedurally placed on desks
 * - Desk D-23: Primary student Aarav Sharma actively taking his CS601 Distributed Systems final exam
 * - Damped OrbitControls, candidate POV, live ticking smartboard, and candidate inspection dock
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  FileSpreadsheet,
  Printer,
  Search,
  RotateCcw,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sparkles,
  Layers,
  Clock,
  QrCode,
  Compass,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Play,
  Pause,
  Video,
  PenTool,
  BookOpen
} from 'lucide-react';
import { Exam, HallTicket, UserRole } from '../types/campus';

export interface DeskData {
  deskNumber: string;
  row: number;
  col: number;
  status: 'Assigned' | 'Available' | 'Blocked';
  candidateName?: string;
  rollNumber?: string;
  courseCode?: string;
  eligibility?: string;
  attendancePercent?: number;
  qrToken?: string;
}

interface ThreeExamHallPlannerProps {
  exams: Exam[];
  hallTickets: HallTicket[];
  userRole: UserRole;
  onVerifyToken: (token: string) => void;
}

const _scratchRaycaster = new THREE.Raycaster();
const _scratchMouse = new THREE.Vector2();

function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(15, 23, 42, 0.40)');
  gradient.addColorStop(0.6, 'rgba(15, 23, 42, 0.15)');
  gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createSmartboardTexture(timeRemainingStr: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1024, 512);

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 1004, 492);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 36px monospace';
  ctx.fillText('CAMPUSIQ PRO — CONTROLLER OF EXAMINATIONS', 40, 60);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 44px sans-serif';
  ctx.fillText('CS601: Distributed Systems & Cloud Infrastructure', 40, 130);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '24px sans-serif';
  ctx.fillText('Hall: LHC-302 · Autumn End-Semester Final Examination 2026', 40, 175);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(40, 210, 944, 130);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 210, 944, 130);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('EXAMINATION TIME REMAINING:', 70, 255);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 54px monospace';
  ctx.fillText(timeRemainingStr, 70, 315);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '20px sans-serif';
  ctx.fillText('• Place Digital ID QR Card & Admit Card on the top-right desk corner.', 40, 380);
  ctx.fillText('• Mobile phones, smartwatches, and programmable calculators are strictly prohibited.', 40, 415);
  ctx.fillText('• Chief Invigilator: Prof. Vikram Iyer · Active Live Hall Inspection', 40, 450);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface SeatedStudentAnimRefs {
  deskNumber: string;
  rightArm: THREE.Mesh;
  head: THREE.Mesh;
  handBaseX: number;
}

export const ThreeExamHallPlanner: React.FC<ThreeExamHallPlannerProps> = ({
  exams,
  hallTickets,
  userRole,
  onVerifyToken,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedDesk, setSelectedDesk] = useState<DeskData | null>(null);
  const [hoveredDesk, setHoveredDesk] = useState<DeskData | null>(null);
  const [searchRoll, setSearchRoll] = useState('');
  const [viewMode, setViewMode] = useState<'3d' | 'table'>('3d');
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<'overview' | 'candidate' | 'proctor'>('overview');
  const [remainingSeconds, setRemainingSeconds] = useState(5820);
  const [isAisleTourRunning, setIsAisleTourRunning] = useState(false);

  // 24 Desks
  const desks: DeskData[] = useMemo(() => {
    const list: DeskData[] = [];
    const primaryStudent = hallTickets[0];

    for (let r = 1; r <= 4; r++) {
      for (let c = 1; c <= 6; c++) {
        const deskNum = `D-${r}${c}`;
        if (r === 2 && c === 3 && primaryStudent) {
          list.push({
            deskNumber: deskNum,
            row: r,
            col: c,
            status: 'Assigned',
            candidateName: primaryStudent.studentName,
            rollNumber: primaryStudent.rollNumber,
            courseCode: 'CS601 (Distributed Systems)',
            eligibility: 'Eligible (88.5% Attendance, Dues Cleared)',
            attendancePercent: 88.5,
            qrToken: primaryStudent.qrToken,
          });
        } else if ((r + c) % 2 === 0) {
          const roll = `CS-2024-${String(r * 20 + c).padStart(3, '0')}`;
          list.push({
            deskNumber: deskNum,
            row: r,
            col: c,
            status: 'Assigned',
            candidateName: `Candidate ${r * 10 + c}`,
            rollNumber: roll,
            courseCode: 'CS601 (Distributed Systems)',
            eligibility: 'Eligible (Attendance > 80%)',
            attendancePercent: 82 + ((r + c) % 15),
            qrToken: `CIQ-HT-${roll}-AUT2026`,
          });
        } else if (r === 4 && c === 6) {
          list.push({
            deskNumber: deskNum,
            row: r,
            col: c,
            status: 'Blocked',
            candidateName: 'Isolated Buffer Desk',
            rollNumber: 'N/A',
            courseCode: 'Reserved for Medical / Special Needs',
            eligibility: 'Buffer Space',
            attendancePercent: 0,
          });
        } else {
          list.push({
            deskNumber: deskNum,
            row: r,
            col: c,
            status: 'Available',
            candidateName: 'Unassigned Seat',
            rollNumber: 'Available',
            courseCode: 'LHC 302 General Pool',
            eligibility: 'Vacant for re-allocation',
            attendancePercent: 0,
          });
        }
      }
    }
    return list;
  }, [hallTickets]);

  useEffect(() => {
    if (!selectedDesk && desks.length > 0) {
      const myDesk = desks.find(d => d.deskNumber === 'D-23') || desks[0];
      setSelectedDesk(myDesk);
    }
  }, [desks, selectedDesk]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeRemaining = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(16, 18, 22));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  const isTransitioningCamera = useRef<boolean>(true);

  const deskGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const deskBadgesRef = useRef<Map<string, THREE.MeshStandardMaterial>>(new Map());
  const smartboardTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const clockMinuteHandRef = useRef<THREE.Mesh | null>(null);
  const haloRingRef = useRef<THREE.Mesh | null>(null);

  const seatedStudentsRef = useRef<SeatedStudentAnimRefs[]>([]);
  const proctorGroupRef = useRef<THREE.Group | null>(null);

  const hoveredDeskIdRef = useRef<string | null>(null);
  const tourAisleStepRef = useRef<number>(0);
  const tourAisleTimerRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current || viewMode !== '3d') return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.FogExp2(0x0f172a, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 120);
    camera.position.set(16, 18, 22);
    camera.lookAt(0, 1, 0);
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
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 50;
    controls.target.set(0, 1, 0);
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      isTransitioningCamera.current = false;
      setIsAisleTourRunning(false);
    });

    // 5. Studio PBR Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    keyLight.position.set(12, 24, 18);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0004;
    }
    scene.add(keyLight);

    const downlight = new THREE.PointLight(0xe0f2fe, 0.8, 30);
    downlight.position.set(0, 12, 0);
    scene.add(downlight);

    // 7. Hall Architecture
    const floorGeo = new THREE.PlaneGeometry(36, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(36, 18, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Front Wall
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 14),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 })
    );
    backWall.position.set(0, 7, -16);
    scene.add(backWall);

    // Front Stage Dais & Proctor Podium
    const stage = new THREE.Mesh(
      new THREE.BoxGeometry(28, 0.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.2 })
    );
    stage.position.set(0, 0.3, -13);
    stage.receiveShadow = true;
    stage.castShadow = true;
    scene.add(stage);

    const podium = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.2, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 })
    );
    podium.position.set(0, 1.7, -13);
    podium.castShadow = true;
    scene.add(podium);

    const monitor = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.5, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.8 })
    );
    monitor.position.set(0, 2.9, -13.2);
    monitor.rotation.x = -0.3;
    scene.add(monitor);

    // Smartboard
    const smartboardGeo = new THREE.PlaneGeometry(16, 7.5);
    const initialSbTexture = createSmartboardTexture(formatTimeRemaining(remainingSeconds));
    smartboardTextureRef.current = initialSbTexture;
    const smartboardMat = new THREE.MeshStandardMaterial({
      map: initialSbTexture,
      roughness: 0.3,
      metalness: 0.1
    });
    const smartboard = new THREE.Mesh(smartboardGeo, smartboardMat);
    smartboard.position.set(0, 8.2, -15.85);
    scene.add(smartboard);

    // Clock
    const clockGroup = new THREE.Group();
    clockGroup.position.set(11, 10, -15.8);

    const clockFrame = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 0.15, 24),
      new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.8, roughness: 0.2 })
    );
    clockFrame.rotation.x = Math.PI / 2;
    clockGroup.add(clockFrame);

    const clockFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.9, 24),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    clockFace.position.z = 0.08;
    clockGroup.add(clockFace);

    const minuteHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.7, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    minuteHand.position.set(0, 0.3, 0.09);
    clockGroup.add(minuteHand);
    clockMinuteHandRef.current = minuteHand;

    scene.add(clockGroup);

    // 8. Composite Desks with Seated Examinee Avatars
    const shadowTex = createRadialShadowTexture();
    deskGroupsRef.current.clear();
    deskBadgesRef.current.clear();
    seatedStudentsRef.current = [];

    const legMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.25 });
    const woodTopMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5, metalness: 0.1 });
    const chairSeatMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const penMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });

    const studentColors = [0x0284c7, 0x047857, 0xd97706, 0x7c3aed, 0x0d9488, 0xef4444];

    desks.forEach((desk, dIdx) => {
      const deskGroup = new THREE.Group();
      const posX = (desk.col - 3.5) * 4.4;
      const posZ = -6 + (desk.row - 1) * 4.6;
      deskGroup.position.set(posX, 0, posZ);
      deskGroup.userData = { deskNumber: desk.deskNumber, data: desk, baseY: 0 };

      // Ground Shadow
      const shadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(3.2, 2.2),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.5, depthWrite: false })
      );
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.y = 0.012;
      deskGroup.add(shadowMesh);

      // Frame Legs
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8);
      [[-1.1, 0.7, -0.45], [1.1, 0.7, -0.45], [-1.1, 0.7, 0.45], [1.1, 0.7, 0.45]].forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, ly, lz);
        leg.castShadow = true;
        deskGroup.add(leg);
      });

      // Desktop
      const topMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.1), woodTopMat);
      topMesh.position.y = 1.45;
      topMesh.castShadow = true;
      topMesh.receiveShadow = true;
      topMesh.userData = { deskNumber: desk.deskNumber, data: desk };
      deskGroup.add(topMesh);

      // Exam Question Paper & Answer Booklet on Desk
      const examPaper = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.75), paperMat);
      examPaper.rotation.x = -Math.PI / 2;
      examPaper.position.set(-0.25, 1.51, 0.05);
      deskGroup.add(examPaper);

      // Modesty Divider
      const dividerColor =
        desk.status === 'Assigned' ? 0x059669 : desk.status === 'Blocked' ? 0xef4444 : 0x64748b;
      const divider = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.6, 0.04),
        new THREE.MeshStandardMaterial({ color: dividerColor, roughness: 0.4, metalness: 0.2 })
      );
      divider.position.set(0, 1.7, -0.5);
      divider.castShadow = true;
      deskGroup.add(divider);

      // Candidate Badge Plate
      const badgeMat = new THREE.MeshStandardMaterial({
        color: desk.status === 'Assigned' ? 0x10b981 : 0x94a3b8,
        emissive: desk.status === 'Assigned' ? 0x047857 : 0x000000,
        emissiveIntensity: 0.4
      });
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.3), badgeMat);
      badge.position.set(0.9, 1.51, 0.35);
      deskGroup.add(badge);
      deskBadgesRef.current.set(desk.deskNumber, badgeMat);

      // Student Chair
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, 0.85);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), legMat);
      stem.position.y = 0.45;
      chairGroup.add(stem);

      const seatPan = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.8), chairSeatMat);
      seatPan.position.y = 0.9;
      seatPan.castShadow = true;
      chairGroup.add(seatPan);

      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.7, 0.06), chairSeatMat);
      backrest.position.set(0, 1.4, 0.38);
      backrest.castShadow = true;
      chairGroup.add(backrest);

      deskGroup.add(chairGroup);

      // SEATED 3D EXAMINEE AVATAR (For Assigned Desks)
      if (desk.status === 'Assigned') {
        const studentGrp = new THREE.Group();
        studentGrp.position.set(0, 0, 0.65); // Sitting in the chair

        const shirtCol = desk.deskNumber === 'D-23' ? 0x047857 : studentColors[dIdx % studentColors.length];
        const studentShirtMat = new THREE.MeshStandardMaterial({ color: shirtCol, roughness: 0.5 });
        const studentSkinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });
        const studentPantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

        // Seated Legs (Bent forward under desk)
        const upperLegGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.65, 8);
        const lLeg = new THREE.Mesh(upperLegGeo, studentPantsMat);
        lLeg.rotation.x = Math.PI / 2;
        lLeg.position.set(-0.2, 0.95, -0.25);
        studentGrp.add(lLeg);

        const rLeg = new THREE.Mesh(upperLegGeo, studentPantsMat);
        rLeg.rotation.x = Math.PI / 2;
        rLeg.position.set(0.2, 0.95, -0.25);
        studentGrp.add(rLeg);

        // Seated Torso (Angled slightly forward toward paper)
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.3), studentShirtMat);
        torso.position.set(0, 1.35, 0);
        torso.rotation.x = 0.18;
        torso.castShadow = true;
        studentGrp.add(torso);

        // Head looking down at exam paper
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), studentSkinMat);
        head.position.set(0, 1.82, -0.08);
        head.rotation.x = 0.32;
        head.castShadow = true;
        studentGrp.add(head);

        const hair = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.8), legMat);
        hair.position.set(0, 1.85, -0.08);
        studentGrp.add(hair);

        // Left Arm resting on desk holding answer sheet down
        const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.55, 8);
        const leftArm = new THREE.Mesh(armGeo, studentShirtMat);
        leftArm.position.set(-0.35, 1.38, -0.22);
        leftArm.rotation.x = -Math.PI / 3;
        leftArm.rotation.z = 0.25;
        studentGrp.add(leftArm);

        // Right Arm actively writing with pen
        const rightArm = new THREE.Mesh(armGeo, studentShirtMat);
        rightArm.position.set(0.28, 1.38, -0.22);
        rightArm.rotation.x = -Math.PI / 3;
        rightArm.rotation.z = -0.2;
        studentGrp.add(rightArm);

        // Pen in Right Hand
        const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 6), penMat);
        pen.rotation.x = Math.PI / 4;
        pen.position.set(0.02, -0.28, 0.1);
        rightArm.add(pen);

        deskGroup.add(studentGrp);

        seatedStudentsRef.current.push({
          deskNumber: desk.deskNumber,
          rightArm,
          head,
          handBaseX: 0.28
        });
      }

      scene.add(deskGroup);
      deskGroupsRef.current.set(desk.deskNumber, deskGroup);
    });

    // 9. CHIEF PROCTOR / INVIGILATOR PACING DOWN CENTER AISLE
    const proctor = new THREE.Group();
    proctor.position.set(0, 0, 0);

    const proctorSuitMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.4 }); // Dark navy formal suit
    const proctorShirtMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const proctorSkinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });

    // Torso
    const pTorso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.72, 0.32), proctorSuitMat);
    pTorso.position.y = 1.05;
    pTorso.castShadow = true;
    proctor.add(pTorso);

    // Head
    const pHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), proctorSkinMat);
    pHead.position.y = 1.58;
    pHead.castShadow = true;
    proctor.add(pHead);

    const pHair = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 1.8), new THREE.MeshStandardMaterial({ color: 0x475569 }));
    pHair.position.y = 1.62;
    proctor.add(pHair);

    // Legs
    const pLegGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
    const pLeftLeg = new THREE.Mesh(pLegGeo, proctorSuitMat);
    pLeftLeg.position.set(-0.16, 0.35, 0);
    proctor.add(pLeftLeg);

    const pRightLeg = new THREE.Mesh(pLegGeo, proctorSuitMat);
    pRightLeg.position.set(0.16, 0.35, 0);
    proctor.add(pRightLeg);

    // Arms with Invigilation Clipboard
    const pArmGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.6, 8);
    const pLeftArm = new THREE.Mesh(pArmGeo, proctorSuitMat);
    pLeftArm.position.set(-0.35, 1.02, 0);
    proctor.add(pLeftArm);

    const pRightArm = new THREE.Mesh(pArmGeo, proctorSuitMat);
    pRightArm.position.set(0.35, 1.02, 0);
    pRightArm.rotation.x = -Math.PI / 4;
    proctor.add(pRightArm);

    // Clipboard
    const clipboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.45, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 })
    );
    clipboard.position.set(0.2, 0.85, 0.35);
    clipboard.rotation.x = Math.PI / 6;
    proctor.add(clipboard);

    proctor.userData = { isProctor: true, name: 'Prof. Vikram Iyer (Chief Invigilator)' };
    scene.add(proctor);
    proctorGroupRef.current = proctor;

    // 10. Selection Halo Ring
    const haloMesh = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 1.9, 32),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    haloMesh.rotation.x = -Math.PI / 2;
    haloMesh.position.set(0, 0.03, 0);
    scene.add(haloMesh);
    haloRingRef.current = haloMesh;

    // 11. Pointer & Click Handlers
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      _scratchMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _scratchMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _scratchRaycaster.setFromCamera(_scratchMouse, camera);

      const hitCandidates: THREE.Object3D[] = [];
      deskGroupsRef.current.forEach(grp => {
        grp.traverse(child => {
          if ((child as THREE.Mesh).isMesh && child.userData?.deskNumber) {
            hitCandidates.push(child);
          }
        });
      });

      const intersects = _scratchRaycaster.intersectObjects(hitCandidates, false);
      if (intersects.length > 0) {
        const deskNum = intersects[0].object.userData.deskNumber;
        const matched = desks.find(d => d.deskNumber === deskNum);
        hoveredDeskIdRef.current = deskNum;
        setHoveredDesk(matched || null);
        container.style.cursor = 'pointer';
      } else {
        hoveredDeskIdRef.current = null;
        setHoveredDesk(null);
        container.style.cursor = 'grab';
      }
    };

    const handlePointerClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      _scratchMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _scratchMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _scratchRaycaster.setFromCamera(_scratchMouse, camera);

      const hitCandidates: THREE.Object3D[] = [];
      deskGroupsRef.current.forEach(grp => {
        grp.traverse(child => {
          if ((child as THREE.Mesh).isMesh && child.userData?.deskNumber) {
            hitCandidates.push(child);
          }
        });
      });

      const intersects = _scratchRaycaster.intersectObjects(hitCandidates, false);
      if (intersects.length > 0) {
        const deskNum = intersects[0].object.userData.deskNumber;
        const matched = desks.find(d => d.deskNumber === deskNum);
        if (matched) {
          focusDesk(matched);
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handlePointerClick);

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth || 800;
      const h = mountRef.current.clientHeight || 560;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 12. Damped Render Loop with Seated Writing Animation & Proctor Pacing
    let animationFrameId: number;
    let proctorZ = -4;
    let proctorDirection = 1;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Camera Glide
      if (isTransitioningCamera.current) {
        camera.position.lerp(targetCameraPos.current, 0.06);
        controls.target.lerp(targetLookAt.current, 0.06);

        if (camera.position.distanceTo(targetCameraPos.current) < 0.1) {
          isTransitioningCamera.current = false;
        }
      }

      controls.update();

      // Aisle Tour
      if (isAisleTourRunning) {
        tourAisleTimerRef.current += delta;
        if (tourAisleTimerRef.current > 3.8) {
          tourAisleTimerRef.current = 0;
          tourAisleStepRef.current = (tourAisleStepRef.current + 1) % desks.length;
          const nextDesk = desks[tourAisleStepRef.current];
          focusDesk(nextDesk);
        }
      }

      // ANIMATE SEATED STUDENTS WRITING EXAMS
      seatedStudentsRef.current.forEach((st, idx) => {
        // Hand writing strokes across paper
        const writeOsc = Math.sin(elapsed * 5.0 + idx * 1.7);
        st.rightArm.rotation.z = -0.2 + writeOsc * 0.08;
        st.rightArm.rotation.x = -Math.PI / 3 + Math.cos(elapsed * 4.0 + idx) * 0.04;

        // Head subtle thinking bobbing
        st.head.rotation.x = 0.32 + Math.sin(elapsed * 1.5 + idx) * 0.03;
      });

      // ANIMATE CHIEF PROCTOR PACING DOWN CENTER AISLE
      if (proctorGroupRef.current) {
        proctorZ += proctorDirection * delta * 1.2;
        if (proctorZ > 8) {
          proctorDirection = -1;
          proctorGroupRef.current.rotation.y = Math.PI;
        } else if (proctorZ < -8) {
          proctorDirection = 1;
          proctorGroupRef.current.rotation.y = 0;
        }
        proctorGroupRef.current.position.set(0, 0, proctorZ);

        // Proctor head scanning left and right at examinees
        const pHead = proctorGroupRef.current.children[1];
        if (pHead) {
          pHead.rotation.y = Math.sin(elapsed * 2.0) * 0.45;
        }
      }

      // Interactive Desk Hover Elevation
      deskGroupsRef.current.forEach((grp, deskNum) => {
        const isHovered = hoveredDeskIdRef.current === deskNum;
        const targetLift = isHovered ? 0.18 : 0;
        grp.position.y = THREE.MathUtils.damp(grp.position.y, targetLift, 10, delta);

        const badgeMat = deskBadgesRef.current.get(deskNum);
        if (badgeMat) {
          const targetGlow = isHovered ? 1.2 : 0.4;
          badgeMat.emissiveIntensity = THREE.MathUtils.damp(badgeMat.emissiveIntensity, targetGlow, 8, delta);
        }
      });

      // Analog Clock Minute Hand
      if (clockMinuteHandRef.current) {
        clockMinuteHandRef.current.rotation.z = -elapsed * 0.05;
      }

      // Selection Halo Pulse
      if (haloRingRef.current) {
        const pulse = 1 + Math.sin(elapsed * 4) * 0.06;
        haloRingRef.current.scale.set(pulse, pulse, 1);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handlePointerClick);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [viewMode, desks, isAisleTourRunning]);

  useEffect(() => {
    if (smartboardTextureRef.current) {
      const updated = createSmartboardTexture(formatTimeRemaining(remainingSeconds));
      smartboardTextureRef.current.image = updated.image;
      smartboardTextureRef.current.needsUpdate = true;
    }
  }, [remainingSeconds]);

  const focusDesk = (desk: DeskData) => {
    setSelectedDesk(desk);
    const grp = deskGroupsRef.current.get(desk.deskNumber);
    if (grp) {
      const { x, z } = grp.position;
      if (haloRingRef.current) {
        haloRingRef.current.position.set(x, 0.03, z);
      }

      targetCameraPos.current.set(x + 3.8, 4.8, z + 5.2);
      targetLookAt.current.set(x, 1.4, z);
      isTransitioningCamera.current = true;
      setCameraPreset('overview');
    }
  };

  const setPerspective = (preset: 'overview' | 'candidate' | 'proctor') => {
    setCameraPreset(preset);
    setIsAisleTourRunning(false);

    if (preset === 'overview') {
      targetCameraPos.current.set(16, 18, 22);
      targetLookAt.current.set(0, 1, 0);
    } else if (preset === 'candidate') {
      const myDesk = desks.find(d => d.deskNumber === 'D-23');
      const grp = myDesk ? deskGroupsRef.current.get(myDesk.deskNumber) : null;
      if (grp) {
        targetCameraPos.current.set(grp.position.x, 2.1, grp.position.z + 0.8);
        targetLookAt.current.set(grp.position.x, 3.5, -16);
      }
    } else if (preset === 'proctor') {
      targetCameraPos.current.set(0, 4.2, -12);
      targetLookAt.current.set(0, 1.5, 6);
    }
    isTransitioningCamera.current = true;
  };

  const toggleAisleTour = () => {
    const next = !isAisleTourRunning;
    setIsAisleTourRunning(next);
    if (next) {
      tourAisleTimerRef.current = 0;
      focusDesk(desks[tourAisleStepRef.current]);
    }
  };

  const handleSearchRoll = (query: string) => {
    setSearchRoll(query);
    if (!query.trim()) return;
    const q = query.toLowerCase();
    const matched = desks.find(
      d => d.rollNumber?.toLowerCase().includes(q) || d.candidateName?.toLowerCase().includes(q) || d.deskNumber.toLowerCase().includes(q)
    );
    if (matched) {
      focusDesk(matched);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 leading-tight">3D Examination Hall & Seating Grid</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Examinees & Proctor
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Interactive 3D exam room featuring students actively writing, proctor patrolling aisles, and live countdown timer.
            </p>
          </div>
        </div>

        {/* Search, Tour, & Perspective Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Roll (e.g. 089) or Desk..."
              value={searchRoll}
              onChange={e => handleSearchRoll(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 w-48 sm:w-56"
            />
          </div>

          <button
            onClick={toggleAisleTour}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isAisleTourRunning
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs animate-pulse'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200 shadow-2xs'
            }`}
            title="Automated walkthrough inspection across all examination desks"
          >
            {isAisleTourRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-700" />}
            <span>{isAisleTourRunning ? 'Walkthrough On' : 'Aisle Walkthrough'}</span>
          </button>

          <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setPerspective('overview')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                cameraPreset === 'overview' ? 'bg-white shadow-xs text-emerald-800' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setPerspective('candidate')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                cameraPreset === 'candidate' ? 'bg-white shadow-xs text-emerald-800' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="First-Person Candidate POV from Desk D-23"
            >
              <Eye className="w-3 h-3 text-emerald-700" />
              <span>Candidate POV</span>
            </button>
            <button
              onClick={() => setPerspective('proctor')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                cameraPreset === 'proctor' ? 'bg-white shadow-xs text-amber-700' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Superintendent Podium View"
            >
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              <span>Proctor Dais</span>
            </button>
          </div>

          <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === '3d' ? 'bg-white shadow-xs text-emerald-800' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              3D Hall
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white shadow-xs text-emerald-800' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Table Grid
            </button>
          </div>
        </div>
      </div>

      {/* 3D Viewport with Seated Students & Active Writing */}
      {viewMode === '3d' ? (
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-950">
          <div
            ref={mountRef}
            className="w-full h-[580px] cursor-grab active:cursor-grabbing select-none"
          />

          {/* Exam Status Badge */}
          <div className="absolute top-4 left-4 bg-stone-900/95 text-stone-100 px-3.5 py-2.5 rounded-xl border border-stone-700/80 shadow-lg text-xs z-10 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>CS601 Final Examination</span>
                <span className="font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded text-[11px] border border-amber-800/60">
                  {formatTimeRemaining(remainingSeconds)}
                </span>
              </div>
              <span className="text-[10px] text-stone-400">Hall: LHC-302 · Examinees Writing · Invigilator Active</span>
            </div>
          </div>

          {/* Hover Desk Indicator HUD */}
          {hoveredDesk && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-stone-900/95 text-stone-100 px-4 py-2 rounded-xl border border-stone-700 shadow-xl text-xs z-10 flex items-center gap-2.5 pointer-events-none animate-in fade-in duration-150">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  hoveredDesk.status === 'Assigned'
                    ? 'bg-emerald-400'
                    : hoveredDesk.status === 'Blocked'
                    ? 'bg-rose-400'
                    : 'bg-stone-400'
                }`}
              />
              <span className="font-mono font-bold text-emerald-400">{hoveredDesk.deskNumber}</span>
              <span className="text-stone-300 font-medium">{hoveredDesk.candidateName}</span>
              <span className="text-stone-400 font-mono text-[11px]">({hoveredDesk.rollNumber})</span>
            </div>
          )}

          {/* Top-Right Quick Reset */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setPerspective('overview')}
              className="px-3 py-1.5 bg-stone-900/90 hover:bg-stone-800 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Reset Angle</span>
            </button>
          </div>

          {/* Collapsible Bottom Inspection Dock */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-20">
            <div className="bg-stone-900/95 text-stone-100 rounded-2xl border border-stone-700/80 shadow-2xl overflow-hidden transition-all duration-200">
              <div className="px-4 py-2.5 flex items-center justify-between border-b border-stone-800 bg-stone-950/60">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      selectedDesk?.status === 'Assigned'
                        ? 'bg-emerald-400'
                        : selectedDesk?.status === 'Blocked'
                        ? 'bg-rose-400'
                        : 'bg-stone-400'
                    }`}
                  />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {selectedDesk ? `Desk ${selectedDesk.deskNumber}` : 'Select a Desk in 3D'}
                  </span>
                  {selectedDesk && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        selectedDesk.status === 'Assigned'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : selectedDesk.status === 'Blocked'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                          : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {selectedDesk.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedDesk?.qrToken && (
                    <button
                      onClick={() => onVerifyToken(selectedDesk.qrToken!)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-3 h-3" />
                      <span>Verify Hall Ticket QR</span>
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

              {!dockCollapsed && selectedDesk && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-bold text-white text-sm">{selectedDesk.candidateName}</span>
                      <span className="text-stone-400 font-mono text-xs">({selectedDesk.rollNumber})</span>
                    </div>
                    <p className="text-stone-300 text-xs">{selectedDesk.courseCode}</p>
                    <p className="text-stone-400 text-[11px]">{selectedDesk.eligibility}</p>
                  </div>

                  <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Attendance:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {selectedDesk.attendancePercent ? `${selectedDesk.attendancePercent}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Row / Column:</span>
                      <span className="font-mono font-bold text-stone-200">
                        Row {selectedDesk.row}, Col {selectedDesk.col}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-stone-400">Biometric Audit:</span>
                      <span className="text-emerald-400 font-medium">Cleared</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Accessible 2D Table Grid */
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
              <span>Full Seating Manifest (2D Accessible Grid)</span>
            </h3>
            <button
              onClick={() => window.print()}
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Manifest</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-100 text-stone-600 font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Desk</th>
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Roll Number</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {desks.map(d => (
                  <tr key={d.deskNumber} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-900">{d.deskNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-stone-900">{d.candidateName}</td>
                    <td className="py-2.5 px-3 font-mono text-stone-600">{d.rollNumber}</td>
                    <td className="py-2.5 px-3 text-stone-600">{d.courseCode}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          d.status === 'Assigned'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'Blocked'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {d.qrToken ? (
                        <button
                          onClick={() => onVerifyToken(d.qrToken!)}
                          className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-[11px] font-semibold shadow-2xs"
                        >
                          Verify QR
                        </button>
                      ) : (
                        <span className="text-stone-400 text-[11px]">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

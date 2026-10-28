/**
 * CampusIQ Pro — 3D Library & Laboratory Explorer
 * Upgraded with animated 3D student characters:
 * - Student browsing bookshelf stacks reaching up and taking books
 * - Student at RFID self-checkout kiosk scanning digital ID QR code with animated laser scan fan
 * - Student seated at study desk reading textbook under banker's lamp
 * - Student researchers in lab coats operating precision instruments, test probes, and robotic workcells
 * - Damped OrbitControls, live oscilloscope waveform, and collapsible inspection dock
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  BookOpen,
  Cpu,
  RotateCcw,
  Search,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Activity,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
  Pause,
  Video,
  UserCheck
} from 'lucide-react';
import { LibraryBook, LabEquipment } from '../types/campus';
import { NavTab } from '../components/Sidebar';

interface ThreeLibraryExplorerProps {
  books: LibraryBook[];
  equipment: LabEquipment[];
  onNavigate: (tab: NavTab) => void;
  onVerifyToken: (token: string) => void;
}

const _scratchRaycaster = new THREE.Raycaster();
const _scratchMouse = new THREE.Vector2();

function createOscilloscopeTexture(phase: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#062816';
  ctx.fillRect(0, 0, 256, 160);

  ctx.strokeStyle = '#0d5c31';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 160);
    ctx.stroke();
  }
  for (let y = 0; y <= 160; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#4ade80';
  ctx.shadowBlur = 6;
  ctx.beginPath();

  for (let x = 0; x < 256; x++) {
    const y = 80 + Math.sin((x / 24) + phase) * 36 + Math.sin((x / 8) + phase * 2) * 8;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#86efac';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('CH1: 2.50V / DIV', 12, 22);
  ctx.fillText('FREQ: 12.45 MHz', 130, 22);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createBookSpineTexture(title: string, color: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 64, 256);

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 16, 64, 6);
  ctx.fillRect(0, 234, 64, 6);

  ctx.save();
  ctx.translate(36, 128);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title.length > 18 ? title.slice(0, 18) + '...' : title, 0, 0);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const ThreeLibraryExplorer: React.FC<ThreeLibraryExplorerProps> = ({
  books,
  equipment,
  onNavigate,
  onVerifyToken,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeMode, setActiveMode] = useState<'library' | 'lab'>('library');
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(books[0] || null);
  const [selectedEquip, setSelectedEquip] = useState<LabEquipment | null>(equipment[0] || null);
  const [hoveredItem, setHoveredItem] = useState<{ id: string; name: string; info: string } | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [isShowcaseRunning, setIsShowcaseRunning] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(12, 14, 16));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 2, 0));
  const isTransitioningCamera = useRef<boolean>(true);

  const haloRingRef = useRef<THREE.Mesh | null>(null);
  const interactiveGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const hoveredIdRef = useRef<string | null>(null);

  // Student animation references
  const bookReachArmRef = useRef<THREE.Mesh | null>(null);
  const bookInHandRef = useRef<THREE.Mesh | null>(null);
  const qrKioskLaserRef = useRef<THREE.Mesh | null>(null);
  const labTechProbeArmRef = useRef<THREE.Mesh | null>(null);

  // Lab animation references
  const robotForearmRef = useRef<THREE.Group | null>(null);
  const robotTurretRef = useRef<THREE.Group | null>(null);
  const oscilloscopeMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  const showcaseIndexRef = useRef<number>(0);
  const showcaseTimerRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const bgCol = activeMode === 'library' ? 0x0f172a : 0x090d16;
    scene.background = new THREE.Color(bgCol);
    scene.fog = new THREE.FogExp2(bgCol, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 100);
    camera.position.set(12, 14, 16);
    camera.lookAt(0, 2, 0);
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
    controls.minDistance = 4;
    controls.maxDistance = 40;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      isTransitioningCamera.current = false;
      setIsShowcaseRunning(false);
    });

    // 5. Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    keyLight.position.set(10, 20, 15);
    keyLight.castShadow = !isSoftwareGl;
    scene.add(keyLight);

    const spotLight = new THREE.PointLight(activeMode === 'library' ? 0xfef08a : 0x38bdf8, 1.0, 30);
    spotLight.position.set(0, 10, 0);
    scene.add(spotLight);

    // 7. Flooring
    const floorGeo = new THREE.PlaneGeometry(32, 28);
    const floorMat = new THREE.MeshStandardMaterial({
      color: activeMode === 'library' ? 0x1e293b : 0x0f172a,
      roughness: 0.6,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(32, 16, 0x334155, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // 8. Ground Selection Halo Ring
    const haloMesh = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 2.6, 32),
      new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    haloMesh.rotation.x = -Math.PI / 2;
    haloMesh.position.set(0, 0.03, 0);
    scene.add(haloMesh);
    haloRingRef.current = haloMesh;

    interactiveGroupsRef.current.clear();

    if (activeMode === 'library') {
      // ==========================================
      // 3D LIBRARY MODE
      // ==========================================
      const shelfColors = ['#047857', '#1d4ed8', '#b91c1c', '#7c3aed', '#b45309'];
      const shelfPositions: [number, number, LibraryBook][] = [
        [-6, -4, books[0]],
        [6, -4, books[1] || books[0]],
        [-6, 4, books[2] || books[0]],
        [6, 4, books[3] || books[1] || books[0]]
      ];

      shelfPositions.forEach(([sx, sz, book]) => {
        const shelfGroup = new THREE.Group();
        shelfGroup.position.set(sx, 0, sz);
        shelfGroup.userData = { id: book.id, book, baseY: 0, title: book.title, info: `${book.availableCopies} available` };

        const frameMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
        const sideGableGeo = new THREE.BoxGeometry(0.2, 5.0, 1.4);

        const leftGable = new THREE.Mesh(sideGableGeo, frameMat);
        leftGable.position.set(-2.4, 2.5, 0);
        leftGable.castShadow = true;
        shelfGroup.add(leftGable);

        const rightGable = new THREE.Mesh(sideGableGeo, frameMat);
        rightGable.position.set(2.4, 2.5, 0);
        rightGable.castShadow = true;
        shelfGroup.add(rightGable);

        const plankGeo = new THREE.BoxGeometry(4.8, 0.12, 1.4);
        for (let i = 0; i <= 3; i++) {
          const plank = new THREE.Mesh(plankGeo, frameMat);
          plank.position.set(0, 0.6 + i * 1.3, 0);
          plank.castShadow = true;
          shelfGroup.add(plank);

          const booksPerShelf = 8;
          for (let b = 0; b < booksPerShelf; b++) {
            const bColor = shelfColors[(i * 3 + b) % shelfColors.length];
            const spineTexture = createBookSpineTexture(book.title, bColor);
            const bookMat = new THREE.MeshStandardMaterial({ map: spineTexture, roughness: 0.4 });
            const bookWidth = 0.45;
            const bookHeight = 1.0 + (b % 3) * 0.1;
            const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(bookWidth, bookHeight, 1.0), bookMat);
            const bx = -2.0 + b * 0.55;
            bookMesh.position.set(bx, 0.6 + i * 1.3 + bookHeight / 2 + 0.06, 0);
            bookMesh.castShadow = true;
            bookMesh.userData = { id: book.id, book };
            shelfGroup.add(bookMesh);
          }
        }

        const placardMat = new THREE.MeshStandardMaterial({ color: 0x059669, emissive: 0x064e3b, emissiveIntensity: 0.5 });
        const placard = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.4, 0.08), placardMat);
        placard.position.set(0, 5.2, 0.7);
        shelfGroup.add(placard);

        scene.add(shelfGroup);
        interactiveGroupsRef.current.set(book.id, shelfGroup);
      });

      // Study Table with Banker's Reading Lamp
      const tableGroup = new THREE.Group();
      tableGroup.position.set(0, 0, 0);

      const tableTop = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 0.14, 2.4),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 })
      );
      tableTop.position.y = 1.6;
      tableTop.castShadow = true;
      tableGroup.add(tableTop);

      const lampBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 0.08, 16),
        new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 })
      );
      lampBase.position.set(0, 1.7, 0);
      tableGroup.add(lampBase);

      const lampShade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.4, 0.3, 16),
        new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3, emissive: 0x15803d, emissiveIntensity: 0.6 })
      );
      lampShade.position.set(0, 2.2, 0);
      tableGroup.add(lampShade);

      // Open Book on Study Desk
      const openBook = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.04, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
      );
      openBook.position.set(-0.8, 1.7, 0.2);
      openBook.rotation.y = 0.2;
      tableGroup.add(openBook);

      // Student Seated at Table Reading
      const readerStudent = new THREE.Group();
      readerStudent.position.set(-0.8, 0, 1.1);

      const studentShirtMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.5 });
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });

      const rTorso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.3), studentShirtMat);
      rTorso.position.set(0, 1.35, 0);
      rTorso.rotation.x = 0.2;
      readerStudent.add(rTorso);

      const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), skinMat);
      rHead.position.set(0, 1.82, -0.06);
      rHead.rotation.x = 0.35;
      readerStudent.add(rHead);

      scene.add(readerStudent);
      scene.add(tableGroup);

      // STUDENT 1: BROWSING BOOKSHELF & TAKING A BOOK
      const browsingStudent = new THREE.Group();
      browsingStudent.position.set(-6, 0, -2.4);
      browsingStudent.rotation.y = Math.PI; // Facing shelf

      const bTorso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.3), new THREE.MeshStandardMaterial({ color: 0x2563eb }));
      bTorso.position.y = 0.95;
      browsingStudent.add(bTorso);

      const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), skinMat);
      bHead.position.y = 1.45;
      browsingStudent.add(bHead);

      // Right arm reaching up to pull a book
      const reachArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.065, 0.65, 8),
        new THREE.MeshStandardMaterial({ color: 0x2563eb })
      );
      reachArm.position.set(0.35, 1.15, -0.2);
      reachArm.rotation.x = -Math.PI / 2.5; // Reaching up
      browsingStudent.add(reachArm);
      bookReachArmRef.current = reachArm;

      // Book being pulled from shelf
      const pulledBook = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.35, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 })
      );
      pulledBook.position.set(0.35, 1.45, -0.45);
      browsingStudent.add(pulledBook);
      bookInHandRef.current = pulledBook;

      browsingStudent.userData = { isStudent: true, name: 'Student Aarav', activity: 'Taking Computer Architecture textbook' };
      scene.add(browsingStudent);

      // STUDENT 2: RFID SELF-CHECKOUT DESK SCANNING DIGITAL QR CODE
      const checkoutKiosk = new THREE.Group();
      checkoutKiosk.position.set(0, 0, -8);

      const kioskDesk = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 1.2, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
      );
      kioskDesk.position.y = 0.6;
      checkoutKiosk.add(kioskDesk);

      // Touchscreen Monitor
      const kioskMonitor = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.6, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.8 })
      );
      kioskMonitor.position.set(0, 1.5, -0.2);
      kioskMonitor.rotation.x = -0.25;
      checkoutKiosk.add(kioskMonitor);

      // Optical Laser Scan Fan (Pulsing Green)
      const scanLaser = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.5),
        new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide, transparent: true, opacity: 0.75 })
      );
      scanLaser.position.set(0, 1.25, 0.2);
      scanLaser.rotation.x = Math.PI / 4;
      checkoutKiosk.add(scanLaser);
      qrKioskLaserRef.current = scanLaser;

      // Student scanning QR ID card at kiosk
      const scanningStudent = new THREE.Group();
      scanningStudent.position.set(0, 0, -6.6); // Facing kiosk
      scanningStudent.rotation.y = 0;

      const scTorso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.3), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
      scTorso.position.y = 0.95;
      scanningStudent.add(scTorso);

      const scHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), skinMat);
      scHead.position.y = 1.45;
      scanningStudent.add(scHead);

      // Right arm holding card under scanner
      const scArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.55, 8), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
      scArm.position.set(0.2, 1.1, -0.25);
      scArm.rotation.x = -Math.PI / 3;
      scanningStudent.add(scArm);

      // ID Card with QR
      const idCard = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.01, 0.22), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      idCard.position.set(0.2, 1.25, -0.45);
      scanningStudent.add(idCard);

      scanningStudent.userData = { isStudent: true, name: 'Student Priya', activity: 'Scanning ID QR Code to Issue Book' };
      scene.add(scanningStudent);
      scene.add(checkoutKiosk);
    } else {
      // ==========================================
      // 3D LABORATORY MODE
      // ==========================================
      const equipPositions: [number, number, LabEquipment][] = [
        [-5, 0, equipment[0]],
        [5, 0, equipment[1] || equipment[0]],
      ];

      equipPositions.forEach(([ex, ez, item]) => {
        const benchGroup = new THREE.Group();
        benchGroup.position.set(ex, 0, ez);
        benchGroup.userData = { id: item.id, item, baseY: 0, title: item.name, info: `Status: ${item.status}` };

        const benchTop = new THREE.Mesh(
          new THREE.BoxGeometry(5.6, 0.25, 3.2),
          new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.3 })
        );
        benchTop.position.y = 1.6;
        benchTop.castShadow = true;
        benchGroup.add(benchTop);

        const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 8);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
        [[-2.5, -1.3], [2.5, -1.3], [-2.5, 1.3], [2.5, 1.3]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(legGeo, legMat);
          leg.position.set(lx, 0.75, lz);
          leg.castShadow = true;
          benchGroup.add(leg);
        });

        if (item.name.toLowerCase().includes('robot') || item.category === 'Robotics') {
          // ROBOTIC ARM
          const robotBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.7, 0.4, 16),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 })
          );
          robotBase.position.set(0, 1.9, 0);
          benchGroup.add(robotBase);

          const turret = new THREE.Group();
          turret.position.set(0, 2.2, 0);
          robotTurretRef.current = turret;

          const shoulder = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.6, 0.6),
            new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.5, roughness: 0.3 })
          );
          turret.add(shoulder);

          const upperArm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.18, 1.4, 12),
            new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.7, roughness: 0.3 })
          );
          upperArm.position.set(0, 0.8, 0);
          turret.add(upperArm);

          const forearm = new THREE.Group();
          forearm.position.set(0, 1.6, 0);
          robotForearmRef.current = forearm;

          const elbow = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 12, 12),
            new THREE.MeshStandardMaterial({ color: 0x0f172a })
          );
          forearm.add(elbow);

          const forearmLink = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.14, 1.1, 12),
            new THREE.MeshStandardMaterial({ color: 0x059669, metalness: 0.7, roughness: 0.3 })
          );
          forearmLink.position.set(0, 0.6, 0.4);
          forearmLink.rotation.x = Math.PI / 4;
          forearm.add(forearmLink);

          const gripper = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.2, 0.1),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 })
          );
          gripper.position.set(0, 1.0, 0.8);
          forearm.add(gripper);

          benchGroup.add(turret);

          const tray = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.05, 0.8),
            new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.2 })
          );
          tray.position.set(1.4, 1.75, 0.5);
          benchGroup.add(tray);
        } else {
          // DIGITAL STORAGE OSCILLOSCOPE
          const dsoBody = new THREE.Mesh(
            new THREE.BoxGeometry(2.0, 1.3, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
          );
          dsoBody.position.set(0, 2.4, 0);
          dsoBody.castShadow = true;
          benchGroup.add(dsoBody);

          const initialOscTex = createOscilloscopeTexture(0);
          const screenMat = new THREE.MeshStandardMaterial({
            map: initialOscTex,
            roughness: 0.1,
            metalness: 0.1,
            emissive: 0x22c55e,
            emissiveIntensity: 0.3
          });
          oscilloscopeMatRef.current = screenMat;

          const dsoScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.9), screenMat);
          dsoScreen.position.set(-0.25, 2.45, 0.61);
          benchGroup.add(dsoScreen);

          const dialGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12);
          const dialMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 });
          [[0.65, 2.65], [0.65, 2.3], [0.65, 1.95]].forEach(([dx, dy]) => {
            const dial = new THREE.Mesh(dialGeo, dialMat);
            dial.rotation.x = Math.PI / 2;
            dial.position.set(dx, dy, 0.62);
            benchGroup.add(dial);
          });
        }

        scene.add(benchGroup);
        interactiveGroupsRef.current.set(item.id, benchGroup);
      });

      // STUDENT RESEARCHER IN WHITE LAB COAT
      const labTech = new THREE.Group();
      labTech.position.set(-5, 0, 2.2); // In front of robotic bench

      const coatMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 }); // White Lab Coat
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6 });

      const ltTorso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.32), coatMat);
      ltTorso.position.y = 1.05;
      labTech.add(ltTorso);

      const ltHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), skinMat);
      ltHead.position.y = 1.6;
      labTech.add(ltHead);

      // Arm with Test Probe
      const ltArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.6, 8), coatMat);
      ltArm.position.set(0.35, 1.1, -0.2);
      ltArm.rotation.x = -Math.PI / 3;
      labTech.add(ltArm);
      labTechProbeArmRef.current = ltArm;

      const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      probe.position.set(0.35, 1.25, -0.45);
      probe.rotation.x = Math.PI / 4;
      labTech.add(probe);

      labTech.userData = { isStudent: true, name: 'Student Researcher Aarav', activity: 'Testing Robotic Workcell Logic' };
      scene.add(labTech);
    }

    // 9. Pointer Raycasting Handlers
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      _scratchMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _scratchMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _scratchRaycaster.setFromCamera(_scratchMouse, camera);

      const hitCandidates: THREE.Object3D[] = [];
      interactiveGroupsRef.current.forEach(grp => {
        grp.traverse(child => {
          if ((child as THREE.Mesh).isMesh && (child.userData?.id || child.parent?.userData?.id)) {
            hitCandidates.push(child);
          }
        });
      });

      const intersects = _scratchRaycaster.intersectObjects(hitCandidates, false);
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        const matchedId = obj.userData?.id || obj.parent?.userData?.id;
        hoveredIdRef.current = matchedId;
        const grp = interactiveGroupsRef.current.get(matchedId);
        if (grp) {
          setHoveredItem({
            id: matchedId,
            name: grp.userData.title || 'Selected Asset',
            info: grp.userData.info || ''
          });
        }
        container.style.cursor = 'pointer';
      } else {
        hoveredIdRef.current = null;
        setHoveredItem(null);
        container.style.cursor = 'grab';
      }
    };

    const handlePointerClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      _scratchMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _scratchMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      _scratchRaycaster.setFromCamera(_scratchMouse, camera);

      const hitCandidates: THREE.Object3D[] = [];
      interactiveGroupsRef.current.forEach(grp => {
        grp.traverse(child => {
          if ((child as THREE.Mesh).isMesh && (child.userData?.id || child.parent?.userData?.id)) {
            hitCandidates.push(child);
          }
        });
      });

      const intersects = _scratchRaycaster.intersectObjects(hitCandidates, false);
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        const matchedId = obj.userData?.id || obj.parent?.userData?.id;
        if (activeMode === 'library') {
          const b = books.find(item => item.id === matchedId);
          if (b) focusItem(b.id, 'book');
        } else {
          const eq = equipment.find(item => item.id === matchedId);
          if (eq) focusItem(eq.id, 'equip');
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

    // 10. Damped Animation Loop with Student Book Taking & Probe Motions
    let animationFrameId: number;
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

      // Showcase Tour
      if (isShowcaseRunning) {
        showcaseTimerRef.current += delta;
        if (showcaseTimerRef.current > 4.2) {
          showcaseTimerRef.current = 0;
          const items = Array.from(interactiveGroupsRef.current.keys());
          showcaseIndexRef.current = (showcaseIndexRef.current + 1) % items.length;
          const nextId = items[showcaseIndexRef.current];
          if (activeMode === 'library') focusItem(nextId, 'book');
          else focusItem(nextId, 'equip');
        }
      }

      // ANIMATE STUDENT TAKING A BOOK OFF SHELF
      if (bookReachArmRef.current && bookInHandRef.current) {
        const reachCycle = Math.sin(elapsed * 2.0);
        bookReachArmRef.current.rotation.x = -Math.PI / 2.5 + reachCycle * 0.15;
        bookInHandRef.current.position.z = -0.45 + reachCycle * 0.12;
      }

      // ANIMATE RFID CHECKOUT KIOSK QR SCANNER LASER
      if (qrKioskLaserRef.current) {
        (qrKioskLaserRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(elapsed * 6) * 0.4;
      }

      // ANIMATE LAB RESEARCHER TEST PROBE
      if (labTechProbeArmRef.current) {
        labTechProbeArmRef.current.rotation.x = -Math.PI / 3 + Math.sin(elapsed * 3) * 0.08;
      }

      // Interactive Hover Elevation
      interactiveGroupsRef.current.forEach((grp, id) => {
        const isHovered = hoveredIdRef.current === id;
        const targetLift = isHovered ? 0.22 : 0;
        grp.position.y = THREE.MathUtils.damp(grp.position.y, targetLift, 10, delta);
      });

      // Lab Robotic Arm Articulation
      if (robotTurretRef.current) {
        robotTurretRef.current.rotation.y = Math.sin(elapsed * 1.2) * 0.45;
      }
      if (robotForearmRef.current) {
        robotForearmRef.current.rotation.x = Math.sin(elapsed * 2.0) * 0.25;
      }

      // Live Oscilloscope Waveform Update
      if (oscilloscopeMatRef.current && activeMode === 'lab') {
        const updatedTex = createOscilloscopeTexture(elapsed * 4);
        oscilloscopeMatRef.current.map = updatedTex;
        oscilloscopeMatRef.current.needsUpdate = true;
      }

      // Selection Halo Pulse
      if (haloRingRef.current) {
        const pulse = 1 + Math.sin(elapsed * 3.5) * 0.05;
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
  }, [activeMode, books, equipment, isShowcaseRunning]);

  const focusItem = (id: string, type: 'book' | 'equip') => {
    if (type === 'book') {
      const b = books.find(x => x.id === id);
      if (b) setSelectedBook(b);
    } else {
      const eq = equipment.find(x => x.id === id);
      if (eq) setSelectedEquip(eq);
    }

    const grp = interactiveGroupsRef.current.get(id);
    if (grp) {
      const { x, z } = grp.position;
      if (haloRingRef.current) {
        haloRingRef.current.position.set(x, 0.03, z);
      }
      targetCameraPos.current.set(x + 5.5, 6, z + 6.5);
      targetLookAt.current.set(x, 2, z);
      isTransitioningCamera.current = true;
    }
  };

  const resetCamera = () => {
    setIsShowcaseRunning(false);
    targetCameraPos.current.set(12, 14, 16);
    targetLookAt.current.set(0, 2, 0);
    isTransitioningCamera.current = true;
  };

  const toggleShowcase = () => {
    const next = !isShowcaseRunning;
    setIsShowcaseRunning(next);
    if (next) {
      showcaseTimerRef.current = 0;
      const items = Array.from(interactiveGroupsRef.current.keys());
      if (items.length > 0) {
        if (activeMode === 'library') focusItem(items[showcaseIndexRef.current], 'book');
        else focusItem(items[showcaseIndexRef.current], 'equip');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
            {activeMode === 'library' ? (
              <BookOpen className="w-5 h-5 text-emerald-300" />
            ) : (
              <Cpu className="w-5 h-5 text-emerald-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 leading-tight">
                {activeMode === 'library' ? '3D Digital Library Stacks' : '3D Mechatronics & VLSI Research Lab'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Student Activities
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {activeMode === 'library'
                ? 'Interactive 3D library featuring students browsing stacks, taking books, and scanning RFID QR passes at checkout.'
                : 'Interactive 3D lab featuring researchers operating oscilloscopes, articulated robotic arms, and electronic test probes.'}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleShowcase}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isShowcaseRunning
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs animate-pulse'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-200 shadow-2xs'
            }`}
            title="Automated tour showcasing books and lab instruments"
          >
            {isShowcaseRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-700" />}
            <span>{isShowcaseRunning ? 'Showcase On' : 'Showcase Tour'}</span>
          </button>

          <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              onClick={() => {
                setActiveMode('library');
                setIsShowcaseRunning(false);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                activeMode === 'library'
                  ? 'bg-white shadow-xs text-emerald-800'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Library</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('lab');
                setIsShowcaseRunning(false);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                activeMode === 'lab'
                  ? 'bg-white shadow-xs text-emerald-800'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Research Lab</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate(activeMode === 'library' ? 'library' : 'lab')}
            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Full Catalog</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-stone-950">
        <div
          ref={mountRef}
          className="w-full h-[580px] cursor-grab active:cursor-grabbing select-none"
        />

        {/* Hover Asset HUD */}
        {hoveredItem && (
          <div className="absolute top-4 left-4 bg-stone-900/95 text-stone-100 px-3.5 py-2.5 rounded-xl border border-stone-700 shadow-xl text-xs z-10 flex items-center gap-2.5 pointer-events-none animate-in fade-in duration-150">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="font-bold text-white block text-sm">{hoveredItem.name}</span>
              <span className="text-[11px] text-stone-400">{hoveredItem.info}</span>
            </div>
          </div>
        )}

        {/* Top-Right Quick Reset */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={resetCamera}
            className="px-3 py-1.5 bg-stone-900/90 hover:bg-stone-800 text-stone-200 text-xs font-medium rounded-xl border border-stone-700 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reset View</span>
          </button>
        </div>

        {/* Viewport-First Collapsible Bottom Inspection Dock */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-20">
          <div className="bg-stone-900/95 text-stone-100 rounded-2xl border border-stone-700/80 shadow-2xl overflow-hidden transition-all duration-200">
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-stone-800 bg-stone-950/60">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {activeMode === 'library'
                    ? selectedBook ? selectedBook.title : 'Select a Book Stack'
                    : selectedEquip ? selectedEquip.name : 'Select Lab Equipment'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  {activeMode === 'library' ? selectedBook?.category : selectedEquip?.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {activeMode === 'library' && selectedBook && (
                  <button
                    onClick={() => onNavigate('library')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Issue Book Pass</span>
                  </button>
                )}
                {activeMode === 'lab' && selectedEquip && (
                  <button
                    onClick={() => onNavigate('lab')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Activity className="w-3 h-3" />
                    <span>Reserve Equipment</span>
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

            {!dockCollapsed && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {activeMode === 'library' && selectedBook ? (
                  <>
                    <div className="md:col-span-2 space-y-1">
                      <p className="text-stone-300 font-medium">Author: {selectedBook.author}</p>
                      <p className="text-stone-400 text-[11px]">ISBN: {selectedBook.isbn} · Edition: 4th International</p>
                      <p className="text-stone-400 text-[11px]">Shelf Location: Stack CS-01, Tier 2, Bay B</p>
                    </div>

                    <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-400">Availability:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {selectedBook.availableCopies} of {selectedBook.totalCopies} Available
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-400">RFID Security:</span>
                        <span className="text-emerald-400 font-mono">Armed & Indexed</span>
                      </div>
                    </div>
                  </>
                ) : activeMode === 'lab' && selectedEquip ? (
                  <>
                    <div className="md:col-span-2 space-y-1">
                      <p className="text-stone-300 font-medium">Asset ID: {selectedEquip.assetId} · Serial: {selectedEquip.serialNumber} · Lab: {selectedEquip.lab}</p>
                      <p className="text-stone-400 text-[11px]">Maintenance Interval: Certified Bi-Monthly Calibration</p>
                      <p className="text-stone-400 text-[11px]">Telemetry: Real-time sensor bus active with automated safety interlocks.</p>
                    </div>

                    <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-400">Status:</span>
                        <span className="font-mono font-bold text-emerald-400">{selectedEquip.status}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-stone-400">Safety Tier:</span>
                        <span className="text-amber-400 font-mono">ESD Level 1 Certified</span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * CampusIQ Pro — 3D Floating AI Assistant Orb
 * Upgraded with Three.js composite quantum gyroscope rings, iridescent pulsating icosahedron core,
 * orbital particle dust vortex, magnetic cursor tracking tilt, Web Audio chime feedback, and Gemini drawer.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  HelpCircle,
  Maximize2,
  Minimize2,
  RefreshCw,
  Volume2
} from 'lucide-react';
import { Student, UserRole } from '../types/campus';
import { api } from '../services/api';
import { audioFeedback } from '../utils/audioFeedback';

interface ThreeAIOrbProps {
  student: Student;
  userRole: UserRole;
  onNavigate?: (tab: any) => void;
}

type OrbState = 'idle' | 'listening' | 'processing' | 'responding';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const ThreeAIOrb: React.FC<ThreeAIOrbProps> = ({
  student,
  userRole,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Greetings ${student.name.split(' ')[0]}! I am your CampusIQ Pro Smart Assistant. Ask me about your Autumn 2026 exams, 3D seating desk, attendance alerts, library book loans, or campus services.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Mini Canvas Ref (Floating Icon)
  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Header Canvas Ref (Inside Drawer)
  const headerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Suggested Prompts
  const suggestions = [
    'Where is my Autumn 2026 exam seat located?',
    'Is my attendance above the 75% threshold?',
    'What library books are currently issued to me?',
    'How do I request a digital gate pass for the weekend?',
  ];

  // Mouse tilt & hover tracking
  const mouseTiltRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseTiltRef.current.x = nx * 0.35;
      mouseTiltRef.current.y = ny * 0.35;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Three.js Orb Animation in both canvases
  useEffect(() => {
    const canvases: { canvas: HTMLCanvasElement; size: number }[] = [];
    if (miniCanvasRef.current) canvases.push({ canvas: miniCanvasRef.current, size: 56 });
    if (isOpen && headerCanvasRef.current) canvases.push({ canvas: headerCanvasRef.current, size: 80 });

    if (canvases.length === 0) return;

    const cleanupFns: (() => void)[] = [];

    canvases.forEach(({ canvas, size }) => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
      camera.position.z = 3.6;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // 1. Quantum Icosahedron Core
      const coreGeo = new THREE.IcosahedronGeometry(0.75, 3);
      const coreMat = new THREE.MeshStandardMaterial({
        color: orbState === 'processing' ? 0xf59e0b : orbState === 'responding' ? 0x10b981 : 0x059669,
        roughness: 0.15,
        metalness: 0.85,
        emissive: orbState === 'processing' ? 0xb45309 : orbState === 'responding' ? 0x047857 : 0x064e3b,
        emissiveIntensity: 0.7,
        wireframe: false,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      scene.add(coreMesh);

      // 2. Concentric Gyroscope Gimbal Rings (3 Rings on orthogonal planes)
      const ringGroup = new THREE.Group();

      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.9
      });

      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.025, 12, 48), ringMat);
      ringGroup.add(ring1);

      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.02, 12, 48), ringMat);
      ring2.rotation.x = Math.PI / 3;
      ringGroup.add(ring2);

      const ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.015, 12, 48), ringMat);
      ring3.rotation.y = Math.PI / 4;
      ringGroup.add(ring3);

      scene.add(ringGroup);

      // 3. Orbital Particle Dust Vortex
      const particleCount = 75;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const theta = (i / particleCount) * Math.PI * 2;
        const radius = 1.45 + (Math.random() - 0.5) * 0.25;
        positions[i * 3] = Math.cos(theta) * radius;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
        positions[i * 3 + 2] = Math.sin(theta) * radius;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x6ee7b7,
        size: 0.05,
        transparent: true,
        opacity: 0.9,
      });
      const particlePoints = new THREE.Points(particleGeo, particleMat);
      scene.add(particlePoints);

      // Lighting
      const light = new THREE.DirectionalLight(0xffffff, 2.2);
      light.position.set(2, 4, 3);
      scene.add(light);
      const ambient = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambient);

      let animId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();
        const isHovered = isHoveredRef.current;

        const baseMultiplier = orbState === 'listening' ? 2.5 : orbState === 'processing' ? 3.8 : 1.0;
        const speedMultiplier = isHovered ? baseMultiplier * 1.8 : baseMultiplier;

        // Core rotation & mouse tilt
        coreMesh.rotation.y += 0.015 * speedMultiplier;
        coreMesh.rotation.x += 0.008 * speedMultiplier;

        // Gimbal ring counter-rotations
        ring1.rotation.z += 0.02 * speedMultiplier;
        ring2.rotation.y -= 0.015 * speedMultiplier;
        ring3.rotation.x += 0.018 * speedMultiplier;

        // Magnetic mouse tilt & hover scale expansion
        ringGroup.rotation.x = THREE.MathUtils.lerp(ringGroup.rotation.x, mouseTiltRef.current.y, 0.08);
        ringGroup.rotation.y = THREE.MathUtils.lerp(ringGroup.rotation.y, mouseTiltRef.current.x, 0.08);

        const targetRingScale = isHovered ? 1.15 : 1.0;
        ringGroup.scale.lerp(new THREE.Vector3(targetRingScale, targetRingScale, targetRingScale), 0.1);

        // Particle vortex
        particlePoints.rotation.y += 0.03 * speedMultiplier;
        particlePoints.rotation.z = Math.sin(elapsedTime * 1.5) * 0.2;

        // Core scale & emissive pulse
        const pulse = (isHovered ? 1.08 : 1.0) + Math.sin(elapsedTime * (orbState === 'processing' ? 6 : 2)) * 0.06;
        coreMesh.scale.set(pulse, pulse, pulse);

        if (isHovered) {
          coreMat.emissiveIntensity = THREE.MathUtils.lerp(coreMat.emissiveIntensity, 1.2, 0.1);
        }

        renderer.render(scene, camera);
      };

      animate();

      cleanupFns.push(() => {
        cancelAnimationFrame(animId);
        renderer.dispose();
        coreGeo.dispose();
        coreMat.dispose();
        particleGeo.dispose();
        particleMat.dispose();
        ringMat.dispose();
      });
    });

    return () => {
      cleanupFns.forEach(fn => fn());
    };
  }, [orbState, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);
    setOrbState('processing');

    try {
      const response = await api.askAIAdvisor(q, student.id, userRole);
      setOrbState('responding');
      audioFeedback.playSuccessSound();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);

      setTimeout(() => {
        setOrbState('idle');
      }, 4000);
    } catch (err: any) {
      setOrbState('idle');
      audioFeedback.playErrorSound();
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `I encountered an error querying campus databases: ${err.message || 'Service offline'}. Please try asking again.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating 3D AI Orb Launcher Button (Visible when closed) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 group">
          <button
            onMouseEnter={() => {
              isHoveredRef.current = true;
            }}
            onMouseLeave={() => {
              isHoveredRef.current = false;
            }}
            onClick={() => {
              setIsOpen(true);
              setOrbState('listening');
              audioFeedback.playSuccessSound();
              setTimeout(() => setOrbState('idle'), 2000);
            }}
            className="relative flex items-center justify-center w-16 h-16 rounded-full bg-stone-900 border-2 border-emerald-500 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 overflow-hidden"
            title="Open CampusIQ Pro 3D AI Assistant"
            aria-label="Open 3D AI Assistant"
          >
            {/* Three.js Mini Orb Canvas */}
            <canvas ref={miniCanvasRef} className="w-14 h-14 pointer-events-none" />

            {/* Glowing Ring */}
            <span className="absolute -inset-1 rounded-full border border-emerald-400/40 animate-ping pointer-events-none" />

            {/* Notification pip */}
            <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </span>
          </button>

          {/* Hover Tooltip Pill */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-stone-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-xl border border-stone-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>CampusIQ AI Assistant (3D)</span>
          </div>
        </div>
      )}

      {/* Expanded AI Assistant Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out ${
            isExpanded
              ? 'inset-4 md:inset-10'
              : 'bottom-4 right-4 md:bottom-6 md:right-6 w-full max-w-md h-[580px] max-h-[85vh]'
          } flex flex-col bg-white rounded-2xl shadow-2xl border border-emerald-800/20 overflow-hidden animate-in slide-in-from-bottom-6`}
        >
          {/* Header with 3D Orb and Status */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-4 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-black/30 border border-emerald-500/40 flex items-center justify-center overflow-hidden shrink-0">
                <canvas ref={headerCanvasRef} className="w-14 h-14" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight">CampusIQ Pro AI</h3>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      orbState === 'processing'
                        ? 'bg-amber-400 text-stone-900 animate-pulse'
                        : orbState === 'responding'
                        ? 'bg-emerald-300 text-emerald-950'
                        : 'bg-emerald-700/80 text-emerald-100'
                    }`}
                  >
                    {orbState}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200">
                  Gemini 3.8 Flash · Contextualized for {student.name.split(' ')[0]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick chips bar */}
          <div className="bg-stone-50 border-b border-stone-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-stone-400 font-medium shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Prompts:
            </span>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="shrink-0 px-2.5 py-1 bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 rounded-md border border-stone-200 hover:border-emerald-300 transition-colors shadow-2xs font-medium"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-100/40">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-xl p-3 text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-emerald-800 text-white rounded-br-2xs font-medium'
                      : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-2xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-emerald-200' : 'text-stone-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-stone-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-stone-500 italic bg-white/70 p-3 rounded-xl border border-stone-200 w-fit">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                Gemini 3.8 Flash is analyzing campus databases...
              </div>
            )}
          </div>

          {/* Input Box Footer */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Ask anything about exams, attendance, gate pass, 3D labs..."
              className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-2.5 bg-emerald-800 text-white rounded-xl hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
              title="Send Inquiry"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

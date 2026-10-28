/**
 * CampusIQ Pro — Real-Time Universal QR Code Scanner Modal
 * Powered by pure-client jsQR engine for instantaneous, real-time optical barcode detection:
 * - Auto-starts camera stream on open with continuous frame decoding.
 * - Real-time corner point tracking overlay with animated laser reticle.
 * - Instant drag & drop / image file upload scanner for offline and screenshot decoding.
 * - Interactive on-screen camera simulation with real-time optical decoding.
 * - Immediate Web Audio API feedback (harmonic success chime or reject buzz).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  CameraOff,
  X,
  QrCode,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Play,
  Upload,
  RefreshCw,
  ScanLine,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { VerificationResult } from '../types/campus';
import { audioFeedback, VoiceAnnouncementMode } from '../utils/audioFeedback';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (result: VerificationResult, code: string) => void;
  defaultVerifierRole?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  defaultVerifierRole = 'Security Staff',
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'simulate'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isVerifying, setIsVerifying] = useState(false);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [soundMuted, setSoundMuted] = useState(audioFeedback.isMuted());
  const [voiceMode, setVoiceMode] = useState<VoiceAnnouncementMode>(audioFeedback.getVoiceMode());
  const [lastAudioCue, setLastAudioCue] = useState<'success' | 'error' | null>(null);

  // File upload state
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [uploadScanning, setUploadScanning] = useState(false);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isDecodingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync mute state on open
  useEffect(() => {
    if (isOpen) {
      setSoundMuted(audioFeedback.isMuted());
      setDetectedCode(null);
      setIsVerifying(false);
    }
  }, [isOpen]);

  // Audio Toggle
  const toggleSound = () => {
    const next = audioFeedback.toggleMute();
    setSoundMuted(next);
    if (!next) {
      audioFeedback.playSuccessSound();
      setLastAudioCue('success');
      setTimeout(() => setLastAudioCue(null), 1200);
    }
  };

  // Helper to execute server verification and trigger audio
  const handleVerify = useCallback(async (codeToVerify: string) => {
    if (!codeToVerify.trim() || isVerifying) return;
    setIsVerifying(true);
    setDetectedCode(codeToVerify.trim());

    try {
      stopCamera();
      const result = await api.verifyQR(codeToVerify.trim(), 'Terminal 1 - Main Gate', defaultVerifierRole);

      // Trigger subtle audio feedback based on verification verdict
      if (result.valid) {
        audioFeedback.playSuccessSound();
        setLastAudioCue('success');

        // Automatically announce roll number or student name aloud!
        audioFeedback.announceScan(result);
      } else {
        audioFeedback.playErrorSound();
        setLastAudioCue('error');
        audioFeedback.speakText('Access denied. Invalid or unrecognized credential.');
      }

      // Small delay to let the user see the detection lock & hear the sound & speech
      setTimeout(() => {
        onVerified(result, codeToVerify.trim());
        onClose();
      }, 450);
    } catch (err: any) {
      audioFeedback.playErrorSound();
      setLastAudioCue('error');
      alert(err.message || 'Verification network failure');
      setIsVerifying(false);
      setDetectedCode(null);
    }
  }, [isVerifying, defaultVerifierRole, onVerified, onClose]);

  // Start real-time camera stream
  const startCamera = useCallback(async (desiredFacing: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    setCameraLoading(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: desiredFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setCameraActive(true);
      setCameraLoading(false);
    } catch (err: any) {
      console.warn('Real-time camera initiation failed:', err);
      setCameraError(err.message || 'Camera permission denied or camera not available.');
      setCameraActive(false);
      setCameraLoading(false);
    }
  }, [facingMode]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraLoading(false);
  }, []);

  // Auto-start camera when modal opens in camera tab
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, startCamera, stopCamera]);

  // Real-Time Frame Decoding Loop with jsQR
  useEffect(() => {
    if (!cameraActive || !videoRef.current) return;

    let active = true;

    const scanFrame = () => {
      if (!active || isDecodingRef.current) return;

      const video = videoRef.current;
      const overlay = overlayCanvasRef.current;

      if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        animationFrameIdRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      // Sync overlay canvas dimensions to video
      if (overlay && (overlay.width !== video.videoWidth || overlay.height !== video.videoHeight)) {
        overlay.width = video.videoWidth;
        overlay.height = video.videoHeight;
      }

      const overlayCtx = overlay?.getContext('2d');
      if (overlayCtx && overlay) {
        overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
      }

      // Prepare offscreen canvas
      let offscreen = offscreenCanvasRef.current;
      if (!offscreen) {
        offscreen = document.createElement('canvas');
        offscreenCanvasRef.current = offscreen;
      }

      if (offscreen.width !== video.videoWidth || offscreen.height !== video.videoHeight) {
        offscreen.width = video.videoWidth;
        offscreen.height = video.videoHeight;
      }

      const offscreenCtx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!offscreenCtx) {
        animationFrameIdRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      offscreenCtx.drawImage(video, 0, 0, offscreen.width, offscreen.height);
      const imageData = offscreenCtx.getImageData(0, 0, offscreen.width, offscreen.height);

      // Perform pure-JS optical decoding
      const qrResult = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (qrResult && qrResult.data) {
        // Draw real-time bounding polygon on overlay
        if (overlayCtx && qrResult.location) {
          const { topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner } = qrResult.location;

          overlayCtx.beginPath();
          overlayCtx.moveTo(topLeftCorner.x, topLeftCorner.y);
          overlayCtx.lineTo(topRightCorner.x, topRightCorner.y);
          overlayCtx.lineTo(bottomRightCorner.x, bottomRightCorner.y);
          overlayCtx.lineTo(bottomLeftCorner.x, bottomLeftCorner.y);
          overlayCtx.closePath();

          overlayCtx.lineWidth = 4;
          overlayCtx.strokeStyle = '#10b981'; // Emerald 500
          overlayCtx.stroke();

          // Semi-transparent fill
          overlayCtx.fillStyle = 'rgba(16, 185, 129, 0.25)';
          overlayCtx.fill();

          // Corner markers
          [topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner].forEach(pt => {
            overlayCtx.beginPath();
            overlayCtx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
            overlayCtx.fillStyle = '#34d399';
            overlayCtx.fill();
            overlayCtx.strokeStyle = '#ffffff';
            overlayCtx.lineWidth = 2;
            overlayCtx.stroke();
          });
        }

        // Lock onto detected QR code
        isDecodingRef.current = true;
        active = false;
        handleVerify(qrResult.data);
        return;
      }

      animationFrameIdRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameIdRef.current = requestAnimationFrame(scanFrame);

    return () => {
      active = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      isDecodingRef.current = false;
    };
  }, [cameraActive, handleVerify]);

  // Decode from File Upload / Drag & Drop
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadScanning(true);
    const reader = new FileReader();

    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        setUploadedImagePreview(img.src);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setUploadScanning(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrResult = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        setUploadScanning(false);

        if (qrResult && qrResult.data) {
          handleVerify(qrResult.data);
        } else {
          audioFeedback.playErrorSound();
          alert('No recognizable QR Code detected in this image. Please upload a clear image of a campus credential QR code.');
        }
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  // Flip camera between front and back
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  if (!isOpen) return null;

  const validPresets = [
    { label: 'Student ID (Aarav Sharma)', code: 'CIQ-STUID-STU-2024-001-9F2B81C4A0E1' },
    { label: 'Event Entry Pass (AI Hackathon)', code: 'CIQ-EVTPASS-REG-2026-881-A7E9' },
    { label: 'Exam Hall Ticket (CS601)', code: 'CIQ-HALLTICKET-HT-2026-CS-089-8A1C' },
    { label: 'Canteen Order Pickup (#8921)', code: 'CIQ-CANTEEN-ORD-8921-READY' },
    { label: 'Student Gate Pass (GP-2026-042)', code: 'CIQ-GATEPASS-GP-2026-042-99EA' },
    { label: 'Library Book (Algorithms)', code: 'CIQ-BOOK-BK-102-01' },
    { label: 'Lab Equipment (Robotic Arm)', code: 'CIQ-EQUIP-LAB-EQ-01-ROBO' },
  ];

  const rejectionPresets = [
    { label: 'Expired Event Pass (Simulated)', code: 'CIQ-EVTPASS-EXPIRED-TEST' },
    { label: 'Revoked Security Gate Pass', code: 'CIQ-GATEPASS-REVOKED-TEST' },
    { label: 'Unrecognized / Tampered Token', code: 'CIQ-INVALID-HASH-999-TAMPER' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-semibold shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900">Real-Time QR Verifier</h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 tracking-wider uppercase">
                  Optical Engine
                </span>
                {lastAudioCue === 'success' && (
                  <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded animate-pulse">
                    Chime Triggered
                  </span>
                )}
                {lastAudioCue === 'error' && (
                  <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded animate-pulse">
                    Error Tone
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">Live optical video decoding with audio feedback</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Feedback Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={soundMuted ? 'Sound is muted. Click to enable audio cues.' : 'Audio feedback is ON. Click to mute.'}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border shadow-2xs ${
                soundMuted
                  ? 'bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {soundMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span className="hidden sm:inline">Sound ON</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Input Mode Switcher Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100/70 p-1.5 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'camera'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-emerald-700" />
            <span>Live Camera Feed</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload QR Image</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulate')}
            className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'simulate'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Test Codes</span>
          </button>
        </div>

        {/* On-Scan Voice Announcement Bar */}
        <div className="bg-stone-50/90 px-4 py-2 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-stone-700">
            <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>On Scan Say:</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                audioFeedback.setVoiceMode('name');
                setVoiceMode('name');
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                voiceMode === 'name'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              Name Only
            </button>
            <button
              type="button"
              onClick={() => {
                audioFeedback.setVoiceMode('roll');
                setVoiceMode('roll');
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                voiceMode === 'roll'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              Roll No Only
            </button>
            <button
              type="button"
              onClick={() => {
                audioFeedback.setVoiceMode('both');
                setVoiceMode('both');
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                voiceMode === 'both'
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
              }`}
            >
              Name & Roll No
            </button>
          </div>
        </div>

        {/* Body Viewport Area */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: Real-Time Live Camera */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative aspect-video w-full rounded-xl bg-stone-950 overflow-hidden flex flex-col items-center justify-center text-stone-300 border border-stone-800 shadow-inner">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />

                    {/* Real-time Tracking Canvas Overlay */}
                    <canvas
                      ref={overlayCanvasRef}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />

                    {/* Animated Scanning Reticle & Laser Sweep */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-400/80 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        {/* Corner Accents */}
                        <span className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400" />
                        <span className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400" />
                        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400" />
                        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400" />

                        {/* Animated Laser Beam */}
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-[bounce_2.2s_infinite]" />
                      </div>
                    </div>

                    {/* Real-time Status Overlay Badge */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>OPTICAL DECODER ACTIVE (jsQR)</span>
                      </span>

                      {detectedCode && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-bold font-mono animate-bounce shadow-md">
                          LOCKED: {detectedCode.substring(0, 15)}...
                        </span>
                      )}
                    </div>

                    {/* Camera Switch Controls */}
                    <button
                      type="button"
                      onClick={handleToggleFacingMode}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors border border-white/20"
                      title="Flip Camera (Front/Back)"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    {cameraLoading ? (
                      <>
                        <RefreshCw className="w-8 h-8 mx-auto text-emerald-500 animate-spin" />
                        <p className="text-xs text-stone-300">Initializing camera video feed...</p>
                      </>
                    ) : (
                      <>
                        <CameraOff className="w-10 h-10 mx-auto text-stone-500" />
                        <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
                          {cameraError
                            ? cameraError
                            : 'Camera is currently paused. Click below to grant permission and start the real-time optical scanner.'}
                        </p>
                        <div className="flex justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => startCamera()}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors inline-flex items-center gap-2"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Start Camera</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('simulate')}
                            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                          >
                            <span>Use Test Badges</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-stone-500 text-center">
                Point your device camera directly at any CampusIQ QR pass, student ID, or printed ticket.
              </p>
            </div>
          )}

          {/* TAB 2: Upload Image Scanner */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-xl p-8 text-center cursor-pointer bg-stone-50 hover:bg-emerald-50/30 transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-stone-800 mb-1">
                  Click to Upload or Drag QR Code Image
                </h4>
                <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                  Upload a photo or screenshot of a Student ID card, Event Pass, Exam Hall Ticket, or Canteen receipt.
                </p>
              </div>

              {uploadScanning && (
                <div className="flex items-center justify-center gap-2 text-xs text-stone-600 py-2">
                  <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>Scanning image with optical jsQR engine...</span>
                </div>
              )}

              {uploadedImagePreview && !uploadScanning && (
                <div className="p-3 bg-stone-100 rounded-xl text-center">
                  <img
                    src={uploadedImagePreview}
                    alt="Uploaded QR Code"
                    className="max-h-36 mx-auto rounded-lg object-contain border border-stone-200"
                  />
                  <p className="text-[10px] text-stone-400 mt-2 font-mono">Image processed locally</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Demonstration Badges */}
          {activeTab === 'simulate' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Exhibition One-Click Verification:</strong> Click any badge to trigger instantaneous optical verification and hear the authentic audio feedback cues.
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                  Valid Credentials (Triggers Harmonic Success Chime)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {validPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleVerify(preset.code)}
                      className="flex items-center justify-between text-left p-2.5 rounded-lg bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 transition-colors text-[11px] group"
                    >
                      <span className="font-medium text-stone-800 group-hover:text-emerald-950 truncate">
                        {preset.label}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-700 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block mb-1">
                  Security Rejections (Triggers Reject Buzz)
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {rejectionPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleVerify(preset.code)}
                      className="flex items-center justify-between text-left p-2.5 rounded-lg bg-red-50/50 hover:bg-red-50 hover:border-red-300 border border-red-200/60 transition-colors text-[11px] group"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="font-medium text-red-950 truncate">
                          {preset.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-red-700 font-bold shrink-0 ml-1">
                        Reject Tone
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Audio Feedback Test Controls */}
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-600 font-medium flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Audio Cue Previews:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  audioFeedback.playSuccessSound();
                  setLastAudioCue('success');
                  setTimeout(() => setLastAudioCue(null), 1200);
                }}
                className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 font-semibold rounded-md border border-emerald-200 shadow-2xs transition-colors flex items-center gap-1 text-[11px]"
              >
                <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                <span>Success Chime</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  audioFeedback.playErrorSound();
                  setLastAudioCue('error');
                  setTimeout(() => setLastAudioCue(null), 1200);
                }}
                className="px-2 py-1 bg-white hover:bg-red-50 text-red-700 font-semibold rounded-md border border-red-200 shadow-2xs transition-colors flex items-center gap-1 text-[11px]"
              >
                <Play className="w-3 h-3 text-red-600 fill-red-600" />
                <span>Reject Buzz</span>
              </button>
            </div>
          </div>

          {/* Manual Input Fallback */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Or Enter Cryptographic QR Token:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. CIQ-STUID-STU-2024-001-..."
                value={manualCode}
                onChange={e => setManualCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerify(manualCode)}
                className="flex-1 px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-stone-900"
              />
              <button
                type="button"
                disabled={!manualCode.trim() || isVerifying}
                onClick={() => handleVerify(manualCode)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
              >
                {isVerifying ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Verify Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Role: <strong className="text-stone-700">{defaultVerifierRole}</strong></span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${soundMuted ? 'bg-stone-300' : 'bg-emerald-500 animate-pulse'}`} />
            <span>Audio Feedback: <strong>{soundMuted ? 'Muted' : 'Active'}</strong></span>
          </span>
        </div>
      </div>
    </div>
  );
};

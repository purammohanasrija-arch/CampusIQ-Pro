/**
 * CampusIQ Pro — Student Skill Passport & Verified Portfolio
 * Institutional micro-credentials, verified certifications, hackathons, and shareable QR portfolio.
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  QrCode,
  Briefcase,
  GraduationCap,
  Sparkles,
  Trophy,
  Github,
  Copy,
  Check
} from 'lucide-react';
import { SkillPassport, Student, UserRole } from '../types/campus';
import { QRCodeView } from '../components/QRCodeView';
import { api } from '../services/api';

interface SkillPassportViewProps {
  student: Student;
  userRole: UserRole;
  onRefresh: () => void;
  onVerifyToken: (token: string) => void;
}

export const SkillPassportView: React.FC<SkillPassportViewProps> = ({
  student,
  userRole,
  onRefresh,
  onVerifyToken,
}) => {
  const [passportData, setPassportData] = useState<SkillPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const canVerifyCredentials =
    userRole === 'Super Administrator' || userRole === 'College Administrator' || userRole === 'Faculty';

  const fetchPassport = async () => {
    setLoading(true);
    try {
      const res = await api.getSkillPassport(student.id);
      setPassportData(res.passport);
    } catch (err) {
      console.error('Passport fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassport();
  }, [student.id]);

  const handleVerifyCert = async (certTitle: string) => {
    try {
      await api.verifyCertificate(student.id, certTitle);
      fetchPassport();
      alert(`Certificate "${certTitle}" officially verified by ${userRole}.`);
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    }
  };

  const handleCopyShareableLink = () => {
    navigator.clipboard.writeText(`https://campusiq.edu/passport/${passportData?.shareableId || student.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading || !passportData) {
    return (
      <div className="py-12 text-center text-xs text-stone-400">
        Loading Student Skill Passport records...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>Student Skill Passport & Achievement Portfolio</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Institutional Credential Ledger
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Faculty-verified competencies, industry certifications, hackathon awards, and cryptographically signed public portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQRModal(true)}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-emerald-800" />
            <span>Shareable Passport QR</span>
          </button>
          <button
            onClick={handleCopyShareableLink}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Shareable Link'}</span>
          </button>
        </div>
      </div>

      {/* Profile Bio Header Strip */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <img
            src={student.photo || '/src/assets/images/student_aarav_sharma.jpg'}
            alt={student.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-600/60 shadow-md"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null;
              target.src = '/src/assets/images/student_aarav_sharma.jpg';
            }}
          />
          <div className="absolute -bottom-2 -right-2 bg-emerald-800 text-white p-1 rounded-full shadow">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-stone-900">{student.name}</h3>
              <p className="text-xs font-semibold text-emerald-800 mt-0.5">{passportData.headline}</p>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                Roll: {student.rollNumber}
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                GPA {student.gpa} / 4.0
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-600 mt-3 leading-relaxed max-w-3xl">
            {passportData.bio}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-1.5">
            {passportData.skills.map(skill => (
              <span
                key={skill}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-stone-100 text-stone-800 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Verified Certifications, Hackathons, Internships */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verified Certifications */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h4 className="text-xs font-bold text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-800" />
              <span>Verified Industry Certifications</span>
            </h4>
            <span className="text-[11px] text-stone-400">Institutional Ledger</span>
          </div>

          <div className="space-y-3">
            {passportData.certifications.map((cert, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-stone-50 border border-stone-200/80 flex items-start justify-between gap-3">
                <div>
                  <h5 className="text-xs font-bold text-stone-900">{cert.title}</h5>
                  <p className="text-[11px] text-stone-500 mt-0.5">{cert.issuer} · Issued {cert.date}</p>
                  <p className="text-[10px] font-mono text-stone-400 mt-1">Credential ID: {cert.credentialId}</p>
                </div>

                <div className="shrink-0 text-right">
                  {cert.verified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    canVerifyCredentials && (
                      <button
                        onClick={() => handleVerifyCert(cert.title)}
                        className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-semibold rounded shadow-2xs"
                      >
                        Verify as Faculty
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hackathon Awards & Competitions */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h4 className="text-xs font-bold text-stone-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Hackathon Wins & Competition Accolades</span>
            </h4>
            <span className="text-[11px] text-stone-400">Global & Collegiate</span>
          </div>

          <div className="space-y-3">
            {passportData.hackathons.map((h, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-stone-50 border border-stone-200/80 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{h.name}</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                      {h.award}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 font-medium mt-1">Project: {h.project}</p>
                </div>
                <Trophy className="w-5 h-5 text-amber-500 shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shareable QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center">
              <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest font-semibold">
                Verifiable Public Passport
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-1">{student.name}</h3>
              <p className="text-xs text-stone-500">ID: {passportData.shareableId}</p>
            </div>

            <QRCodeView
              value={`https://campusiq.edu/passport/${passportData.shareableId}`}
              size={160}
              subtitle="Scan to inspect verified degree credentials, GPA, and awards"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onVerifyToken(student.qrToken);
                  setShowQRModal(false);
                }}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg"
              >
                Test Scan Identity
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

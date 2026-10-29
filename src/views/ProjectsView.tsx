/**
 * CampusIQ Pro — Project Exhibition & Live Expo Voting System
 * Features:
 * - 9 Diverse Engineering Capstone & Innovation Projects
 * - Dedicated High-Resolution Prototype Screenshots & Architecture Diagrams
 * - Comprehensive Technical Dossiers (Abstract, Specifications, Methodology, Results, Bill of Materials)
 * - Microsoft Word (.doc) Document Export & Real-time Printable Preview
 * - Auditable QR Code Placards, Duplicate-Vote Prevention, and Judge Scoring Rubrics
 */

import React, { useState, useMemo } from 'react';
import {
  Lightbulb,
  Plus,
  QrCode,
  ThumbsUp,
  Award,
  Star,
  Users,
  Video,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FileText,
  Download,
  Printer,
  Search,
  Filter,
  BookOpen,
  Layers,
  Cpu,
  Wrench,
  ChevronRight,
  X,
  Calendar,
  MapPin,
  Eye,
  Check
} from 'lucide-react';
import { ProjectSubmission, UserRole } from '../types/campus';
import { QRCodeView } from '../components/QRCodeView';
import { api } from '../services/api';

interface ProjectsViewProps {
  projects: ProjectSubmission[];
  userVotes: any[];
  userRole: UserRole;
  onRefresh: () => void;
  onVerifyToken: (token: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  userVotes,
  userRole,
  onRefresh,
  onVerifyToken,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProjectQR, setSelectedProjectQR] = useState<ProjectSubmission | null>(null);
  const [judgeScoreModalProject, setJudgeScoreModalProject] = useState<ProjectSubmission | null>(null);
  const [dossierProject, setDossierProject] = useState<ProjectSubmission | null>(null);
  const [dossierTab, setDossierTab] = useState<'dossier' | 'wordPreview'>('dossier');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [isExportingWord, setIsExportingWord] = useState(false);

  // Judge scores state
  const [scores, setScores] = useState({
    innovation: 92,
    architecture: 95,
    impact: 90,
  });

  // Prototype screenshot presets for submission modal
  const imagePresets = [
    { label: 'Autonomous Swarm Drones', url: '/src/assets/images/project_swarm_drones.jpg' },
    { label: 'Bionic Myoelectric Arm', url: '/src/assets/images/project_bionic_hand.jpg' },
    { label: 'Zero-Knowledge Ledger', url: '/src/assets/images/project_zk_ledger.jpg' },
    { label: 'AgriSense Autonomous Rover', url: '/src/assets/images/project_agrisense_robot.jpg' },
    { label: 'NeuroScan EEG Wearable', url: '/src/assets/images/project_neuroscan_eeg.jpg' },
    { label: 'EcoDrive Formula Student EV', url: '/src/assets/images/project_ecodrive_ev.jpg' },
    { label: 'HoloTutor WebXR Spatial Simulator', url: '/src/assets/images/project_holotutor_ar.jpg' },
    { label: 'CyberSentinel HoneyNet Defense', url: '/src/assets/images/project_cybersentinel.jpg' },
    { label: 'SkyNet 1U CubeSat Nanosatellite', url: '/src/assets/images/project_cubesat_satellite.jpg' },
  ];

  const [newProject, setNewProject] = useState({
    title: '',
    category: 'AI & Robotics',
    leadStudent: '',
    teamMembers: '',
    advisor: 'Dr. Elena Chen',
    department: 'Computer Science & Engineering',
    boothNumber: 'Booth #16',
    description: '',
    abstract: '',
    techStack: 'PyTorch, ROS2, C++',
    keySpecifications: 'Real-time processing\nEdge low-power compute\nBench-tested prototype',
    imageUrl: imagePresets[0].url,
  });

  const canJudge =
    userRole === 'Super Administrator' ||
    userRole === 'College Administrator' ||
    userRole === 'Project Judge' ||
    userRole === 'Faculty';

  // Categories list
  const categories = [
    'All',
    'AI & Robotics',
    'Biomedical & IoT',
    'Cybersecurity & Web3',
    'Smart IoT & Robotics',
    'Biomedical Tech',
    'Clean Tech & Automotive',
    'AR/VR & Education',
    'Cybersecurity & AI',
    'Aerospace & Telecom',
  ];

  // Helper to convert an image URL to Base64 so it can be cleanly embedded in Word .doc
  const getBase64Image = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(url);
        reader.readAsDataURL(blob);
      });
    } catch {
      // Fallback to absolute URL
      return window.location.origin + url;
    }
  };

  // Export single project as Microsoft Word document (.doc)
  const exportSingleProjectWord = async (proj: ProjectSubmission) => {
    setIsExportingWord(true);
    try {
      const base64Img = proj.imageUrl ? await getBase64Image(proj.imageUrl) : '';
      const docDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const wordHTML = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>${proj.title} - Project Technical Dossier</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page {
              size: 8.5in 11in;
              margin: 1.0in;
              mso-header-margin: 0.5in;
              mso-footer-margin: 0.5in;
            }
            body {
              font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
              color: #1e293b;
              line-height: 1.6;
              font-size: 11pt;
            }
            .header-banner {
              text-align: center;
              border-bottom: 2pt solid #065f46;
              padding-bottom: 12pt;
              margin-bottom: 18pt;
            }
            .institution {
              font-size: 10pt;
              font-weight: bold;
              color: #065f46;
              text-transform: uppercase;
              letter-spacing: 1.5pt;
            }
            .doc-title {
              font-size: 22pt;
              font-weight: bold;
              color: #0f172a;
              margin: 8pt 0 4pt 0;
            }
            .doc-subtitle {
              font-size: 11pt;
              color: #64748b;
              font-style: italic;
            }
            .badge {
              display: inline-block;
              background-color: #ecfdf5;
              color: #065f46;
              padding: 4pt 8pt;
              border-radius: 4pt;
              font-weight: bold;
              font-size: 9pt;
              border: 1pt solid #a7f3d0;
            }
            .meta-table {
              width: 100%;
              border-collapse: collapse;
              margin: 14pt 0;
              background-color: #f8fafc;
            }
            .meta-table td {
              padding: 6pt 10pt;
              border: 1pt solid #e2e8f0;
              font-size: 10pt;
            }
            .meta-table td.label {
              font-weight: bold;
              color: #475569;
              width: 28%;
              background-color: #f1f5f9;
            }
            .meta-table td.value {
              color: #0f172a;
            }
            .screenshot-container {
              text-align: center;
              margin: 16pt 0;
              padding: 10pt;
              background-color: #f8fafc;
              border: 1pt solid #e2e8f0;
              border-radius: 6pt;
            }
            .screenshot-container img {
              max-width: 100%;
              height: auto;
              max-height: 380px;
              border: 1pt solid #cbd5e1;
              border-radius: 4pt;
            }
            .screenshot-caption {
              font-size: 9pt;
              color: #64748b;
              margin-top: 6pt;
              font-style: italic;
            }
            h2 {
              font-size: 14pt;
              color: #065f46;
              border-bottom: 1.5pt solid #e2e8f0;
              padding-bottom: 4pt;
              margin-top: 18pt;
              margin-bottom: 8pt;
            }
            h3 {
              font-size: 12pt;
              color: #334155;
              margin-top: 12pt;
              margin-bottom: 4pt;
            }
            p {
              margin: 0 0 8pt 0;
              text-align: justify;
            }
            ul {
              margin: 4pt 0 10pt 18pt;
              padding: 0;
            }
            li {
              margin-bottom: 4pt;
            }
            .tech-pill {
              display: inline-block;
              background-color: #e0f2fe;
              color: #0369a1;
              padding: 2pt 6pt;
              border-radius: 3pt;
              font-size: 9pt;
              margin-right: 4pt;
              margin-bottom: 4pt;
              font-weight: 500;
            }
            .sign-table {
              width: 100%;
              margin-top: 35pt;
              border-collapse: collapse;
            }
            .sign-table td {
              width: 33%;
              text-align: center;
              padding: 8pt;
              vertical-align: top;
            }
            .sign-line {
              border-top: 1pt solid #94a3b8;
              margin: 30pt 15pt 4pt 15pt;
            }
            .sign-title {
              font-size: 9pt;
              color: #64748b;
            }
            .sign-name {
              font-size: 10pt;
              font-weight: bold;
              color: #1e293b;
            }
            .footer-note {
              margin-top: 25pt;
              border-top: 0.5pt solid #cbd5e1;
              padding-top: 6pt;
              font-size: 8pt;
              color: #94a3b8;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div class="institution">CampusIQ Pro &bull; Center for Academic Innovation & Research</div>
            <div class="doc-title">Project Technical Dossier & Verification Report</div>
            <div class="doc-subtitle">Official Student Capstone Exhibition Record &bull; Academic Year 2026-2027</div>
          </div>

          <table class="meta-table">
            <tr>
              <td class="label">Project Title</td>
              <td class="value"><strong>${proj.title}</strong></td>
            </tr>
            <tr>
              <td class="label">Category & Booth</td>
              <td class="value"><span class="badge">${proj.category}</span> &bull; ${proj.boothNumber}</td>
            </tr>
            <tr>
              <td class="label">Primary Department</td>
              <td class="value">${proj.department}</td>
            </tr>
            <tr>
              <td class="label">Lead Investigator</td>
              <td class="value"><strong>${proj.leadStudent}</strong></td>
            </tr>
            <tr>
              <td class="label">Contributing Team</td>
              <td class="value">${proj.teamMembers.join(', ')}</td>
            </tr>
            <tr>
              <td class="label">Faculty Advisor</td>
              <td class="value"><strong>${proj.advisor}</strong></td>
            </tr>
            <tr>
              <td class="label">Official Judge Score</td>
              <td class="value"><strong>${proj.judgeScore} / 100</strong> (Official Rubric Evaluated)</td>
            </tr>
            <tr>
              <td class="label">Public Votes Verified</td>
              <td class="value"><strong>${proj.votesCount} Verified Student / Visitor Ballots</strong></td>
            </tr>
            <tr>
              <td class="label">Placard Token</td>
              <td class="value"><span style="font-family: monospace;">${proj.qrCode}</span></td>
            </tr>
            <tr>
              <td class="label">Dossier Generated</td>
              <td class="value">${docDate}</td>
            </tr>
          </table>

          ${
            base64Img
              ? `
            <div class="screenshot-container">
              <img src="${base64Img}" alt="${proj.title} Prototype Screenshot" />
              <div class="screenshot-caption">Figure 1: Verified Engineering Prototype, Experimental Hardware Testbench, or Architecture Capture</div>
            </div>
          `
              : ''
          }

          <h2>1. Executive Abstract</h2>
          <p>${proj.abstract || proj.description}</p>

          <h2>2. Technology Stack & Frameworks</h2>
          <div>
            ${(proj.techStack || ['ROS2', 'PyTorch', 'TypeScript', 'Node.js', 'C++'])
              .map((t) => `<span class="tech-pill">${t}</span>`)
              .join(' ')}
          </div>

          <h2>3. Key Engineering Specifications</h2>
          <ul>
            ${(
              proj.keySpecifications || [
                'Sub-centimeter precision response latency',
                'Edge embedded computation pipeline',
                'Fault-tolerant failover architecture',
                'Verified laboratory bench test completed',
              ]
            )
              .map((spec) => `<li><strong>${spec}</strong></li>`)
              .join('')}
          </ul>

          <h2>4. Research Methodology & Architecture</h2>
          <p>${proj.documentation?.methodology || 'Iterative agile prototyping and experimental bench validation in campus research laboratories.'}</p>

          <h2>5. Experimental Validation & Results</h2>
          <p>${proj.documentation?.results || 'Benchmark test suite demonstrated robust operational performance meeting all engineering criteria.'}</p>

          <h2>6. Bill of Materials & Hardware Specifications</h2>
          <p>${proj.documentation?.billOfMaterials || 'Microcontroller units, custom breakout PCBs, sensor array, and high-discharge power pack.'}</p>

          <h2>7. Future Roadmap & Commercialization</h2>
          <p>${proj.documentation?.futureWork || 'Field deployment, miniaturization, and patent submission.'}</p>

          <table class="sign-table">
            <tr>
              <td>
                <div class="sign-line"></div>
                <div class="sign-name">${proj.leadStudent}</div>
                <div class="sign-title">Student Lead Researcher</div>
              </td>
              <td>
                <div class="sign-line"></div>
                <div class="sign-name">${proj.advisor}</div>
                <div class="sign-title">Faculty Project Advisor</div>
              </td>
              <td>
                <div class="sign-line"></div>
                <div class="sign-name">Dr. Sophia Vance</div>
                <div class="sign-title">Board of Expo Judges</div>
              </td>
            </tr>
          </table>

          <div class="footer-note">
            CampusIQ Pro Auditable Verification &bull; Timestamp: ${new Date().toISOString()} &bull; Cryptographic Token: ${proj.qrCode}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', wordHTML], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${proj.title.replace(/[^a-zA-Z0-9]/g, '_')}_Dossier.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Could not generate Word document: ' + err.message);
    } finally {
      setIsExportingWord(false);
    }
  };

  // Export all projects summary into one comprehensive Word catalog
  const exportAllProjectsWord = async () => {
    setIsExportingWord(true);
    try {
      const docDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      let projectSectionsHTML = '';
      for (const [index, p] of projects.entries()) {
        const base64Img = p.imageUrl ? await getBase64Image(p.imageUrl) : '';
        projectSectionsHTML += `
          <div style="page-break-before: always; margin-top: 20pt;">
            <div style="font-size: 10pt; color: #065f46; font-weight: bold; text-transform: uppercase;">
              Project #${index + 1} &bull; ${p.category} &bull; ${p.boothNumber}
            </div>
            <h2 style="font-size: 16pt; color: #0f172a; margin: 4pt 0 8pt 0; border-bottom: 2pt solid #065f46; padding-bottom: 4pt;">
              ${p.title}
            </h2>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 12pt; background-color: #f8fafc;">
              <tr>
                <td style="padding: 5pt 8pt; border: 1pt solid #cbd5e1; font-weight: bold; width: 25%; background-color: #f1f5f9;">Lead Student</td>
                <td style="padding: 5pt 8pt; border: 1pt solid #cbd5e1;">${p.leadStudent}</td>
                <td style="padding: 5pt 8pt; border: 1pt solid #cbd5e1; font-weight: bold; width: 20%; background-color: #f1f5f9;">Judge Score</td>
                <td style="padding: 5pt 8pt; border: 1pt solid #cbd5e1; font-weight: bold; color: #065f46;">${p.judgeScore} / 100</td>
              </tr>
              <tr>
                <td style="padding: 5pt 8pt; border: 1pt solid #cbd5e1; font-weight: bold; background-color: #f1f5f9;">Team Members</td>
                <td style="padding: 5pt 8pt; border: 1pt solid #cbd5e1;">${p.teamMembers.join(', ')}</td>
                <td style="padding: 5pt 8pt; border: 1pt solid #cbd5e1; font-weight: bold; background-color: #f1f5f9;">Public Votes</td>
                <td style="padding: 5pt 8pt; border: 1pt solid #cbd5e1; font-weight: bold; color: #0369a1;">${p.votesCount} Votes</td>
              </tr>
              <tr>
                <td style="padding: 5pt 8pt; border: 1pt solid #cbd5e1; font-weight: bold; background-color: #f1f5f9;">Advisor & Dept</td>
                <td style="padding: 5pt 8pt; border: 1pt solid #cbd5e1;" colspan="3">${p.advisor} &bull; ${p.department}</td>
              </tr>
            </table>

            ${
              base64Img
                ? `
              <div style="text-align: center; margin: 12pt 0; padding: 8pt; background-color: #f8fafc; border: 1pt solid #e2e8f0; border-radius: 4pt;">
                <img src="${base64Img}" style="max-width: 100%; max-height: 280px; border: 1pt solid #cbd5e1; border-radius: 4pt;" alt="${p.title}" />
                <div style="font-size: 8.5pt; color: #64748b; margin-top: 4pt; font-style: italic;">
                  Prototype Screenshot & System Architecture Capture
                </div>
              </div>
            `
                : ''
            }

            <h3 style="font-size: 11pt; color: #065f46; margin-top: 10pt; margin-bottom: 4pt;">Executive Abstract</h3>
            <p style="font-size: 10pt; line-height: 1.5; text-align: justify; margin-bottom: 8pt;">${p.abstract || p.description}</p>

            <h3 style="font-size: 11pt; color: #065f46; margin-top: 10pt; margin-bottom: 4pt;">Core Tech Stack</h3>
            <p style="font-size: 9.5pt; margin-bottom: 8pt; color: #0369a1;">
              <strong>${(p.techStack || []).join(' &bull; ')}</strong>
            </p>

            <h3 style="font-size: 11pt; color: #065f46; margin-top: 10pt; margin-bottom: 4pt;">Key Engineering Specifications</h3>
            <ul style="font-size: 9.5pt; margin: 4pt 0 8pt 16pt;">
              ${(p.keySpecifications || []).map((s) => `<li>${s}</li>`).join('')}
            </ul>

            <h3 style="font-size: 11pt; color: #065f46; margin-top: 10pt; margin-bottom: 4pt;">Methodology & Results</h3>
            <p style="font-size: 9.5pt; line-height: 1.5; margin-bottom: 6pt;">
              <strong>Methodology:</strong> ${p.documentation?.methodology || 'N/A'}
            </p>
            <p style="font-size: 9.5pt; line-height: 1.5; margin-bottom: 6pt;">
              <strong>Results:</strong> ${p.documentation?.results || 'N/A'}
            </p>
          </div>
        `;
      }

      const catalogHTML = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>CampusIQ Pro - Innovation Expo Project Compendium 2026</title>
          <style>
            body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; color: #1e293b; margin: 40pt; }
            h1 { color: #065f46; font-size: 24pt; text-align: center; margin-bottom: 4pt; }
            .subtitle { text-align: center; color: #64748b; font-size: 11pt; margin-bottom: 24pt; border-bottom: 2pt solid #065f46; padding-bottom: 12pt; }
            table { width: 100%; border-collapse: collapse; }
          </style>
        </head>
        <body>
          <h1>CampusIQ Pro &bull; Innovation Expo 2026</h1>
          <div class="subtitle">Complete Capstone Project Compendium, Technical Documentation & Judge Scoring Directory &bull; ${docDate}</div>
          
          <h2>Exhibition Overview & Directory</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20pt; font-size: 10pt;">
            <thead>
              <tr style="background-color: #065f46; color: white;">
                <th style="padding: 6pt; border: 1pt solid #cbd5e1; text-align: left;">Rank / ID</th>
                <th style="padding: 6pt; border: 1pt solid #cbd5e1; text-align: left;">Project Title</th>
                <th style="padding: 6pt; border: 1pt solid #cbd5e1; text-align: left;">Category</th>
                <th style="padding: 6pt; border: 1pt solid #cbd5e1; text-align: left;">Lead Student</th>
                <th style="padding: 6pt; border: 1pt solid #cbd5e1; text-align: center;">Judge Score</th>
                <th style="padding: 6pt; border: 1pt solid #cbd5e1; text-align: center;">Votes</th>
              </tr>
            </thead>
            <tbody>
              ${projects
                .map(
                  (p, idx) => `
                <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding: 5pt; border: 1pt solid #cbd5e1; font-weight: bold;">#${idx + 1} (${p.id})</td>
                  <td style="padding: 5pt; border: 1pt solid #cbd5e1; font-weight: bold;">${p.title}</td>
                  <td style="padding: 5pt; border: 1pt solid #cbd5e1;">${p.category}</td>
                  <td style="padding: 5pt; border: 1pt solid #cbd5e1;">${p.leadStudent}</td>
                  <td style="padding: 5pt; border: 1pt solid #cbd5e1; text-align: center; font-weight: bold; color: #065f46;">${p.judgeScore}</td>
                  <td style="padding: 5pt; border: 1pt solid #cbd5e1; text-align: center; font-weight: bold; color: #0369a1;">${p.votesCount}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          ${projectSectionsHTML}
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', catalogHTML], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CampusIQ_Innovation_Expo_2026_Complete_Compendium.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Could not export Word compendium: ' + err.message);
    } finally {
      setIsExportingWord(false);
    }
  };

  const handleVote = async (projectId: string) => {
    setVotingId(projectId);
    try {
      const res = await api.voteProject(projectId);
      alert(res.message);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Voting failed');
    } finally {
      setVotingId(null);
    }
  };

  const handleJudgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeScoreModalProject) return;
    try {
      const res = await api.scoreProject(judgeScoreModalProject.id, scores);
      alert(res.message);
      setJudgeScoreModalProject(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Scoring failed');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) return;
    try {
      await api.createProject({
        title: newProject.title,
        category: newProject.category,
        leadStudent: newProject.leadStudent || 'Student Lead',
        teamMembers: newProject.teamMembers.split(',').map((s) => s.trim()),
        advisor: newProject.advisor,
        department: newProject.department,
        boothNumber: newProject.boothNumber,
        description: newProject.description,
        abstract: newProject.abstract || newProject.description,
        imageUrl: newProject.imageUrl,
        techStack: newProject.techStack.split(',').map((s) => s.trim()),
        keySpecifications: newProject.keySpecifications
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setShowSubmitModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    }
  };

  // Filter & sort projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'All' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
        const matchesSearch =
          !searchQuery.trim() ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.leadStudent.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.teamMembers.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.techStack && p.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => b.votesCount - a.votesCount);
  }, [projects, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Project Exhibition & Innovation Expo
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {projects.length} Engineering Capstones
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Word (.doc) Dossiers Ready
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Multi-disciplinary student engineering prototypes, verified architecture screenshots, auditable voting,
            and exportable Microsoft Word research dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export All Projects Word Summary */}
          <button
            onClick={exportAllProjectsWord}
            disabled={isExportingWord}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold border border-stone-300 transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Export all projects into a complete Microsoft Word compendium"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>{isExportingWord ? 'Exporting Word...' : 'Export Expo Word Compendium'}</span>
          </button>

          {/* Submit Expo Project */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Expo Project</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by title, tech stack (ROS2, PyTorch, Solidity...), team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors text-[11px] ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
          <Lightbulb className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800">No Projects Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            No projects matched the search criteria &ldquo;{searchQuery}&rdquo;. Try another keyword or clear the
            category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj, rank) => {
            return (
              <div
                key={proj.id}
                className="bg-white rounded-xl border border-stone-200 shadow-xs hover:shadow-md hover:border-emerald-600/40 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Image Banner & Rank Header */}
                <div className="relative h-44 w-full bg-stone-900 overflow-hidden">
                  {proj.imageUrl ? (
                    <img
                      src={proj.imageUrl}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/src/assets/images/project_swarm_drones.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-400">
                      <Cpu className="w-8 h-8" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30" />

                  {/* Top Bar Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 text-stone-900 backdrop-blur-xs font-mono shadow-xs">
                      Rank #{rank + 1}
                    </span>
                    <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20 font-mono">
                      {proj.boothNumber}
                    </span>
                  </div>

                  {/* Bottom Image Info */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-[10px] font-semibold bg-emerald-700/90 backdrop-blur-xs px-2 py-0.5 rounded text-white shadow-2xs">
                      {proj.category}
                    </span>
                    <button
                      onClick={() => {
                        setDossierProject(proj);
                        setDossierTab('dossier');
                      }}
                      className="text-[10px] font-medium text-emerald-200 hover:text-white flex items-center gap-1 bg-black/40 hover:bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Screenshot</span>
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Project Title */}
                    <h3 className="text-sm font-bold text-stone-900 leading-snug line-clamp-2 group-hover:text-emerald-800 transition-colors">
                      {proj.title}
                    </h3>

                    {/* Abstract / Description */}
                    <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {proj.abstract || proj.description}
                    </p>

                    {/* Tech Stack Badges */}
                    {proj.techStack && proj.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {proj.techStack.slice(0, 4).map((tech, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border border-stone-200/80"
                          >
                            {tech}
                          </span>
                        ))}
                        {proj.techStack.length > 4 && (
                          <span className="text-[9px] text-stone-400 font-semibold px-1 py-0.5">
                            +{proj.techStack.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Key Specifications Quick Preview */}
                    {proj.keySpecifications && proj.keySpecifications.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-stone-100 space-y-1">
                        {proj.keySpecifications.slice(0, 2).map((spec, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-stone-600">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{spec}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Team & Advisor */}
                    <div className="mt-2.5 pt-2 border-t border-stone-100 space-y-0.5 text-xs text-stone-600">
                      <p className="flex items-center gap-1.5 truncate">
                        <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">
                          Team: <strong className="text-stone-800">{proj.teamMembers.join(', ')}</strong>
                        </span>
                      </p>
                      <p className="text-[11px] text-stone-400 truncate pl-5">
                        Advisor: <span className="text-stone-600">{proj.advisor}</span>
                      </p>
                    </div>

                    {/* Score & Public Votes Pill */}
                    <div className="mt-3 p-2 rounded-lg bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] text-stone-400 uppercase font-semibold block">Judge Score</span>
                        <strong className="text-stone-900 font-bold tabular-nums text-xs">
                          {proj.judgeScore} / 100
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-stone-400 uppercase font-semibold block">Public Ballots</span>
                        <strong className="text-emerald-800 font-bold tabular-nums text-xs">
                          {proj.votesCount} Votes
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-stone-100 flex items-center gap-1.5">
                    {/* View Details & Word Report */}
                    <button
                      onClick={() => {
                        setDossierProject(proj);
                        setDossierTab('dossier');
                      }}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded text-xs font-semibold transition-colors flex items-center gap-1 border border-emerald-200/80"
                      title="Open full project technical documentation & Word export"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Dossier</span>
                    </button>

                    {/* Booth QR Code */}
                    <button
                      onClick={() => setSelectedProjectQR(proj)}
                      className="p-1.5 text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 rounded border border-stone-200 transition-colors"
                      title="Generate Booth QR Code Placard"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>

                    {/* Vote For Project */}
                    <button
                      onClick={() => handleVote(proj.id)}
                      disabled={votingId === proj.id}
                      className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{votingId === proj.id ? 'Voting...' : 'Vote'}</span>
                    </button>

                    {/* Judge Scorecard (if judge) */}
                    {canJudge && (
                      <button
                        onClick={() => setJudgeScoreModalProject(proj)}
                        className="p-1.5 bg-stone-100 hover:bg-amber-50 hover:text-amber-800 text-stone-700 rounded border border-stone-200 transition-colors"
                        title="Open Official Judge Scorecard"
                      >
                        <Award className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* Comprehensive Project Dossier & Word Document Modal */}
      {/* ============================================================== */}
      {dossierProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                      Technical Dossier & Word Report
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-stone-800 text-stone-300 rounded font-mono">
                      {dossierProject.boothNumber}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white truncate max-w-md sm:max-w-xl">
                    {dossierProject.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Download Word Document */}
                <button
                  onClick={() => exportSingleProjectWord(dossierProject)}
                  disabled={isExportingWord}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                  title="Download complete technical documentation as Microsoft Word (.doc)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingWord ? 'Exporting...' : 'Download Word (.doc)'}</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setDossierProject(null)}
                  className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs Bar */}
            <div className="flex items-center justify-between px-6 bg-stone-100 border-b border-stone-200 shrink-0">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <button
                  onClick={() => setDossierTab('dossier')}
                  className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
                    dossierTab === 'dossier'
                      ? 'border-emerald-700 text-emerald-900 font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Interactive Technical Dossier</span>
                </button>

                <button
                  onClick={() => setDossierTab('wordPreview')}
                  className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors ${
                    dossierTab === 'wordPreview'
                      ? 'border-emerald-700 text-emerald-900 font-bold'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Microsoft Word (.doc) Preview</span>
                </button>
              </div>

              <span className="text-[11px] text-stone-500 hidden sm:inline">
                Evaluation: <strong className="text-emerald-800">{dossierProject.judgeScore}/100</strong> &bull;{' '}
                <strong className="text-stone-800">{dossierProject.votesCount}</strong> Verified Votes
              </span>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {dossierTab === 'dossier' ? (
                /* TAB 1: INTERACTIVE DOSSIER */
                <>
                  {/* High-Resolution Prototype Screenshot & Meta Header */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Prototype Screenshot Container */}
                    <div className="space-y-2">
                      <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-900 shadow-xs group">
                        <img
                          src={dossierProject.imageUrl || '/src/assets/images/project_swarm_drones.jpg'}
                          alt={dossierProject.title}
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/src/assets/images/project_swarm_drones.jpg';
                          }}
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-[11px]">
                          <p className="font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>Figure 1: Verified Hardware Prototype & Telemetry Bench</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-400 text-center italic">
                        High-resolution engineering capture validated by Department of {dossierProject.department}
                      </p>
                    </div>

                    {/* Metadata & Quick Metrics */}
                    <div className="space-y-3.5">
                      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                          <span className="text-stone-500">Exhibition ID</span>
                          <span className="font-mono font-bold text-stone-900">{dossierProject.id}</span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                          <span className="text-stone-500">Category</span>
                          <span className="font-semibold text-emerald-800">{dossierProject.category}</span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                          <span className="text-stone-500">Lead Investigator</span>
                          <span className="font-semibold text-stone-900">{dossierProject.leadStudent}</span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                          <span className="text-stone-500">Research Team</span>
                          <span className="font-semibold text-stone-800">
                            {dossierProject.teamMembers.join(', ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                          <span className="text-stone-500">Faculty Supervisor</span>
                          <span className="font-semibold text-stone-900">{dossierProject.advisor}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500">Department</span>
                          <span className="font-semibold text-stone-800">{dossierProject.department}</span>
                        </div>
                      </div>

                      {/* Tech Stack Pills */}
                      <div>
                        <span className="text-[11px] font-bold text-stone-700 block mb-1.5 uppercase tracking-wide">
                          Technology Stack & Tools
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {(dossierProject.techStack || ['ROS2', 'PyTorch', 'TypeScript', 'Node.js', 'C++']).map(
                            (t, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-semibold rounded-md text-xs border border-emerald-200"
                              >
                                {t}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Official Voting & Score Banner */}
                      <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-800 text-white rounded-xl shadow-xs">
                        <div>
                          <span className="text-[10px] text-emerald-200 uppercase font-semibold block">
                            Judge Score
                          </span>
                          <span className="text-lg font-bold">{dossierProject.judgeScore} / 100</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-200 uppercase font-semibold block">
                            Public Verified Votes
                          </span>
                          <span className="text-lg font-bold">{dossierProject.votesCount} Ballots</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Research Abstract */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      <span>Executive Abstract & Problem Statement</span>
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed text-justify">
                      {dossierProject.abstract || dossierProject.description}
                    </p>
                  </div>

                  {/* Key Engineering Specifications */}
                  {dossierProject.keySpecifications && dossierProject.keySpecifications.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
                        <Cpu className="w-4 h-4 text-emerald-700" />
                        <span>Key Engineering Specifications & Benchmark Metrics</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {dossierProject.keySpecifications.map((spec, i) => (
                          <div
                            key={i}
                            className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 flex items-start gap-2 text-xs text-stone-700"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comprehensive Documentation Sections */}
                  {dossierProject.documentation && (
                    <div className="space-y-4 pt-2">
                      {/* Methodology */}
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-emerald-700" />
                          <span>System Architecture & Research Methodology</span>
                        </h4>
                        <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                          {dossierProject.documentation.methodology}
                        </p>
                      </div>

                      {/* Results */}
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                          <Award className="w-4 h-4 text-emerald-700" />
                          <span>Experimental Validation & Benchmark Results</span>
                        </h4>
                        <p className="text-xs text-stone-600 leading-relaxed bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 text-emerald-950">
                          {dossierProject.documentation.results}
                        </p>
                      </div>

                      {/* Bill of Materials & Future Work Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                            <Wrench className="w-4 h-4 text-emerald-700" />
                            <span>Bill of Materials & Components</span>
                          </h4>
                          <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                            {dossierProject.documentation.billOfMaterials || 'Standard lab inventory components.'}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-emerald-700" />
                            <span>Future Roadmap & Commercialization</span>
                          </h4>
                          <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                            {dossierProject.documentation.futureWork}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* TAB 2: WORD DOCUMENT PREVIEW */
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-emerald-900 block font-bold">Microsoft Word Document Ready</strong>
                      <span className="text-emerald-700">
                        This view accurately reflects the layout, typography, tables, and embedded screenshot formatted
                        for Microsoft Word (.doc).
                      </span>
                    </div>
                    <button
                      onClick={() => exportSingleProjectWord(dossierProject)}
                      className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .doc File</span>
                    </button>
                  </div>

                  {/* Simulated Paper Word Page */}
                  <div className="bg-white border-2 border-stone-300 shadow-xl rounded-sm p-8 sm:p-12 text-stone-800 font-sans max-w-3xl mx-auto space-y-6">
                    {/* Word Letterhead */}
                    <div className="text-center border-b-2 border-emerald-800 pb-4">
                      <div className="text-[10px] tracking-widest text-emerald-800 font-bold uppercase">
                        CampusIQ Pro &bull; Center for Academic Innovation & Research
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mt-2">
                        Project Technical Dossier & Verification Report
                      </h1>
                      <div className="text-xs text-stone-500 italic mt-1">
                        Student Capstone Innovation Expo &bull; Academic Year 2026-2027
                      </div>
                    </div>

                    {/* Word Metadata Table */}
                    <table className="w-full text-xs border border-stone-300 border-collapse">
                      <tbody>
                        <tr className="border-b border-stone-300">
                          <td className="p-2 bg-stone-100 font-bold w-1/3 border-r border-stone-300">Project Title</td>
                          <td className="p-2 font-bold text-stone-900">{dossierProject.title}</td>
                        </tr>
                        <tr className="border-b border-stone-300">
                          <td className="p-2 bg-stone-100 font-bold border-r border-stone-300">Category & Booth</td>
                          <td className="p-2">
                            {dossierProject.category} &bull; {dossierProject.boothNumber}
                          </td>
                        </tr>
                        <tr className="border-b border-stone-300">
                          <td className="p-2 bg-stone-100 font-bold border-r border-stone-300">Lead Investigator</td>
                          <td className="p-2 font-semibold">{dossierProject.leadStudent}</td>
                        </tr>
                        <tr className="border-b border-stone-300">
                          <td className="p-2 bg-stone-100 font-bold border-r border-stone-300">Research Team</td>
                          <td className="p-2">{dossierProject.teamMembers.join(', ')}</td>
                        </tr>
                        <tr className="border-b border-stone-300">
                          <td className="p-2 bg-stone-100 font-bold border-r border-stone-300">Faculty Advisor</td>
                          <td className="p-2">{dossierProject.advisor}</td>
                        </tr>
                        <tr className="border-b border-stone-300">
                          <td className="p-2 bg-stone-100 font-bold border-r border-stone-300">Official Judge Score</td>
                          <td className="p-2 font-bold text-emerald-800">{dossierProject.judgeScore} / 100</td>
                        </tr>
                        <tr>
                          <td className="p-2 bg-stone-100 font-bold border-r border-stone-300">Placard Token</td>
                          <td className="p-2 font-mono text-[11px]">{dossierProject.qrCode}</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Screenshot in Word */}
                    {dossierProject.imageUrl && (
                      <div className="text-center p-3 border border-stone-200 bg-stone-50 rounded">
                        <img
                          src={dossierProject.imageUrl}
                          alt="Screenshot"
                          className="max-h-64 mx-auto rounded border border-stone-300 object-cover"
                        />
                        <p className="text-[10px] text-stone-500 italic mt-2">
                          Figure 1: Verified Engineering Prototype & Telemetry Bench
                        </p>
                      </div>
                    )}

                    {/* Abstract */}
                    <div className="space-y-1">
                      <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wide border-b border-stone-200 pb-1">
                        1. Executive Abstract
                      </h2>
                      <p className="text-xs text-stone-700 leading-relaxed text-justify">
                        {dossierProject.abstract || dossierProject.description}
                      </p>
                    </div>

                    {/* Specifications */}
                    {dossierProject.keySpecifications && (
                      <div className="space-y-1">
                        <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wide border-b border-stone-200 pb-1">
                          2. Technical Specifications
                        </h2>
                        <ul className="list-disc pl-5 text-xs text-stone-700 space-y-1">
                          {dossierProject.keySpecifications.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Methodology & Results */}
                    {dossierProject.documentation && (
                      <>
                        <div className="space-y-1">
                          <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wide border-b border-stone-200 pb-1">
                            3. System Architecture & Methodology
                          </h2>
                          <p className="text-xs text-stone-700 leading-relaxed text-justify">
                            {dossierProject.documentation.methodology}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wide border-b border-stone-200 pb-1">
                            4. Experimental Results
                          </h2>
                          <p className="text-xs text-stone-700 leading-relaxed text-justify">
                            {dossierProject.documentation.results}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wide border-b border-stone-200 pb-1">
                            5. Bill of Materials
                          </h2>
                          <p className="text-xs text-stone-700 leading-relaxed text-justify">
                            {dossierProject.documentation.billOfMaterials}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Signatures */}
                    <div className="grid grid-cols-3 gap-6 pt-8 text-center text-xs">
                      <div>
                        <div className="border-t border-stone-400 pt-1 font-bold">{dossierProject.leadStudent}</div>
                        <div className="text-[10px] text-stone-500">Student Lead</div>
                      </div>
                      <div>
                        <div className="border-t border-stone-400 pt-1 font-bold">{dossierProject.advisor}</div>
                        <div className="text-[10px] text-stone-500">Faculty Supervisor</div>
                      </div>
                      <div>
                        <div className="border-t border-stone-400 pt-1 font-bold">Dr. Sophia Vance</div>
                        <div className="text-[10px] text-stone-500">Board of Judges</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportSingleProjectWord(dossierProject)}
                  disabled={isExportingWord}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingWord ? 'Exporting Word...' : 'Download Word Report (.doc)'}</span>
                </button>
                <button
                  onClick={() => setDossierProject(null)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Project Booth QR Modal */}
      {/* ============================================================== */}
      {selectedProjectQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center">
              <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest font-semibold">
                Expo Arena Booth Placard QR
              </span>
              <h3 className="text-sm font-bold text-stone-900 mt-1">{selectedProjectQR.title}</h3>
              <p className="text-xs text-stone-500 font-semibold">{selectedProjectQR.boothNumber}</p>
            </div>

            <QRCodeView
              value={selectedProjectQR.qrCode}
              size={160}
              subtitle="Scan with mobile to view capstone summary & submit vote"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onVerifyToken(selectedProjectQR.qrCode);
                  setSelectedProjectQR(null);
                }}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Test Scan Booth QR
              </button>
              <button
                onClick={() => setSelectedProjectQR(null)}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Judge Scoring Modal */}
      {/* ============================================================== */}
      {judgeScoreModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-stone-900">Official Judge Scorecard</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Evaluating: <strong>{judgeScoreModalProject.title}</strong>
            </p>

            <form onSubmit={handleJudgeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Technical Innovation & Novelty (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={scores.innovation}
                  onChange={(e) => setScores({ ...scores, innovation: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Architecture & Engineering Rigor (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={scores.architecture}
                  onChange={(e) => setScores({ ...scores, architecture: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Real-World Societal / Industrial Impact (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={scores.impact}
                  onChange={(e) => setScores({ ...scores, impact: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setJudgeScoreModalProject(null)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Submit Official Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Submit Capstone Project Modal with Screenshot Selection */}
      {/* ============================================================== */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-stone-900 mb-1">Submit Capstone Project for Expo</h3>
            <p className="text-xs text-stone-500 mb-4">
              Registers project into the live expo leaderboard, assigns booth placard, and generates a technical Word
              dossier.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vision-Guided Quadruped Inspection Robot"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Category</label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  >
                    <option value="AI & Robotics">AI & Robotics</option>
                    <option value="Biomedical & IoT">Biomedical & IoT</option>
                    <option value="Cybersecurity & Web3">Cybersecurity & Web3</option>
                    <option value="Smart IoT & Robotics">Smart IoT & Robotics</option>
                    <option value="Clean Tech & Automotive">Clean Tech & Automotive</option>
                    <option value="AR/VR & Education">AR/VR & Education</option>
                    <option value="Aerospace & Telecom">Aerospace & Telecom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Booth Number</label>
                  <input
                    type="text"
                    value={newProject.boothNumber}
                    onChange={(e) => setNewProject({ ...newProject, boothNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Student Lead</label>
                  <input
                    type="text"
                    placeholder="Aarav Sharma"
                    value={newProject.leadStudent}
                    onChange={(e) => setNewProject({ ...newProject, leadStudent: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Faculty Advisor</label>
                  <input
                    type="text"
                    value={newProject.advisor}
                    onChange={(e) => setNewProject({ ...newProject, advisor: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Team Members (comma-separated)</label>
                <input
                  type="text"
                  required
                  placeholder="Aarav Sharma, Maya Lin, Karan Verma"
                  value={newProject.teamMembers}
                  onChange={(e) => setNewProject({ ...newProject, teamMembers: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              {/* Prototype Screenshot Selector */}
              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Prototype Screenshot / Architecture Capture
                </label>
                <select
                  value={newProject.imageUrl}
                  onChange={(e) => setNewProject({ ...newProject, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                >
                  {imagePresets.map((preset, i) => (
                    <option key={i} value={preset.url}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                {newProject.imageUrl && (
                  <div className="mt-2 h-24 rounded-lg overflow-hidden border border-stone-300">
                    <img src={newProject.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  placeholder="ROS2, PyTorch, C++, Edge Impulse"
                  value={newProject.techStack}
                  onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Description / Abstract</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Problem statement, system architecture, and measurable outcomes..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Key Specifications (one per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Sub-centimeter obstacle avoidance&#10;120 fps onboard stereo SLAM"
                  value={newProject.keySpecifications}
                  onChange={(e) => setNewProject({ ...newProject, keySpecifications: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Register Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

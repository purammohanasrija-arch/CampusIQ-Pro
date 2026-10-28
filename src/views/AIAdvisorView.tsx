/**
 * CampusIQ Pro — AI Student Advisor & Career Roadmap (Gemini 3.8 Flash)
 * Personalized curriculum evaluation, upcoming exam prep, library loan alerts, and career roadmap builder.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  GraduationCap,
  TrendingUp,
  BookOpen,
  Calendar,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Student, UserRole } from '../types/campus';
import { api } from '../services/api';

interface AIAdvisorViewProps {
  student: Student;
  userRole: UserRole;
}

export const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({
  student,
  userRole,
}) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; source?: string }>>([
    {
      role: 'assistant',
      content: `Hello ${student.name}! I am your **CampusIQ Pro Academic & Career Advisor**, powered by real-time university database records and Gemini 3.8 Flash intelligence.

I have synchronized your profile:
- **Curriculum:** ${student.course} (${student.year}, ${student.semester})
- **Current GPA:** ${student.gpa} / 4.0
- **Overall Attendance:** ${student.attendancePercentage}% (Minimum institutional threshold: 75%)
- **Autumn 2026 Exams:** CS601 Distributed Systems (Nov 20), CS602 Machine Learning (Nov 23), CS603 Compilers (Nov 26)

How can I assist your academic journey or career milestone roadmap today?`,
      source: 'gemini-3.8-flash'
    }
  ]);
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'Analyze my current attendance & upcoming exam readiness',
    'Generate a 90-day career roadmap for Autonomous Systems',
    'Evaluate my library loans, return deadlines, and overdue fines',
    'Recommend high-impact capstone project ideas with ROS 2'
  ];

  const handleSend = async (userPromptText?: string) => {
    const textToSend = userPromptText || prompt;
    if (!textToSend.trim() || loading) return;

    const newMsgs = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(newMsgs);
    setPrompt('');
    setLoading(true);

    try {
      const res = await api.askAIAdvisor(textToSend, student.id);
      setMessages([...newMsgs, { role: 'assistant', content: res.reply, source: res.source }]);
    } catch (err: any) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: 'Unable to reach the advisory engine. Please verify network connectivity.',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>AI Student Academic Advisor & Career Roadmap</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Gemini 3.8 Flash</span>
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Grounded in permitted student records: attendance history, exam timetables, library circulation, and verified achievements.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
          <span>Active Context: <strong className="text-stone-800">{student.name} ({student.rollNumber})</strong></span>
        </div>
      </div>

      {/* Main Chat & Guidance Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-emerald-800 text-white font-medium rounded-tr-xs'
                    : 'bg-stone-50 text-stone-800 border border-stone-200/80 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line prose prose-xs max-w-none">
                  {msg.content}
                </div>

                {msg.source && (
                  <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                    <span>Engine: {msg.source}</span>
                    <span>Database Synchronized</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
              </div>
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 text-stone-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-stone-400 text-[11px] ml-1">Analyzing university databases & synthesizing strategy...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-2 bg-stone-50 border-t border-stone-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold uppercase text-stone-400 shrink-0">Suggestions:</span>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 rounded-md whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask anything regarding your courses, exam strategies, library loans, or career plans..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:bg-white text-stone-900"
          />
          <button
            onClick={() => handleSend()}
            disabled={!prompt.trim() || loading}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Ask Advisor</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

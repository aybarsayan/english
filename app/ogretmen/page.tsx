"use client";

import { useState } from "react";
import { formatDuration } from "@/lib/nameUtils";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface Session {
  id: string;
  messages: Message[];
  duration: number;
  createdAt: string;
}

interface Student {
  studentName: string;
  firstName: string;
  lastName: string;
  totalDuration: number;
  sessionCount: number;
  sessions: Session[];
}

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

export default function TeacherDashboard() {
  const [selectedGrade, setSelectedGrade] = useState<number | "">("");
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const fetchStudents = async () => {
    if (!selectedGrade || !selectedSection) {
      setError("Lütfen sınıf ve şube seçin");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/voice-sessions?grade=${selectedGrade}&section=${selectedSection}`
      );
      const data = await res.json();

      if (res.ok) {
        setStudents(data.students);
        if (data.students.length === 0) {
          setError("Bu sınıfta henüz konuşma kaydı yok");
        }
      } else {
        setError(data.error || "Veriler alınamadı");
      }
    } catch {
      setError("Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Class Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Sınıf Seçin
        </h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Sınıf
            </label>
            <select
              value={selectedGrade}
              onChange={(e) =>
                setSelectedGrade(e.target.value ? parseInt(e.target.value) : "")
              }
              className="px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none min-w-[120px]"
            >
              <option value="">Seçin</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}. Sınıf
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Şube
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none min-w-[120px]"
            >
              <option value="">Seçin</option>
              {SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {s} Şubesi
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchStudents}
            disabled={isLoading || !selectedGrade || !selectedSection}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Yükleniyor..." : "Görüntüle"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-amber-600 text-sm bg-amber-50 px-4 py-2 rounded-lg">
            {error}
          </p>
        )}
      </div>

      {/* Students List */}
      {students.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedGrade}/{selectedSection} Sınıfı Öğrencileri
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {students.length} öğrenci, toplam{" "}
              {students.reduce((acc, s) => acc + s.sessionCount, 0)} konuşma
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {students.map((student) => (
              <div key={student.studentName}>
                {/* Student Row */}
                <button
                  onClick={() =>
                    setExpandedStudent(
                      expandedStudent === student.studentName
                        ? null
                        : student.studentName
                    )
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold">
                        {student.firstName.charAt(0)}
                        {student.lastName.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {student.sessionCount} konuşma
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-indigo-600">
                        {formatDuration(student.totalDuration)}
                      </p>
                      <p className="text-xs text-gray-500">toplam süre</p>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        expandedStudent === student.studentName
                          ? "rotate-180"
                          : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Expanded Sessions */}
                {expandedStudent === student.studentName && (
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                    <h3 className="text-sm font-medium text-gray-600 mb-3">
                      Konuşma Geçmişi
                    </h3>
                    <div className="space-y-3">
                      {student.sessions.map((session, idx) => (
                        <div
                          key={session.id}
                          className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                        >
                          {/* Session Header */}
                          <button
                            onClick={() =>
                              setExpandedSession(
                                expandedSession === session.id
                                  ? null
                                  : session.id
                              )
                            }
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-600">
                                #{student.sessions.length - idx}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDate(session.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-indigo-600">
                                {formatDuration(session.duration)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {session.messages.length} mesaj
                              </span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 text-gray-400 transition-transform ${
                                  expandedSession === session.id
                                    ? "rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </button>

                          {/* Session Transcript */}
                          {expandedSession === session.id && (
                            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 max-h-80 overflow-y-auto">
                              {session.messages.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">
                                  Mesaj kaydı yok
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {session.messages.map((msg) => (
                                    <div
                                      key={msg.id}
                                      className={`p-2 rounded-lg text-sm ${
                                        msg.isUser
                                          ? "bg-blue-100 text-blue-800 ml-8"
                                          : "bg-purple-100 text-purple-800 mr-8"
                                      }`}
                                    >
                                      <span className="font-medium">
                                        {msg.isUser ? "Öğrenci: " : "Kai: "}
                                      </span>
                                      {msg.text}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && students.length === 0 && selectedGrade && selectedSection && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <p className="text-gray-500">
            Sınıf ve şube seçerek öğrenci konuşmalarını görüntüleyin
          </p>
        </div>
      )}
    </div>
  );
}

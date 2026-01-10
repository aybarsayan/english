"use client";

import { useState, useEffect } from "react";
import { StudentInfo } from "@/lib/types";
import { normalizeName } from "@/lib/nameUtils";

interface StudentRegistrationFormProps {
  onSubmit: (studentInfo: StudentInfo) => void;
  onCancel?: () => void;
}

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

const STORAGE_KEY = "kai_student_info";

export default function StudentRegistrationForm({
  onSubmit,
  onCancel,
}: StudentRegistrationFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [grade, setGrade] = useState<number | "">("");
  const [section, setSection] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load from sessionStorage on mount
  useEffect(() => {
    const loadSavedInfo = () => {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as StudentInfo;
          setFirstName(parsed.firstName);
          setLastName(parsed.lastName);
          setGrade(parsed.grade);
          setSection(parsed.section);
        }
      } catch {
        // Ignore parse errors
      }
    };
    loadSavedInfo();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "Adınızı yazın";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Soyadınızı yazın";
    }
    if (!grade) {
      newErrors.grade = "Sınıfınızı seçin";
    }
    if (!section) {
      newErrors.section = "Şubenizi seçin";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const studentInfo: StudentInfo = {
      firstName: normalizeName(firstName),
      lastName: normalizeName(lastName),
      grade: grade as number,
      section: section,
    };

    // Save to sessionStorage
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(studentInfo));
    } catch {
      // Ignore storage errors
    }

    onSubmit(studentInfo);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-purple-600">Merhaba!</h2>
          <p className="text-gray-500 mt-1">
            Kai ile konuşmadan önce kendini tanıt
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adın
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ali"
              className={`w-full px-4 py-3 rounded-xl border-2 text-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all ${
                errors.firstName
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-purple-400"
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Soyadın
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Yılmaz"
              className={`w-full px-4 py-3 rounded-xl border-2 text-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all ${
                errors.lastName
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 focus:border-purple-400"
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          {/* Grade & Section Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sınıfın
              </label>
              <select
                value={grade}
                onChange={(e) =>
                  setGrade(e.target.value ? parseInt(e.target.value) : "")
                }
                className={`w-full px-4 py-3 rounded-xl border-2 text-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all appearance-none bg-white ${
                  errors.grade
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 focus:border-purple-400"
                }`}
              >
                <option value="">Seç</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}. Sınıf
                  </option>
                ))}
              </select>
              {errors.grade && (
                <p className="text-red-500 text-sm mt-1">{errors.grade}</p>
              )}
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şuben
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 text-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all appearance-none bg-white ${
                  errors.section
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 focus:border-purple-400"
                }`}
              >
                <option value="">Seç</option>
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s} Şubesi
                  </option>
                ))}
              </select>
              {errors.section && (
                <p className="text-red-500 text-sm mt-1">{errors.section}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
          >
            Kai ile Konuşmaya Başla!
          </button>

          {/* Cancel Button */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm"
            >
              Vazgeç
            </button>
          )}
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Bilgilerin sadece öğretmenin görebileceği şekilde kaydedilir.
        </p>
      </div>
    </div>
  );
}

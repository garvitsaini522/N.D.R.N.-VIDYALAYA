import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  GraduationCap,
  Mail,
  Star,
  Sparkles,
  School,
  Heart,
  Palette,
  Activity,
  MessageCircle,
  Camera,
  CheckCircle2,
  Users
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import SectionHeading from '../../components/common/SectionHeading';
import { Card } from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { SCHOOL_CONFIG } from '../../config/schoolConfig';
import { api } from '../../services/api';

export default function Faculty() {
  const [selectedWing, setSelectedWing] = useState('All');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTeachers() {
      try {
        const list = await api.getTeachers();
        if (isMounted) {
          setTeachers(Array.isArray(list) ? list : []);
        }
      } catch {
        if (isMounted) setTeachers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTeachers();
    return () => {
      isMounted = false;
    };
  }, []);

  const wings = ['All', 'Pre-Primary', 'Primary', 'Activities'];

  const filtered = selectedWing === 'All'
    ? teachers
    : teachers.filter((m) => m.wing === selectedWing || (m.assignedClasses && m.assignedClasses.some((c) => c.includes(selectedWing))));

  return (
    <PageContainer
      title={`Faculty & Educators at ${SCHOOL_CONFIG.name}`}
      subtitle={`Dedicated teachers guiding young learners from ${SCHOOL_CONFIG.levels} in ${SCHOOL_CONFIG.location.displayLocation}.`}
      badge="TEACHING STAFF"
      breadcrumbs={[{ label: 'Faculty' }]}
    >
      <div className="space-y-16">
        {/* 1. Principal / Head of Institution Feature */}
        <div className="bg-cream-100/60 rounded-3xl border border-cream-200 p-8 sm:p-10 shadow-soft-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Leadership Emblem */}
            <div className="md:col-span-4 text-center md:text-left flex flex-col items-center md:items-start">
              {SCHOOL_CONFIG.leadership.image ? (
                <img
                  src={SCHOOL_CONFIG.leadership.image}
                  alt={SCHOOL_CONFIG.leadership.name || 'D.K. Saini'}
                  className="w-36 h-36 rounded-3xl object-cover border-2 border-cream-300 shadow-soft-md mb-4"
                />
              ) : (
                <div className="w-36 h-36 rounded-3xl bg-gradient-to-br from-brown-950 to-brown-800 border-2 border-gold-400/30 flex flex-col items-center justify-center text-white shadow-soft-md mb-4 p-4 text-center">
                  <GraduationCap className="w-12 h-12 text-gold-400 mb-1" />
                  <span className="text-xs font-bold text-cream-100 block">D.K. Saini</span>
                  <span className="text-[10px] text-cream-200/80">Head of Institution</span>
                </div>
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-saffron-600">
                {SCHOOL_CONFIG.leadership.title}
              </span>
              <h3 className="text-xl font-black text-brown-800 mt-0.5">
                {SCHOOL_CONFIG.leadership.name || 'D.K. Saini'}
              </h3>
              <p className="text-xs text-brown-600 mt-0.5">
                {SCHOOL_CONFIG.leadership.designation}
              </p>
            </div>

            {/* Content & Quote */}
            <div className="md:col-span-8 md:border-l md:border-cream-200 md:pl-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brown-500 block">
                Academic Leadership
              </span>
              <h4 className="text-xl font-bold text-brown-800">
                Fostering an Inspiring and Caring Foundation
              </h4>
              <p className="text-xs sm:text-sm text-brown-800 leading-relaxed italic bg-white p-4 rounded-xl border border-cream-200">
                “{SCHOOL_CONFIG.leadership.message}”
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-brown-600">
                <span className="flex items-center gap-1.5 font-semibold text-brown-800">
                  <School className="w-4 h-4 text-saffron-600" />
                  <span>{SCHOOL_CONFIG.name}</span>
                </span>
                <span>•</span>
                <span>{SCHOOL_CONFIG.location.displayLocation}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Faculty Directory with Wing Filter */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <SectionHeading
              badge="EDUCATOR ROSTER"
              title="Classroom Teachers &"
              highlight="Staff"
              subtitle="Our teaching faculty and educators at Daulatyarpur campus."
              align="left"
              className="mb-0"
            />

            {/* Wing Filter */}
            {teachers.length > 0 && (
              <div className="flex flex-wrap gap-1.5 bg-cream-100 p-1.5 rounded-2xl self-start sm:self-auto border border-cream-200">
                {wings.map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWing(w)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedWing === w
                        ? 'bg-saffron-500 text-white shadow-2xs font-bold'
                        : 'text-brown-600 hover:text-brown-800'
                    }`}
                  >
                    {w} Wing
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Teacher Cards Grid or Empty State */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((teacher) => (
                <Card key={teacher.id || teacher._id} className="p-6 bg-white flex flex-col justify-between border-cream-200">
                  <div>
                    <div className="h-32 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-200/90 border border-cream-200 flex flex-col items-center justify-center text-brown-500 p-4 text-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-white shadow-soft-sm flex items-center justify-center text-saffron-600 font-extrabold text-lg border border-cream-200">
                        {(teacher.name || 'T').charAt(0)}
                      </div>
                    </div>

                    <div className="mb-2">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cream-200 text-saffron-700 border border-gold-400/30 mb-1">
                        {teacher.designation || 'Faculty Member'}
                      </span>
                      <h3 className="text-base font-bold text-brown-800">
                        {teacher.name}
                      </h3>
                    </div>

                    {teacher.qualification && (
                      <div className="text-xs text-brown-500 mb-1">
                        Qualification: {teacher.qualification}
                      </div>
                    )}

                    {teacher.primarySubjects && teacher.primarySubjects.length > 0 && (
                      <div className="text-xs font-semibold text-saffron-600 mb-3">
                        Subjects: {teacher.primarySubjects.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between text-[11px] text-brown-500">
                    <span>N.D.R.N. Vidyalaya</span>
                    <span className="font-semibold text-saffron-600">Daulatyarpur</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No faculty profiles published yet"
              description="Teaching staff assignments and profiles will be published here when updated by administration. Please contact the school office for teacher details."
            />
          )}
        </div>

        {/* 3. Note for Parents */}
        <div className="p-6 rounded-2xl bg-white border border-cream-200 text-center max-w-2xl mx-auto shadow-2xs">
          <Sparkles className="w-5 h-5 text-gold-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-brown-800">
            Dedicated Educators in Daulatyarpur, Madhoganj
          </h4>
          <p className="text-xs text-brown-600 mt-1">
            Our teachers maintain close contact with parents through regular academic updates and meetings to ensure consistent learning at school and home.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

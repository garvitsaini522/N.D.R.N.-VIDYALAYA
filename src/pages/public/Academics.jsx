import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Award,
  Check,
  CheckCircle2,
  FileCheck,
  Layers,
  Sparkles,
  Brain,
  Baby,
  Smile,
  Palette,
  Heart,
  HelpCircle,
  ArrowRight,
  School,
  Receipt,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  Info,
  Maximize2,
  X,
  RefreshCw,
  AlertCircle,
  Bus
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import SectionHeading from '../../components/common/SectionHeading';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import AdmissionEnquiryForm from '../../components/common/AdmissionEnquiryForm';
import { SCHOOL_CONFIG } from '../../config/schoolConfig';
import { api } from '../../services/api';
import { DataService } from '../../services/dataService';

// Comprehensive Course & Curriculum specifications for each class
const CLASS_COURSE_DETAILS = {
  nursery: {
    medium: 'Bilingual (Hindi & English foundational immersion)',
    timing: '8:30 AM – 12:30 PM (Pre-Primary schedule)',
    weeklyLoad: '24 Interactive Activity Periods / Week',
    subjectList: [
      { name: 'Early Rhymes & Phonetics (बालगीत व स्वर)', desc: 'Bilingual action songs, clear phonetic pronunciation, and listening joy.' },
      { name: 'Sensory Play & Observation (इंद्रिय विकास)', desc: 'Texture exploration, object sorting, shape recognition, and curiosity games.' },
      { name: 'Colors, Shapes & Clay Play (रंग व मिट्टी कला)', desc: 'Color identification, basic geometry shapes, and fine motor finger grip.' },
      { name: 'Pre-Numeracy Concepts (प्रारंभिक अंक ज्ञान)', desc: 'Concepts of big/small, tall/short, counting concrete items and toys.' },
      { name: 'Social Habits & Morning Prayer (संस्कार व आदतें)', desc: 'Sharing, polite words, sitting discipline, peer friendliness, and morning assembly.' },
    ],
    outcomes: [
      'Spontaneous verbal communication in mother tongue and basic English greeting phrases',
      'Strong pincer grasp for crayons, clay moulding, and paper folding exercises',
      'Emotional comfort in daily classroom routine, cooperative play, and habit formation',
      'Recognition of basic primary colors, common animals, fruits, and everyday shapes',
    ],
  },
  kindergarten: {
    medium: 'Bilingual (Hindi & English structured foundation)',
    timing: '8:00 AM – 1:00 PM (Kindergarten schedule)',
    weeklyLoad: '28 Structured Periods / Week',
    subjectList: [
      { name: 'English Phonics & Tracing', desc: 'Alphabet phonics, 3-letter CVC word blending, and neat line tracing.' },
      { name: 'Hindi Varnamala (हिन्दी स्वर व व्यंजन)', desc: 'अक्षर पहचान, चित्र मिलान, प्रारंभिक शब्द वाचन और सुलेख अभ्यास।' },
      { name: 'Foundational Numbers (अंक 1 से 50)', desc: 'Counting, missing numbers, before/after concepts, and basic patterns.' },
      { name: 'Environmental Awareness (परिवेश अध्ययन)', desc: 'My Family, Body Parts, Seasons, Animals, Neighborhood, and Hygiene.' },
      { name: 'Creative Arts & Crafts (चित्रकला व शिल्प)', desc: 'Coloring within boundaries, paper tearing, folding, and festive craft.' },
      { name: 'Physical Coordination & Drills (शारीरिक खेल)', desc: 'Free play, line formation, balance games, and joyful morning drills.' },
    ],
    outcomes: [
      'Independent pencil holding with ability to write letters and numerals 1–50 neatly',
      'Blending 3-letter phonetic words (cat, pin, sun) and reading simple flashcards',
      'Clear identification of Hindi Swar (अ से अ:) and introductory Vyanjan (क से ज्ञ)',
      'Basic conversational confidence, polite classroom etiquette, and good hygiene habits',
    ],
  },
  class1: {
    medium: 'Bilingual (UP Board curriculum standard)',
    timing: '8:00 AM – 2:00 PM (Regular primary hours)',
    weeklyLoad: '32 Periods / Week with prescribed textbooks',
    subjectList: [
      { name: 'Hindi Language (हिन्दी भाषा व सुलेख)', desc: 'मात्रा ज्ञान, सरल शब्दों का पठन, सुलेख और नीतिपरक कविता पाठ।' },
      { name: 'English Reading & Phonics', desc: 'Sight words, short sentences, story comprehension, spelling & speaking.' },
      { name: 'Mathematics (प्राथमिक गणित)', desc: 'Numbers 1 to 100, single-digit addition, subtraction, shapes & money.' },
      { name: 'Environmental Studies (EVS)', desc: 'My Home, School, Neighborhood, Plant parts, Hygiene & Traffic safety.' },
      { name: 'Art & Craft (चित्रकला व रचनात्मक शिल्प)', desc: 'Drawing familiar objects, color blending, craft models & origami.' },
      { name: 'Moral Values & Physical Education', desc: 'Morning assembly, ethical stories, discipline, drills & team games.' },
    ],
    outcomes: [
      'Independent reading of simple Hindi and English sentences with proper pronunciation',
      'Confident single-digit arithmetic calculations and basic mental math problem solving',
      'Clear comprehension of immediate natural environment and community helpers',
      'Neat handwriting habit in prescribed four-line and double-line notebooks',
    ],
  },
  class2: {
    medium: 'Bilingual (UP Board curriculum standard)',
    timing: '8:00 AM – 2:00 PM',
    weeklyLoad: '34 Periods / Week',
    subjectList: [
      { name: 'Hindi (हिन्दी गद्य, पद्य व व्याकरण)', desc: 'संयुक्त वर्ण, वाक्य निर्माण, सुलेख, विलोम शब्द और शिक्षाप्रद कहानियां।' },
      { name: 'English (Reader & Grammar)', desc: 'Nouns, verbs, singular/plural, reading comprehension & everyday conversation.' },
      { name: 'Mathematics (अंकगणित व ज्यामिति)', desc: '2-digit addition with carry, subtraction with borrow, tables 2–10 & clock.' },
      { name: 'Environmental Studies (EVS)', desc: 'Living vs non-living, weather, food sources, community services & hygiene.' },
      { name: 'Art, Music & Moral Education', desc: 'Freehand sketching, patriotic songs, truthfulness, and mutual respect.' },
      { name: 'Physical Education & Games', desc: 'Sprint races, yoga postures, ball games, and physical coordination drills.' },
    ],
    outcomes: [
      'Fluent reading comprehension of short paragraphs and answering questions in own words',
      'Fluency in multiplication tables up to 10 and solving 2-digit practical word problems',
      'Understanding of plant life, animal care, water conservation, and personal hygiene',
      'Cooperative teamwork in playground games and disciplined assembly participation',
    ],
  },
  class3: {
    medium: 'Bilingual (UP Board curriculum standard)',
    timing: '8:00 AM – 2:00 PM',
    weeklyLoad: '36 Periods / Week',
    subjectList: [
      { name: 'Hindi (हिन्दी साहित्य व व्याकरण)', desc: 'संज्ञा, सर्वनाम, विशेषण, विलोम, पर्यायवाची, सुलेख, निबंध व संवाद लेखन।' },
      { name: 'English (Textbook & Grammar)', desc: 'Tenses intro, prepositions, adjectives, paragraph composition & speaking.' },
      { name: 'Mathematics (गणित)', desc: 'Multiplication, division, 3-digit place value, money, length, weight & capacity.' },
      { name: 'Environmental Science (EVS)', desc: 'Water cycle, natural habitats, human body organs, maps intro & weather.' },
      { name: 'Computer Awareness & GK', desc: 'Computer parts, monitor, keyboard, national symbols & current general knowledge.' },
      { name: 'Sports, Art & Life Skills', desc: 'Drawing, craft projects, athletics, discipline, and ethical value lessons.' },
    ],
    outcomes: [
      'Expressive creative writing of short descriptive paragraphs in both Hindi and English',
      'Multi-digit multiplication and division calculations with applied real-world logic',
      'Scientific reasoning about natural resources, seasons, personal health, and cleanliness',
      'Introductory computer navigation and basic keyboard typing awareness',
    ],
  },
  class4: {
    medium: 'Bilingual (UP Board curriculum standard)',
    timing: '8:00 AM – 2:00 PM',
    weeklyLoad: '36 Periods / Week',
    subjectList: [
      { name: 'Hindi (साहित्य, व्याकरण व पत्र-लेखन)', desc: 'मुहावरे, संधि परिचय, औपचारिक/अनौपचारिक पत्र-लेखन, व्याकरण व अपठित गद्यांश।' },
      { name: 'English (Language & Composition)', desc: 'Tenses, active sentence construction, comprehension, speech & creative essays.' },
      { name: 'Mathematics (व्यावहारिक गणित)', desc: 'Fractions intro, factors, multiples, perimeter, metric units & clock arithmetic.' },
      { name: 'Environmental Science & Social Studies', desc: 'States of matter, energy sources, community institutions & Indian geography.' },
      { name: 'Computer Science & Art', desc: 'Word processing basics, keyboard practice, poster drawing & color painting.' },
      { name: 'Physical Training & Co-Curricular', desc: 'Inter-house competitions, dodgeball, yoga, marching, and leadership drills.' },
    ],
    outcomes: [
      'Independent composition of letters, essays, and stories in both Hindi and English',
      'Solid command over fractional calculations, geometric shapes, and practical units',
      'Awareness of Indian geography, civic responsibilities, and ecological conservation',
      'Active participation in school debates, exhibitions, and athletic meets',
    ],
  },
  class5: {
    medium: 'Bilingual (UP Board curriculum standard)',
    timing: '8:00 AM – 2:00 PM (Primary Graduating Wing)',
    weeklyLoad: '36 Periods / Week',
    subjectList: [
      { name: 'Hindi (विस्तृत साहित्य, व्याकरण व रचना)', desc: 'काव्य पाठ, गद्य विश्लेषण, शुद्ध वर्तनी, निबंध, व्याकरण व वाक्-कौशल।' },
      { name: 'English (Literature, Grammar & Public Speaking)', desc: 'Complex sentences, vocabulary enrichment, dialogues, essays & recitation.' },
      { name: 'Mathematics (उन्नत प्राथमिक गणित)', desc: 'Decimals, unitary method, area/perimeter, volume basics & data charts.' },
      { name: 'Science & Social Studies (EVS)', desc: 'Human body systems, environmental conservation, Indian history & civics.' },
      { name: 'Computer Skills & General Awareness', desc: 'File handling, typing agility, presentations, and general knowledge quiz.' },
      { name: 'Physical Education & House Leadership', desc: 'Captaincy, discipline, drill marching, athletics, and cultural arts.' },
    ],
    outcomes: [
      'Primary school graduation readiness with strong scholastic fundamentals',
      'Confident bilingual public speaking, neat presentation, and analytical composition',
      'Mastery of unitary method, decimal arithmetic, and geometric problem-solving',
      'Exemplary character, civic responsibility, and readiness for middle school',
    ],
  },
};

// Canonical baseline Fee Schedules for each class cohort
const CLASS_BASE_FEES = {
  nursery: {
    classGrade: 'Nursery',
    admissionFee: 500,
    monthlyTuitionFee: 300,
    annualCharges: 600,
    otherCharges: 200,
    busFee: 250,
    academicSession: '2026-27',
    termPlan: 'Payable monthly by 10th of every month or quarterly in advance',
    inclusions: [
      'Play-based activity materials & sensory discovery supplies',
      'Art, coloring sheets & motor development craft items',
      'Regular health & physical milestone tracking records',
      'Terminal evaluation sheets and developmental progress card',
    ],
  },
  kindergarten: {
    classGrade: 'LKG & UKG',
    admissionFee: 600,
    monthlyTuitionFee: 350,
    annualCharges: 700,
    otherCharges: 250,
    busFee: 250,
    academicSession: '2026-27',
    termPlan: 'Payable monthly by 10th of every month or quarterly in advance',
    inclusions: [
      'Alphabet & number tracing activity workbooks',
      'Phonics listening charts & story sessions',
      'Annual co-curricular sports day & celebration activities',
      'Terminal progress report cards and parent-teacher consultations',
    ],
  },
  class1: {
    classGrade: 'Class 1',
    admissionFee: 800,
    monthlyTuitionFee: 400,
    annualCharges: 800,
    otherCharges: 250,
    busFee: 300,
    academicSession: '2026-27',
    termPlan: 'Payable monthly by 10th of every month or quarterly in advance',
    inclusions: [
      'Language reading materials & arithmetic practice sets',
      'Environmental studies project kits & charts',
      'School diary, identity card & progress report register',
      'Co-curricular sports, drawing, and cultural event participation',
    ],
  },
  class2: {
    classGrade: 'Class 2',
    admissionFee: 800,
    monthlyTuitionFee: 450,
    annualCharges: 850,
    otherCharges: 250,
    busFee: 300,
    academicSession: '2026-27',
    termPlan: 'Payable monthly by 10th of every month or quarterly in advance',
    inclusions: [
      'Bilingual handwriting & comprehension worksheets',
      'Mathematics logic drill sheets & science observation exercises',
      'Terminal examination stationery & certified report card',
      'Physical education coaching and moral assembly sessions',
    ],
  },
  class3: {
    classGrade: 'Class 3',
    admissionFee: 900,
    monthlyTuitionFee: 500,
    annualCharges: 900,
    otherCharges: 300,
    busFee: 350,
    academicSession: '2026-27',
    termPlan: 'Payable monthly by 10th of every month or quarterly in advance',
    inclusions: [
      'Comprehensive curriculum worksheets for Hindi, English & Maths',
      'Environmental science practical demonstrations & nature studies',
      'Half-yearly and annual examination assessments',
      'Team sports equipment, library reading time & quiz sessions',
    ],
  },
  class4: {
    classGrade: 'Class 4',
    admissionFee: 900,
    monthlyTuitionFee: 550,
    annualCharges: 950,
    otherCharges: 300,
    busFee: 350,
    academicSession: '2026-27',
    termPlan: 'Payable monthly by 10th of every month or quarterly in advance',
    inclusions: [
      'Advanced grammar & arithmetic problem-solving materials',
      'Science concept models & environmental awareness projects',
      'School sports meet, artistic exhibitions & speech competitions',
      'Structured term examinations and teacher diagnostic feedback',
    ],
  },
  class5: {
    classGrade: 'Class 5',
    admissionFee: 1000,
    monthlyTuitionFee: 600,
    annualCharges: 1000,
    otherCharges: 300,
    busFee: 400,
    academicSession: '2026-27',
    termPlan: 'Payable monthly by 10th of every month or quarterly in advance',
    inclusions: [
      'Primary wing graduation preparation & critical reasoning exercises',
      'Comprehensive bilingual essay, arithmetic & science projects',
      'Final primary completion certificate & character conduct record',
      'Inter-house sports, cultural programs, and student leadership drills',
    ],
  },
};

export default function Academics() {
  const [activeTab, setActiveTab] = useState('all');

  // Modal dialog states for Course Details, Fee Structure and Admission Enquiry
  const [courseModalLevel, setCourseModalLevel] = useState(null);
  const [feeModalLevel, setFeeModalLevel] = useState(null);
  const [enquiryModalLevel, setEnquiryModalLevel] = useState(null);
  const [liveFeeStructures, setLiveFeeStructures] = useState([]);
  const [liveCourses, setLiveCourses] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Independent in-card detail view states for each class (keyed by lvl.id: 'course' | 'fee' | null)
  const [expandedViews, setExpandedViews] = useState({});

  const toggleCourseView = (lvl) => {
    setExpandedViews((prev) => ({
      ...prev,
      [lvl.id]: prev[lvl.id] === 'course' ? null : 'course',
    }));
  };

  const toggleFeeView = (lvl) => {
    setExpandedViews((prev) => ({
      ...prev,
      [lvl.id]: prev[lvl.id] === 'fee' ? null : 'fee',
    }));
  };

  // Fetch live published course and fee records from backend/database with automated sync
  const fetchAcademicData = async () => {
    try {
      const [feeRes, courseRes] = await Promise.all([
        api.getPublicFeeStructure('2026-27'),
        api.getPublicCourses('2026-27'),
      ]);

      const fees = Array.isArray(feeRes) ? feeRes : (feeRes?.data || []);
      const courses = Array.isArray(courseRes) ? courseRes : (courseRes?.data || []);

      if (fees.length > 0) {
        setLiveFeeStructures(fees);
      } else {
        setLiveFeeStructures(DataService.getFeeStructures(true, '2026-27'));
      }

      if (courses.length > 0) {
        setLiveCourses(courses);
      } else {
        setLiveCourses(DataService.getCourses(true, '2026-27'));
      }
      setDataError(null);
    } catch (err) {
      console.warn('Academic live data fetch error:', err);
      // Seamless fallback to persistent DataService store
      try {
        setLiveFeeStructures(DataService.getFeeStructures(true, '2026-27'));
        setLiveCourses(DataService.getCourses(true, '2026-27'));
      } catch (fallbackErr) {
        setDataError('Academic specifications could not be loaded at this time.');
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAcademicData();

    const handleSync = () => fetchAcademicData();
    window.addEventListener('ndrn:fee-structure-updated', handleSync);
    window.addEventListener('ndrn:courses-updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('ndrn:fee-structure-updated', handleSync);
      window.removeEventListener('ndrn:courses-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Helper to resolve fee values for a given class
  const getFeeForLevel = (lvl) => {
    if (!lvl) return CLASS_BASE_FEES.nursery;
    const base = CLASS_BASE_FEES[lvl.id] || CLASS_BASE_FEES.class1;
    const matched = liveFeeStructures.find((f) => {
      const g = (f.classGrade || '').toLowerCase().trim();
      const t = (lvl.title || '').toLowerCase().trim();
      if (g === t) return true;
      if (lvl.id === 'kindergarten' && (g.includes('lkg') || g.includes('ukg') || g.includes('kindergarten'))) return true;
      if (lvl.id === 'nursery' && g.includes('nursery')) return true;
      if (lvl.id === 'class1' && (g.includes('1') || g.includes('one'))) return true;
      if (lvl.id === 'class2' && (g.includes('2') || g.includes('two'))) return true;
      if (lvl.id === 'class3' && (g.includes('3') || g.includes('three'))) return true;
      if (lvl.id === 'class4' && (g.includes('4') || g.includes('four'))) return true;
      if (lvl.id === 'class5' && (g.includes('5') || g.includes('five'))) return true;
      return false;
    });

    if (matched) {
      return {
        ...base,
        admissionFee: Number(matched.admissionFee ?? base.admissionFee),
        monthlyTuitionFee: Number(matched.monthlyTuitionFee ?? base.monthlyTuitionFee),
        annualCharges: Number(matched.annualCharges ?? base.annualCharges),
        otherCharges: Number(matched.otherCharges ?? base.otherCharges),
        busFee: Number(matched.busFee ?? base.busFee ?? 0),
        academicSession: matched.academicSession || base.academicSession,
        isVerified: Boolean(matched.isVerified),
        notes: matched.notes || '',
      };
    }
    return base;
  };

  // Helper to resolve Course details dynamically for a given class
  const getCourseForLevel = (lvl) => {
    if (!lvl) return CLASS_COURSE_DETAILS.nursery;
    const base = CLASS_COURSE_DETAILS[lvl.id] || CLASS_COURSE_DETAILS.class1;
    const matched = liveCourses.find((c) => {
      const g = (c.classGrade || '').toLowerCase().trim();
      const t = (lvl.title || '').toLowerCase().trim();
      if (g === t) return true;
      if (lvl.id === 'kindergarten' && (g.includes('lkg') || g.includes('ukg') || g.includes('kindergarten'))) return true;
      if (lvl.id === 'nursery' && g.includes('nursery')) return true;
      if (lvl.id === 'class1' && (g.includes('1') || g.includes('one'))) return true;
      if (lvl.id === 'class2' && (g.includes('2') || g.includes('two'))) return true;
      if (lvl.id === 'class3' && (g.includes('3') || g.includes('three'))) return true;
      if (lvl.id === 'class4' && (g.includes('4') || g.includes('four'))) return true;
      if (lvl.id === 'class5' && (g.includes('5') || g.includes('five'))) return true;
      return false;
    });

    if (matched) {
      return {
        ...base,
        medium: matched.medium || base.medium,
        timing: matched.timing || base.timing,
        weeklyLoad: matched.weeklyLoad || base.weeklyLoad,
        overview: matched.overview || base.overview,
        subjectList: Array.isArray(matched.subjectList) && matched.subjectList.length > 0 ? matched.subjectList : base.subjectList,
        outcomes: Array.isArray(matched.outcomes) && matched.outcomes.length > 0 ? matched.outcomes : base.outcomes,
        academicSession: matched.academicSession || '2026-27',
      };
    }
    return base;
  };

  // Academic Classes: Nursery, LKG/UKG (Configurable), Class 1, 2, 3, 4, 5
  const academicLevels = [
    {
      id: 'nursery',
      title: 'Nursery',
      stage: 'Pre-Primary',
      age: '3+ Years',
      configurable: false,
      overview: 'Early childhood discovery focusing on emotional security, sensory play, basic speech, and playful interaction.',
      curriculumPoints: [
        'Sensory exploration and playful discovery',
        'Introduction to rhymes, music, and listening skills',
        'Fine-motor skills with clay, coloring, and building blocks',
        'Early socialization and classroom habit formation',
      ],
    },
    {
      id: 'kindergarten',
      title: 'LKG & UKG',
      stage: 'Kindergarten (Configurable)',
      age: '4 – 5 Years',
      configurable: true,
      overview: 'Transitioning into early phonics, alphabet tracing, basic number concepts, and structured curiosity.',
      curriculumPoints: [
        'Alphabet identification and phonics sounds',
        'Number recognition, counting, and pattern matching',
        'Basic environmental concepts and nature storytelling',
        'Pencil grip, coloring within lines, and creative crafts',
      ],
    },
    {
      id: 'class1',
      title: 'Class 1',
      stage: 'Primary Level',
      age: '6+ Years',
      configurable: false,
      overview: 'Formal introduction to primary reading, foundational arithmetic, and bilingual language expression.',
      curriculumPoints: [
        'Reading simple sentences in Hindi and English',
        'Addition, subtraction, and single-digit mathematical logic',
        'Basic environmental studies (My Family, My Neighborhood)',
        'Neat handwriting practice, creative drawing, and moral stories',
      ],
    },
    {
      id: 'class2',
      title: 'Class 2',
      stage: 'Primary Level',
      age: '7+ Years',
      configurable: false,
      overview: 'Strengthening communicative comprehension, mental math agility, and natural world awareness.',
      curriculumPoints: [
        'Short paragraph reading and vocabulary expansion',
        'Multiplication tables introduction and place value understanding',
        'Living vs. non-living things, plants, and community helpers',
        'Expression through art, craft, and physical coordination drills',
      ],
    },
    {
      id: 'class3',
      title: 'Class 3',
      stage: 'Primary Level',
      age: '8+ Years',
      configurable: false,
      overview: 'Transitioning to structured conceptual subjects with independent reading and logical arithmetic.',
      curriculumPoints: [
        'Grammar basics, story comprehension, and descriptive sentences',
        'Multiplication, division, and introductory word problems',
        'Environmental science: habitats, water, weather, and hygiene',
        'Value education, computer awareness introduction, and teamwork games',
      ],
    },
    {
      id: 'class4',
      title: 'Class 4',
      stage: 'Primary Level',
      age: '9+ Years',
      configurable: false,
      overview: 'Deepening analytical inquiry, creative writing, and understanding community institutions.',
      curriculumPoints: [
        'Creative paragraph writing, poetry appreciation, and vocabulary building',
        'Fractions, measurement units, time, and geometric shapes',
        'Science concepts: body systems, matter, energy, and conservation',
        'General awareness, basic geography, and cooperative group activities',
      ],
    },
    {
      id: 'class5',
      title: 'Class 5',
      stage: 'Primary Graduating Wing',
      age: '10+ Years',
      configurable: false,
      overview: 'Preparatory critical reasoning, confident verbal articulation, and solid academic grounding.',
      curriculumPoints: [
        'Formal composition, essay writing, and bilingual fluency',
        'Decimals, percentages, area/perimeter, and applied problem solving',
        'Environmental science and social awareness: history, resources, civics',
        'Independent project presentation, disciplined study habits, and sports',
      ],
    },
  ];

  // Subjects Section
  const coreSubjects = [
    {
      name: 'Hindi Language & Literature',
      scope: 'वर्णमाला, शब्द रचना, मात्राएं, वाचन, सुलेख एवं कविताएं',
      desc: 'Developing deep phonetic fluency, vocabulary, and confident reading comprehension in our mother tongue.',
    },
    {
      name: 'English Language & Reading',
      scope: 'Phonics, vocabulary, basic grammar, spelling & spoken English',
      desc: 'Cultivating early English communicative confidence through guided reading, conversation, and storytelling.',
    },
    {
      name: 'Mathematics & Numeracy',
      scope: 'Numbers, arithmetic operations, geometry basics & mental math',
      desc: 'Building conceptual mathematical reasoning through concrete objects, visual charts, and step-by-step problem solving.',
    },
    {
      name: 'Environmental Studies (EVS)',
      scope: 'Nature, community, living beings, weather & personal hygiene',
      desc: 'Instilling reverence for nature, healthy habits, and social responsibility by observing the immediate environment.',
    },
    {
      name: 'Art, Drawing & Creative Craft',
      scope: 'Color blending, sketch work, paper folding & creative projects',
      desc: 'Fostering fine motor coordination, imaginative self-expression, and appreciation for colors and visual beauty.',
    },
    {
      name: 'Physical Education & Moral Values',
      scope: 'Movement games, morning drill, discipline & ethical conduct',
      desc: 'Promoting stamina, coordination, mutual respect, fairness, and core life values in every school session.',
    },
  ];

  // Learning Approach Pillars
  const learningApproaches = [
    {
      title: 'Child-Centric & Joyful Pedagogy',
      desc: 'Young children learn best when engaged through interactive questions, stories, and experiential games rather than rigid rote memorization.',
    },
    {
      title: 'Foundational Literacy & Numeracy Focus',
      desc: 'Prioritizing clear phonetic pronunciation, neat writing, and solid number comprehension before moving to complex concepts.',
    },
    {
      title: 'Gentle, Encouraging Classroom Culture',
      desc: 'Every child is treated with dignity and patience. Teachers nurture self-esteem so mistakes become positive stepping stones for growth.',
    },
    {
      title: 'Continuous Formative Observation',
      desc: 'Tracking developmental milestones and learning progress continuously to provide timely support without imposing test anxiety.',
    },
  ];

  // Selected fee details and course details for active modals
  const activeFeeDetails = feeModalLevel ? getFeeForLevel(feeModalLevel) : null;
  const activeCourseData = courseModalLevel ? getCourseForLevel(courseModalLevel) : null;

  const feeAnnualizedTuition = activeFeeDetails ? (activeFeeDetails.monthlyTuitionFee * 12) : 0;
  const feeTotalNewAdmission = activeFeeDetails
    ? (activeFeeDetails.admissionFee + feeAnnualizedTuition + activeFeeDetails.annualCharges + activeFeeDetails.otherCharges)
    : 0;
  const feeTotalContinuing = activeFeeDetails
    ? (feeAnnualizedTuition + activeFeeDetails.annualCharges + activeFeeDetails.otherCharges)
    : 0;

  return (
    <PageContainer
      title="Academics & Curriculum"
      subtitle={`Comprehensive foundational learning from Nursery to Class 5 at ${SCHOOL_CONFIG.name}, ${SCHOOL_CONFIG.location.displayLocation}.`}
      badge="FOUNDATIONAL LEARNING"
      breadcrumbs={[{ label: 'Academics' }]}
    >
      <div className="space-y-16">
        {/* 1. Overview Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-brown-950 via-brown-900 to-brown-800 text-white shadow-soft-lg flex flex-col md:flex-row items-center justify-between gap-6 border border-cream-200">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gold-300 border border-gold-400/30 uppercase tracking-wider">
              <School className="w-3.5 h-3.5" />
              <span>{SCHOOL_CONFIG.levels} Continuum</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Foundational Education for Lifelong Growth
            </h2>
            <p className="text-xs sm:text-sm text-cream-100 leading-relaxed">
              We specialize in the crucial early childhood and primary years, ensuring that every learner masters fundamental reading, writing, and numerical concepts in an engaging and supportive setting.
            </p>
          </div>
        </div>

        {/* Visual Classroom Spotlight Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl border border-cream-200 p-6 sm:p-8 shadow-soft-sm overflow-hidden">
          <div className="lg:col-span-6 space-y-3">
            <span className="text-xs font-bold text-saffron-600 uppercase tracking-widest block">
              CLASSROOM ENVIRONMENT
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-brown-800">
              Interactive Instruction & Early Literacy
            </h3>
            <p className="text-xs sm:text-sm text-brown-600 leading-relaxed">
              Our classrooms in Daulatyarpur provide an attentive, stimulating atmosphere where educators use illustrated storybooks, blackboard exercises, and peer discussion to build foundational confidence in language and numbers.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-brown-600">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-saffron-600" />
                Individual Guidance
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-saffron-600" />
                Nurturing Atmosphere
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-saffron-600" />
                Nursery to Class 5
              </span>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-soft-md border border-cream-200 group">
              <img
                src="/images/classroom-learning.jpg"
                alt="Primary Classroom Learning in session at N.D.R.N. Vidyalaya"
                className="w-full h-64 sm:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* 2. Classes Offered (Nursery, LKG/UKG, Class 1 to 5) */}
        <div>
          <SectionHeading
            badge="CLASS-BY-CLASS STRUCTURE"
            title="Educational Continuum from"
            highlight="Nursery to Class 5"
            subtitle="Explore the developmental objectives, curriculum specifications, and official fee details of each academic grade individually."
          />

          {/* Live Data Status Indicator & Error Handling */}
          {isLoadingData && (
            <div className="mb-4 flex items-center justify-center p-4 rounded-2xl bg-cream-50 border border-gold-200/70 text-xs text-brown-700 gap-2.5 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-saffron-600 shrink-0" />
              <span>Fetching live class curriculum and official fee schedules from Admin Portal...</span>
            </div>
          )}

          {dataError && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-brown-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{dataError} Displaying verified baseline academic continuum.</span>
              </div>
              <button
                type="button"
                onClick={() => fetchAcademicData()}
                className="px-3 py-1 bg-white hover:bg-amber-100 rounded-lg text-brown-900 font-bold border border-amber-300 transition-colors cursor-pointer"
              >
                Retry Sync
              </button>
            </div>
          )}

          <div className="space-y-6">
            {academicLevels.map((lvl) => {
              const levelStyles = {
                nursery: {
                  bg: 'bg-gradient-to-br from-[#FFFDF8] via-[#FAF3E4] to-[#F5ECD5]',
                  border: 'border-[#EADDC5] hover:border-saffron-500/80',
                  badge: 'bg-saffron-100/90 text-saffron-800 border-saffron-300/60',
                  accentTop: 'bg-gradient-to-r from-saffron-400 to-gold-400',
                },
                kindergarten: {
                  bg: 'bg-gradient-to-br from-[#FFFDF6] via-[#FAF5E6] to-[#F3ECCF]',
                  border: 'border-[#E5D7B7] hover:border-gold-500/90',
                  badge: 'bg-gold-100/90 text-gold-900 border-gold-300/70',
                  accentTop: 'bg-gradient-to-r from-gold-400 to-amber-400',
                },
                class1: {
                  bg: 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F3ECE1]',
                  border: 'border-[#E9DDCE] hover:border-saffron-500/80',
                  badge: 'bg-cream-200 text-saffron-800 border-gold-300/60',
                  accentTop: 'bg-gradient-to-r from-amber-400 to-saffron-400',
                },
                class2: {
                  bg: 'bg-gradient-to-br from-[#FFFDF8] via-[#F8F4EA] to-[#F1E9DA]',
                  border: 'border-[#E7DAC8] hover:border-gold-500/80',
                  badge: 'bg-cream-200 text-saffron-800 border-gold-300/60',
                  accentTop: 'bg-gradient-to-r from-gold-400 to-saffron-400',
                },
                class3: {
                  bg: 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EC] to-[#F2EDE1]',
                  border: 'border-[#E8DEC9] hover:border-saffron-500/80',
                  badge: 'bg-cream-200 text-saffron-800 border-gold-300/60',
                  accentTop: 'bg-gradient-to-r from-saffron-400 to-gold-400',
                },
                class4: {
                  bg: 'bg-gradient-to-br from-[#FFFDF8] via-[#F8F3E7] to-[#EFE7D5]',
                  border: 'border-[#E5D7BF] hover:border-gold-500/80',
                  badge: 'bg-cream-200 text-saffron-800 border-gold-300/60',
                  accentTop: 'bg-gradient-to-r from-gold-400 to-amber-500',
                },
                class5: {
                  bg: 'bg-gradient-to-br from-[#FFFDF7] via-[#F8F1E2] to-[#ECE1C7]',
                  border: 'border-[#DFCDB0] hover:border-saffron-500',
                  badge: 'bg-gold-200/90 text-brown-900 border-gold-400/80 font-black',
                  accentTop: 'bg-gradient-to-r from-saffron-500 to-brown-700',
                },
              };

              const theme = levelStyles[lvl.id] || {
                bg: 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF5EC] to-[#F2EDE1]',
                border: 'border-[#E8DEC9] hover:border-saffron-500/80',
                badge: 'bg-cream-200 text-saffron-800 border-gold-400/30',
                accentTop: 'bg-gradient-to-r from-saffron-400 to-gold-400',
              };

              // Individual data resolved strictly for this class only
              const classFee = getFeeForLevel(lvl);
              const classCourse = getCourseForLevel(lvl);
              const classAnnualizedTuition = classFee.monthlyTuitionFee * 12;
              const classTotalNewAdmission =
                classFee.admissionFee + classAnnualizedTuition + classFee.annualCharges + classFee.otherCharges;
              const classTotalContinuing =
                classAnnualizedTuition + classFee.annualCharges + classFee.otherCharges;

              const isCourseActive = expandedViews[lvl.id] === 'course';
              const isFeeActive = expandedViews[lvl.id] === 'fee';

              return (
                <div
                  key={lvl.id}
                  className={`relative rounded-3xl border ${theme.border} ${theme.bg} p-6 sm:p-8 shadow-soft-sm hover:shadow-card-hover transition-all duration-300 overflow-hidden group`}
                >
                  {/* Subtle decorative top accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${theme.accentTop} opacity-70 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-brown-200/50">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${theme.badge}`}>
                          {lvl.stage}
                        </span>
                        <span className="text-xs font-semibold text-brown-600">
                          Appropriate Age: {lvl.age}
                        </span>
                        {lvl.configurable && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/80 text-brown-800 border border-gold-400/60 shadow-2xs">
                            Configurable Intake Stage
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-brown-900 tracking-tight">
                        {lvl.title}
                      </h3>
                    </div>

                    {/* Functional Class Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
                      <button
                        type="button"
                        onClick={() => toggleCourseView(lvl)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                          isCourseActive
                            ? 'bg-[#F28C28] text-white border border-[#F28C28] shadow-sm'
                            : 'bg-white/95 hover:bg-saffron-50 text-brown-800 hover:text-saffron-700 border border-cream-300 hover:border-saffron-400 shadow-2xs hover:shadow-soft-xs'
                        }`}
                        title={`View ${lvl.title} Course Details`}
                      >
                        <BookOpen className={`w-3.5 h-3.5 ${isCourseActive ? 'text-white' : 'text-saffron-600'}`} />
                        <span>{isCourseActive ? 'Hide Course Details' : 'Course Details'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleFeeView(lvl)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                          isFeeActive
                            ? 'bg-[#D4AF37] text-white border border-[#D4AF37] shadow-sm'
                            : 'bg-white/95 hover:bg-gold-50 text-brown-800 hover:text-gold-800 border border-cream-300 hover:border-gold-400 shadow-2xs hover:shadow-soft-xs'
                        }`}
                        title={`View ${lvl.title} Fee Structure`}
                      >
                        <Receipt className={`w-3.5 h-3.5 ${isFeeActive ? 'text-white' : 'text-gold-600'}`} />
                        <span>{isFeeActive ? 'Hide Fee Structure' : 'Fee Structure'}</span>
                      </button>

                      <Button
                        type="button"
                        onClick={() => setEnquiryModalLevel(lvl)}
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold bg-white/90 hover:bg-[#F28C28] hover:text-white hover:border-[#F28C28] transition-all duration-200 shadow-2xs hover:shadow-soft-sm cursor-pointer"
                      >
                        Inquire for {lvl.title}
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-brown-700 my-4 leading-relaxed max-w-3xl font-medium">
                    {lvl.overview}
                  </p>

                  {lvl.configNote && (
                    <p className="text-xs text-brown-800 italic bg-white/80 p-2.5 rounded-xl border border-gold-400/50 mb-4 inline-block shadow-2xs">
                      Note: {lvl.configNote}
                    </p>
                  )}

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brown-600 mb-3">
                      Curriculum Focus Points:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {lvl.curriculumPoints.map((pt, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-brown-800 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-saffron-600 flex-shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* =========================================================
                      INDIVIDUAL COURSE DETAILS PANEL (DEDICATED TO THIS CLASS)
                      ========================================================= */}
                  {isCourseActive && (
                    <div className="mt-6 pt-5 border-t border-brown-200/70 animate-in fade-in duration-300 space-y-4 bg-white/90 p-5 sm:p-6 rounded-2xl border border-gold-300/70 shadow-soft-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-saffron-100 text-saffron-800 border border-saffron-300">
                              {lvl.title} Dedicated Course Details
                            </span>
                            <span className="text-[11px] font-semibold text-brown-600">
                              Session 2026–27
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-black text-brown-900 mt-1">
                            {lvl.title} — Syllabus & Instructional Specifications
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleFeeView(lvl)}
                            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-gold-50 hover:bg-gold-100 text-brown-800 border border-gold-300 transition-colors cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5 text-gold-600" />
                            <span>View {lvl.title} Fees</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCourseModalLevel(lvl)}
                            className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-brown-700 transition-colors cursor-pointer"
                            title={`Open ${lvl.title} Course Details in dedicated popup`}
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Popup</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleCourseView(lvl)}
                            className="p-1.5 text-brown-400 hover:text-brown-700 hover:bg-cream-100 rounded-lg transition-colors cursor-pointer"
                            title="Close Course Details"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Class schedule & medium badge bar */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-cream-50 border border-cream-200 text-xs text-brown-800">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-saffron-600 shrink-0" />
                          <span><strong>Daily Hours:</strong> {classCourse.timing}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-saffron-600 shrink-0" />
                          <span><strong>Instruction:</strong> {classCourse.medium}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-saffron-600 shrink-0" />
                          <span><strong>Periods:</strong> {classCourse.weeklyLoad}</span>
                        </div>
                      </div>

                      {/* Prescribed subjects for this class */}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brown-600 block mb-2">
                          Prescribed Core Subjects for {lvl.title} ({classCourse.subjectList.length} Disciplines):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {classCourse.subjectList.map((sub, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-white border border-cream-200 shadow-2xs">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="w-4 h-4 rounded bg-cream-200 text-saffron-700 flex items-center justify-center text-[10px] font-black shrink-0">
                                  {idx + 1}
                                </span>
                                <h5 className="text-xs font-bold text-brown-900">{sub.name}</h5>
                              </div>
                              <p className="text-[11px] text-brown-600 leading-relaxed pl-6">
                                {sub.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Learning Outcomes for this class */}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brown-600 block mb-2">
                          Key Developmental Milestones for {lvl.title}:
                        </span>
                        <div className="space-y-1.5">
                          {classCourse.outcomes.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-brown-800 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-saffron-600 shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =========================================================
                      INDIVIDUAL FEE STRUCTURE PANEL (DEDICATED TO THIS CLASS)
                      ========================================================= */}
                  {isFeeActive && (
                    <div className="mt-6 pt-5 border-t border-brown-200/70 animate-in fade-in duration-300 space-y-4 bg-white/90 p-5 sm:p-6 rounded-2xl border border-gold-300/70 shadow-soft-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-gold-100 text-gold-900 border border-gold-300">
                              {lvl.title} Official Fee Schedule
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                              Session {classFee.academicSession || '2026–27'}
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-black text-brown-900 mt-1">
                            {lvl.title} — Itemized Fee Breakdown
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleCourseView(lvl)}
                            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-saffron-50 hover:bg-saffron-100 text-brown-800 border border-saffron-300 transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-saffron-600" />
                            <span>View {lvl.title} Course</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setFeeModalLevel(lvl)}
                            className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-brown-700 transition-colors cursor-pointer"
                            title={`Open ${lvl.title} Fee Details in dedicated popup`}
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Popup</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleFeeView(lvl)}
                            className="p-1.5 text-brown-400 hover:text-brown-700 hover:bg-cream-100 rounded-lg transition-colors cursor-pointer"
                            title="Close Fee Structure"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Top Fee Metrics for this class */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 text-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brown-600 block">
                            Monthly Tuition
                          </span>
                          <div className="text-xl font-black text-brown-900 font-mono mt-0.5">
                            ₹{classFee.monthlyTuitionFee.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] text-brown-500 font-medium">per month</span>
                        </div>

                        <div className="p-3 rounded-xl bg-saffron-50/70 border border-saffron-300 text-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-saffron-800 block">
                            New Admission (Est. Annual)
                          </span>
                          <div className="text-xl font-black text-saffron-700 font-mono mt-0.5">
                            ₹{classTotalNewAdmission.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] text-brown-600 font-medium">includes 1-time admission fee</span>
                        </div>

                        <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 text-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brown-600 block">
                            Continuing Students (Annual)
                          </span>
                          <div className="text-xl font-black text-brown-900 font-mono mt-0.5">
                            ₹{classTotalContinuing.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[10px] text-brown-500 font-medium">annual re-enrollment</span>
                        </div>
                      </div>

                      {/* 4 Itemized Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-cream-200 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-brown-900 block">Admission Fee (One-Time)</span>
                            <span className="text-[10px] text-brown-500">New enrollments only</span>
                          </div>
                          <span className="font-extrabold text-brown-900 font-mono text-sm">
                            ₹{classFee.admissionFee.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-cream-200 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-brown-900 block">Monthly Tuition Fee</span>
                            <span className="text-[10px] text-brown-500">× 12 months = ₹{classAnnualizedTuition.toLocaleString('en-IN')}</span>
                          </div>
                          <span className="font-extrabold text-brown-900 font-mono text-sm">
                            ₹{classFee.monthlyTuitionFee.toLocaleString('en-IN')} / mo
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-cream-200 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-brown-900 block">Annual Composite Charges</span>
                            <span className="text-[10px] text-brown-500">Sports & developmental activities</span>
                          </div>
                          <span className="font-extrabold text-brown-900 font-mono text-sm">
                            ₹{classFee.annualCharges.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-cream-200 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-brown-900 block">Examination & Other Charges</span>
                            <span className="text-[10px] text-brown-500">Term tests, stationery & ID card</span>
                          </div>
                          <span className="font-extrabold text-brown-900 font-mono text-sm">
                            ₹{classFee.otherCharges.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-cream-200 flex justify-between items-center col-span-1 sm:col-span-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-amber-50 text-amber-700">
                              <Bus className="w-3.5 h-3.5" />
                            </span>
                            <div>
                              <span className="font-bold text-brown-900 block">Bus / Conveyance Fee</span>
                              <span className="text-[10px] text-brown-500">Optional rural & township transport routes</span>
                            </div>
                          </div>
                          <span className="font-extrabold text-brown-900 font-mono text-sm">
                            ₹{(classFee.busFee || 0).toLocaleString('en-IN')} / mo
                          </span>
                        </div>
                      </div>

                      {/* Inclusions */}
                      {classFee.inclusions && (
                        <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brown-600 block mb-1.5">
                            Provisions Covered Under {lvl.title} Fee:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-brown-800">
                            {classFee.inclusions.map((inc, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{inc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Remittance note */}
                      <div className="text-[11px] text-brown-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span>
                          <strong>Payment Directives:</strong> Payable monthly by 10th or quarterly at the school cashier desk in Daulatyarpur. Official numbered receipts issued for every payment.
                        </span>
                        <button
                          type="button"
                          onClick={() => setEnquiryModalLevel(lvl)}
                          className="shrink-0 text-xs font-bold text-saffron-700 hover:text-saffron-800 underline cursor-pointer"
                        >
                          Enquire for {lvl.title} →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>


        {/* 3. Subjects Section */}
        <div className="bg-cream-200/50 rounded-3xl p-8 sm:p-10 border border-cream-200 shadow-soft-sm">
          <SectionHeading
            badge="CURRICULAR AREAS"
            title="Core Subjects &"
            highlight="Disciplines"
            subtitle="A balanced primary curriculum emphasizing language, arithmetic, environmental understanding, and physical health."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreSubjects.map((sub, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-cream-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cream-200 text-saffron-600 flex items-center justify-center font-bold text-sm mb-4">
                    0{idx + 1}
                  </div>
                  <h4 className="text-base font-bold text-brown-800 mb-1">
                    {sub.name}
                  </h4>
                  <span className="text-[11px] font-semibold text-saffron-600 block mb-3">
                    Scope: {sub.scope}
                  </span>
                  <p className="text-xs text-brown-600 leading-relaxed">
                    {sub.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-cream-200 text-[11px] font-semibold text-brown-500">
                  Nursery to Class 5 Foundation
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Learning Approach Section */}
        <div>
          <SectionHeading
            badge="PEDAGOGY"
            title="Our Child-Centric"
            highlight="Learning Approach"
            subtitle="How we create a respectful, joyful, and effective learning atmosphere for every young student."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningApproaches.map((app, idx) => (
              <Card key={idx} className="p-6 bg-white border-cream-200">
                <div className="w-10 h-10 rounded-xl bg-cream-200 text-saffron-700 font-bold text-xs flex items-center justify-center mb-4 border border-gold-400/30">
                  0{idx + 1}
                </div>
                <h4 className="text-base font-bold text-brown-800 mb-2">
                  {app.title}
                </h4>
                <p className="text-xs sm:text-sm text-brown-600 leading-relaxed">
                  {app.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* 5. Bottom Admission CTA */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-brown-950 via-brown-900 to-brown-800 text-white shadow-soft-md flex flex-col md:flex-row items-center justify-between gap-6 border border-cream-200 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-white text-[#FFFFFF]">
              Seek Guidance for Your Child's Class Placement?
            </h3>
            <p className="text-xs sm:text-sm text-cream-100 mt-1 leading-relaxed">
              Connect with our admissions desk to discuss the appropriate class placement from Nursery through Class 5.
            </p>
          </div>
          <Link
            to="/admissions"
            className="inline-flex items-center justify-center font-bold text-sm px-6 py-2.5 rounded-xl bg-[#F28C28] hover:bg-[#d97715] text-[#FFFFFF] shadow-sm hover:shadow-md transition-all duration-200 border border-[#F28C28] hover:border-[#d97715] flex-shrink-0"
          >
            Submit Admission Enquiry
          </Link>
        </div>
      </div>

      {/* =========================================================================
          COURSE DETAILS MODAL (POPUP)
          ========================================================================= */}
      <Modal
        isOpen={!!courseModalLevel}
        onClose={() => setCourseModalLevel(null)}
        title={courseModalLevel ? `${courseModalLevel.title} — Course Details & Syllabus` : 'Course Details'}
        subtitle={courseModalLevel ? `${courseModalLevel.stage} • Age Criteria: ${courseModalLevel.age} • Academic Session 2026–27` : ''}
        maxWidth="max-w-3xl"
        footer={
          courseModalLevel && (
            <div className="flex flex-wrap items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={() => {
                  const targetLvl = courseModalLevel;
                  setCourseModalLevel(null);
                  setFeeModalLevel(targetLvl);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-gold-50 hover:bg-gold-100 text-brown-900 border border-gold-300 transition-colors cursor-pointer"
              >
                <Receipt className="w-3.5 h-3.5 text-gold-700" />
                <span>View {courseModalLevel.title} Fee Structure</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCourseModalLevel(null)}
                  className="px-4 py-2 text-xs font-semibold text-brown-600 hover:text-brown-900 hover:bg-cream-100 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = courseModalLevel;
                    setCourseModalLevel(null);
                    setEnquiryModalLevel(target);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-[#F28C28] hover:bg-[#d97715] text-white shadow-2xs hover:shadow-soft-xs transition-colors cursor-pointer"
                >
                  <span>Admission Enquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        }
      >
        {courseModalLevel && activeCourseData && (
          <div className="space-y-6">
            {/* Class Stage & Specification Header */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-cream-100 via-cream-50 to-[#FAF2E1] border border-gold-300/60 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-saffron-100 text-saffron-800 border border-saffron-300">
                  {courseModalLevel.stage}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-brown-700 border border-cream-200">
                  Appropriate Age: {courseModalLevel.age}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-brown-700 border border-cream-200">
                  UP Board Foundational Continuum
                </span>
              </div>
              <p className="text-xs sm:text-sm text-brown-800 leading-relaxed font-medium">
                {courseModalLevel.overview}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-gold-300/40 text-xs text-brown-700">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-saffron-600 shrink-0" />
                  <span><strong>Timings:</strong> {activeCourseData.timing}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-saffron-600 shrink-0" />
                  <span><strong>Instruction:</strong> {activeCourseData.medium}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-saffron-600 shrink-0" />
                  <span><strong>Schedule:</strong> {activeCourseData.weeklyLoad}</span>
                </div>
              </div>
            </div>

            {/* Prescribed Core Subject Modules */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brown-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-saffron-600" />
                  <span>Prescribed Subject Modules & Curricular Focus</span>
                </h4>
                <span className="text-[11px] font-medium text-brown-500">
                  {activeCourseData.subjectList.length} Core Areas
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeCourseData.subjectList.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-cream-200 shadow-2xs hover:border-gold-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-md bg-cream-200 text-saffron-700 flex items-center justify-center text-[10px] font-black shrink-0">
                        {idx + 1}
                      </span>
                      <h5 className="text-xs font-bold text-brown-900">{sub.name}</h5>
                    </div>
                    <p className="text-[11px] text-brown-600 leading-relaxed pl-7">
                      {sub.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Focus Points for this Class */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brown-700 mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-saffron-600" />
                <span>Key Developmental & Academic Focus Areas</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-cream-50 p-3.5 rounded-2xl border border-cream-200">
                {courseModalLevel.curriculumPoints.map((pt, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-brown-800">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Learning Outcomes */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brown-700 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                <span>Target Learning Outcomes & Milestones</span>
              </h4>
              <div className="space-y-2">
                {activeCourseData.outcomes.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-cream-200 text-xs text-brown-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-saffron-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Classroom Pedagogy & Assessment Note */}
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-brown-700 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Pedagogical Methodology:</strong> Instruction at N.D.R.N. Vidyalaya balances textbook fundamentals with daily blackboard exercises, illustrated reading charts, and experiential activities. Progress is continuously monitored through formative observations to ensure steady learning without test pressure.
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* =========================================================================
          FEE STRUCTURE MODAL (POPUP)
          ========================================================================= */}
      <Modal
        isOpen={!!feeModalLevel}
        onClose={() => setFeeModalLevel(null)}
        title={feeModalLevel ? `${feeModalLevel.title} — Fee Structure` : 'Fee Structure'}
        subtitle={feeModalLevel ? `Academic Session ${activeFeeDetails?.academicSession || '2026–27'} • Transparent Schedule` : ''}
        maxWidth="max-w-3xl"
        footer={
          feeModalLevel && (
            <div className="flex flex-wrap items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={() => {
                  const targetLvl = feeModalLevel;
                  setFeeModalLevel(null);
                  setCourseModalLevel(targetLvl);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-saffron-50 hover:bg-saffron-100 text-brown-900 border border-saffron-300 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-saffron-700" />
                <span>View {feeModalLevel.title} Course Details</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFeeModalLevel(null)}
                  className="px-4 py-2 text-xs font-semibold text-brown-600 hover:text-brown-900 hover:bg-cream-100 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = feeModalLevel;
                    setFeeModalLevel(null);
                    setEnquiryModalLevel(target);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-[#F28C28] hover:bg-[#d97715] text-white shadow-2xs hover:shadow-soft-xs transition-colors cursor-pointer"
                >
                  <span>Admission Enquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        }
      >
        {feeModalLevel && activeFeeDetails && (
          <div className="space-y-6">
            {/* Top Fee Highlight Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-50 border border-gold-300/70 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brown-600 block">
                  Monthly Tuition Fee
                </span>
                <div className="text-2xl font-black text-brown-900 font-mono mt-1">
                  ₹{activeFeeDetails.monthlyTuitionFee.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-brown-500 font-medium mt-0.5 block">
                  Payable monthly or quarterly
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-saffron-50 via-cream-50 to-gold-50 border border-saffron-300 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-saffron-800 block">
                  Est. Annual (New Admission)
                </span>
                <div className="text-2xl font-black text-saffron-700 font-mono mt-1">
                  ₹{feeTotalNewAdmission.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-brown-600 font-medium mt-0.5 block">
                  Includes 1-time admission fee
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-50 border border-gold-300/70 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brown-600 block">
                  Est. Annual (Continuing)
                </span>
                <div className="text-2xl font-black text-brown-900 font-mono mt-1">
                  ₹{feeTotalContinuing.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-brown-500 font-medium mt-0.5 block">
                  Progressing students (no adm. fee)
                </span>
              </div>
            </div>

            {/* Itemized Fee Structure Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brown-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-saffron-600" />
                  <span>Itemized Fee Breakdown for {feeModalLevel.title}</span>
                </h4>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Session {activeFeeDetails.academicSession}
                </span>
              </div>

              <div className="divide-y divide-cream-200 border border-cream-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {/* 1. Admission Fee */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-brown-900">
                        Admission Fee (One-Time)
                      </span>
                      <span className="text-[10px] font-semibold text-saffron-700 bg-saffron-50 border border-saffron-200 px-1.5 py-0.2 rounded">
                        New Admissions Only
                      </span>
                    </div>
                    <p className="text-[11px] text-brown-600 mt-0.5">
                      Payable once upon initial enrollment. Waived for continuing students progressing from previous grade.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-extrabold text-brown-900 font-mono">
                      ₹{activeFeeDetails.admissionFee.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-brown-500 block">one-time</span>
                  </div>
                </div>

                {/* 2. Monthly Tuition Fee */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-4 bg-cream-50/40">
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-brown-900">
                      Monthly Tuition Fee
                    </span>
                    <p className="text-[11px] text-brown-600 mt-0.5">
                      Covers academic instruction, teacher guidance, classroom facilities, and library reading (12 months = ₹{(activeFeeDetails.monthlyTuitionFee * 12).toLocaleString('en-IN')}).
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-extrabold text-brown-900 font-mono">
                      ₹{activeFeeDetails.monthlyTuitionFee.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-brown-500 block">/ month</span>
                  </div>
                </div>

                {/* 3. Annual Charges */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-brown-900">
                      Annual Development & Co-Curricular Charges
                    </span>
                    <p className="text-[11px] text-brown-600 mt-0.5">
                      Covers campus amenities, sports equipment, cultural events, maintenance, and co-curricular supplies.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-extrabold text-brown-900 font-mono">
                      ₹{activeFeeDetails.annualCharges.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-brown-500 block">per year</span>
                  </div>
                </div>

                {/* 4. Other Charges */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-4 bg-cream-50/40">
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-brown-900">
                      Examination, Evaluation & Stationery Charges
                    </span>
                    <p className="text-[11px] text-brown-600 mt-0.5">
                      Covers term evaluation sheets, progress report cards, student ID card, and academic assessment stationery.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-extrabold text-brown-900 font-mono">
                      ₹{activeFeeDetails.otherCharges.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-brown-500 block">per year</span>
                  </div>
                </div>

                {/* 5. Bus / Conveyance Fee */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-brown-900">
                        Bus / Conveyance Fee (Optional)
                      </span>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                        Transport Route
                      </span>
                    </div>
                    <p className="text-[11px] text-brown-600 mt-0.5">
                      Optional student pick-and-drop transportation across Madhoganj, Daulatyarpur, and neighboring rural feeder routes.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm sm:text-base font-extrabold text-brown-900 font-mono">
                      ₹{(activeFeeDetails.busFee || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-brown-500 block">/ month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inclusions */}
            {activeFeeDetails.inclusions && activeFeeDetails.inclusions.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brown-700 mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Educational Provisions Covered Under This Fee</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-cream-50 p-3.5 rounded-2xl border border-cream-200">
                  {activeFeeDetails.inclusions.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-brown-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Institutional Policies & Payment Directives */}
            <div className="p-4 rounded-2xl bg-cream-100/70 border border-gold-300/60 space-y-2 text-xs text-brown-800">
              <div className="flex items-center gap-2 font-bold text-brown-900 text-xs">
                <Receipt className="w-4 h-4 text-saffron-600" />
                <span>Payment Schedule & Administrative Office Directives</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-[11px] text-brown-700 leading-relaxed">
                <li>
                  <strong>Payment Modes:</strong> Fees may be remitted on a monthly (by 10th of every calendar month) or quarterly basis directly at the school cashier desk in Daulatyarpur, Madhoganj.
                </li>
                <li>
                  <strong>Physical Receipts:</strong> An official, numbered school fee receipt is issued immediately for every fee transaction.
                </li>
                <li>
                  <strong>Sibling & Hardship Concessions:</strong> Special fee consideration is available for eligible siblings and needy families upon formal application to the Principal ({SCHOOL_CONFIG.contact.phone}).
                </li>
                <li>
                  <strong>Zero Hidden Costs:</strong> N.D.R.N. Vidyalaya follows an ethical, transparent fee policy with no surprise annual levies.
                </li>
              </ul>
            </div>

            {/* Class-Specific Enquiry Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs border-t border-cream-200">
              <span className="text-brown-600">Have questions regarding {feeModalLevel.title} admissions or fee concessions?</span>
              <button
                type="button"
                onClick={() => {
                  const target = feeModalLevel;
                  setFeeModalLevel(null);
                  setEnquiryModalLevel(target);
                }}
                className="font-bold text-saffron-700 hover:text-saffron-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Submit Admission Enquiry for {feeModalLevel.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* =========================================================================
          CLASS ADMISSION ENQUIRY MODAL (POPUP)
          ========================================================================= */}
      <Modal
        isOpen={!!enquiryModalLevel}
        onClose={() => setEnquiryModalLevel(null)}
        title={enquiryModalLevel ? `Admission Enquiry — ${enquiryModalLevel.title}` : 'Admission Enquiry'}
        subtitle={`Register your inquiry for ${enquiryModalLevel?.title || 'Primary Wing'} at ${SCHOOL_CONFIG.name}`}
        maxWidth="max-w-2xl"
      >
        {enquiryModalLevel && (
          <AdmissionEnquiryForm
            inModal={true}
            selectedGrade={
              enquiryModalLevel.id === 'kindergarten'
                ? 'LKG'
                : enquiryModalLevel.title
            }
          />
        )}
      </Modal>
    </PageContainer>
  );
}


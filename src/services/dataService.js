/**
 * Central Data & Persistent Storage Service for N.D.R.N. Vidyalaya
 * Campus: Daulatyarpur, Madhoganj, Uttar Pradesh
 * Level: UP Board • Nursery to Class 5
 *
 * Provides complete CRUD operations and reactive storage for genuine school records.
 * All demo, dummy, mock, and sample data have been completely removed.
 */

const STORAGE_KEYS = {
  SETTINGS: 'ndrn_school_settings',
  NOTICES: 'ndrn_notices',
  EVENTS: 'ndrn_events',
  GALLERY: 'ndrn_gallery',
  ADMISSIONS: 'ndrn_admissions',
  CONTACTS: 'ndrn_contacts',
  STUDENTS: 'ndrn_students',
  PARENTS: 'ndrn_parents',
  TEACHERS: 'ndrn_teachers',
  CLASSES: 'ndrn_classes',
  SUBJECTS: 'ndrn_subjects',
  HOMEWORK: 'ndrn_homework',
  RESULTS: 'ndrn_results',
  ATTENDANCE: 'ndrn_attendance_records',
  FEES: 'ndrn_fee_records',
  FEE_STRUCTURE: 'ndrn_fee_structures',
  COURSES: 'ndrn_courses',
  ACTIVITIES: 'ndrn_recent_activities',
  LEAVES: 'ndrn_leave_requests',
  TIMETABLES: 'ndrn_timetables',
};

// 1. Genuine School Institutional Parameters (Configurable via Admin Console)
export const SEED_SETTINGS = {
  schoolName: 'N.D.R.N. Vidyalaya',
  tagline: 'Nurturing Young Minds with Care & Character',
  affiliationInfo: 'UP Board Primary & Elementary Institution • Nursery to Class 5',
  village: 'Daulatyarpur',
  postOffice: 'Madhoganj',
  district: 'Hardoi',
  state: 'Uttar Pradesh',
  phone: '+91 8429231617',
  secondaryPhone: '',
  email: 'ueyuwhw@gmail.com',
  whatsapp: '+91 8429231617',
  principalName: 'D.K. Saini',
  principalDesignation: 'Principal & Head of Institution',
  principalMessage:
    'Welcome to N.D.R.N. Vidyalaya, Daulatyarpur, Madhoganj. Our primary educational philosophy centers on providing every child from Nursery to Class 5 a supportive, disciplined, and stimulating environment to build foundational literacy, numeracy, and strong moral values.',
  directorName: 'School Management Committee',
  schoolHours: '08:00 AM - 02:00 PM (Monday to Saturday)',
  academicSession: '2026-2027',
  gradesOffered: 'Nursery to Class 5',
  socialLinks: {
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
    instagram: '',
    twitter: '',
  },
  admissionsOpen: true,
};

// 2. Standard UP Board Class Structure for Nursery to Class 5 (0 initial students)
const SEED_CLASSES = [
  { id: 'CLS-NUR', name: 'Nursery', section: 'A', room: 'Room 101', capacity: 30, studentCount: 0, classTeacher: '' },
  { id: 'CLS-LKG', name: 'LKG', section: 'A', room: 'Room 102', capacity: 30, studentCount: 0, classTeacher: '' },
  { id: 'CLS-UKG', name: 'UKG', section: 'A', room: 'Room 103', capacity: 30, studentCount: 0, classTeacher: '' },
  { id: 'CLS-1A', name: 'Class 1', section: 'A', room: 'Room 104', capacity: 35, studentCount: 0, classTeacher: '' },
  { id: 'CLS-2A', name: 'Class 2', section: 'A', room: 'Room 105', capacity: 35, studentCount: 0, classTeacher: '' },
  { id: 'CLS-3A', name: 'Class 3', section: 'A', room: 'Room 106', capacity: 35, studentCount: 0, classTeacher: '' },
  { id: 'CLS-4A', name: 'Class 4', section: 'A', room: 'Room 107', capacity: 35, studentCount: 0, classTeacher: '' },
  { id: 'CLS-5A', name: 'Class 5', section: 'A', room: 'Room 108', capacity: 35, studentCount: 0, classTeacher: '' },
];

// 3. Standard UP Board Curriculum Subjects
const SEED_SUBJECTS = [
  { id: 'SUB-MTH', code: 'MATH-01', name: 'Mathematics', grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], maxMarks: 100 },
  { id: 'SUB-ENG', code: 'ENG-01', name: 'English (Reading & Grammar)', grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], maxMarks: 100 },
  { id: 'SUB-HIN', code: 'HIN-01', name: 'Hindi (Sahitya & Vyakaran)', grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], maxMarks: 100 },
  { id: 'SUB-EVS', code: 'EVS-01', name: 'Environmental Studies (EVS)', grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], maxMarks: 100 },
  { id: 'SUB-ART', code: 'ART-01', name: 'Art, Drawing & Paper Craft', grades: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], maxMarks: 50 },
  { id: 'SUB-PHE', code: 'PHE-01', name: 'Physical Education & Games', grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], maxMarks: 50 },
  { id: 'SUB-MOR', code: 'MOR-01', name: 'Moral Education & General Knowledge', grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], maxMarks: 50 },
];

// Dynamic Collections initialized completely empty — no fake or dummy data.
const SEED_STUDENTS = [];
const SEED_PARENTS = [];
const SEED_TEACHERS = [];
export const SEED_NOTICES = [
  {
    id: 'NOT-2026-01',
    title: 'Primary Wing Half-Yearly Scholastic Assessment Schedule (2026-27)',
    category: 'Academics',
    date: '20 Oct 2026',
    publishedDate: '2026-10-20T09:00:00.000Z',
    priority: 'academic',
    author: 'Office of the Principal',
    summary: 'Half-yearly written and oral evaluations for Nursery through Class 5 will commence from 15th November 2026. Detailed subject timetable is issued to all class mentors.',
    content: 'Half-yearly written and oral evaluations for Nursery through Class 5 will commence from 15th November 2026. Detailed subject timetable and study guides have been distributed. Parents are requested to ensure regular attendance and revision at home.',
    pinned: true,
    isPinned: true,
  },
  {
    id: 'NOT-2026-02',
    title: 'Admissions Open for Academic Session 2026-27 (Nursery to Class 5)',
    category: 'Admissions',
    date: '15 Oct 2026',
    publishedDate: '2026-10-15T09:00:00.000Z',
    priority: 'normal',
    author: 'Admissions Committee',
    summary: 'Registration and prospectus for fresh admissions from Nursery to Class 5 are available at the administrative desk, Daulatyarpur campus.',
    content: 'Registration and prospectus for fresh admissions from Nursery to Class 5 are available at the administrative desk, Daulatyarpur campus. Parents may submit online admission inquiries or visit the administrative desk Monday through Saturday from 8:00 AM to 2:00 PM.',
    pinned: false,
    isPinned: false,
  },
  {
    id: 'NOT-2026-03',
    title: 'Winter School Uniform Guidelines & Timings Transition',
    category: 'General',
    date: '10 Oct 2026',
    publishedDate: '2026-10-10T09:00:00.000Z',
    priority: 'normal',
    author: 'Principal D.K. Saini',
    summary: 'Starting 1st November, winter morning timings will be 08:30 AM to 02:00 PM. All students must wear the designated navy blue pullover.',
    content: 'Starting 1st November, winter morning timings will transition to 08:30 AM to 02:00 PM. All students from Nursery to Class 5 must attend in complete winter uniform with designated navy blue pullover and identity cards.',
    pinned: false,
    isPinned: false,
  },
];

export const SEED_EVENTS = [
  {
    id: 'EVT-2026-01',
    title: 'Annual Bal-Mela & Primary Sports Meet 2026',
    category: 'Sports & Cultural',
    date: '2026-11-14',
    startDate: '2026-11-14T09:00:00.000Z',
    month: 'NOV',
    day: '14',
    time: '09:00 AM - 02:00 PM',
    venue: 'N.D.R.N. Campus Playground, Daulatyarpur',
    description: 'Traditional games, 50m sprint, sack race, lemon race, and joyful cultural performances by Nursery to Class 5 learners on Children’s Day.',
    status: 'Upcoming',
    type: 'upcoming',
    color: 'from-saffron-500 to-brown-800',
  },
  {
    id: 'EVT-2026-02',
    title: 'Grandparents & Parents Day Interactive Gathering',
    category: 'Celebrations',
    date: '2026-11-28',
    startDate: '2026-11-28T10:00:00.000Z',
    month: 'NOV',
    day: '28',
    time: '10:00 AM - 01:00 PM',
    venue: 'School Assembly Lawn, Daulatyarpur Campus',
    description: 'Fostering family-school bonds with cultural storytelling, poetry recitations by students, and community interaction with educators.',
    status: 'Upcoming',
    type: 'upcoming',
    color: 'from-gold-500 to-brown-900',
  },
  {
    id: 'EVT-2027-01',
    title: 'Republic Day Celebration & Primary Cultural Assembly',
    category: 'Academic',
    date: '2027-01-26',
    startDate: '2027-01-26T08:30:00.000Z',
    month: 'JAN',
    day: '26',
    time: '08:30 AM - 11:30 AM',
    venue: 'Main School Flag Arena, Daulatyarpur',
    description: 'Flag hoisting ceremony, national anthem, patriotic group songs, and speech presentations by Class 4 and 5 student leaders.',
    status: 'Upcoming',
    type: 'upcoming',
    color: 'from-saffron-600 to-saffron-700',
  },
];

export const SEED_GALLERY = [
  {
    id: 'GAL-0001',
    title: 'N.D.R.N. Vidyalaya Main Campus Building',
    category: 'Campus',
    description: 'Three-story academic building in Daulatyarpur, Madhoganj, featuring well-ventilated classrooms, safe gated entry, and dedicated primary learning facilities from Nursery to Class 5.',
    image: '/images/school-building.jpg',
    color: 'from-amber-600 to-brown-900',
    date: '2026-03-01',
  },
];
const SEED_ADMISSIONS = [];
const SEED_CONTACTS = [];
const SEED_FEES = [];
const SEED_ACTIVITIES = [];
export const SEED_FEE_STRUCTURE = [
  {
    id: 'FS-NUR',
    classGrade: 'Nursery',
    academicSession: '2026-27',
    admissionFee: 500,
    monthlyTuitionFee: 300,
    annualCharges: 600,
    otherCharges: 200,
    busFee: 250,
    totalEstimatedAnnualFee: 4900,
    isPublished: true,
    isVerified: true,
    sortOrder: 1,
    notes: 'Pre-Primary foundational admission schedule.',
  },
  {
    id: 'FS-KG',
    classGrade: 'LKG & UKG',
    academicSession: '2026-27',
    admissionFee: 600,
    monthlyTuitionFee: 350,
    annualCharges: 700,
    otherCharges: 250,
    busFee: 250,
    totalEstimatedAnnualFee: 5750,
    isPublished: true,
    isVerified: true,
    sortOrder: 2,
    notes: 'Kindergarten intake schedule.',
  },
  {
    id: 'FS-CLS1',
    classGrade: 'Class 1',
    academicSession: '2026-27',
    admissionFee: 800,
    monthlyTuitionFee: 400,
    annualCharges: 800,
    otherCharges: 250,
    busFee: 300,
    totalEstimatedAnnualFee: 6650,
    isPublished: true,
    isVerified: true,
    sortOrder: 3,
    notes: 'Class 1 primary intake schedule.',
  },
  {
    id: 'FS-CLS2',
    classGrade: 'Class 2',
    academicSession: '2026-27',
    admissionFee: 800,
    monthlyTuitionFee: 450,
    annualCharges: 850,
    otherCharges: 250,
    busFee: 300,
    totalEstimatedAnnualFee: 7300,
    isPublished: true,
    isVerified: true,
    sortOrder: 4,
    notes: 'Class 2 primary fee schedule.',
  },
  {
    id: 'FS-CLS3',
    classGrade: 'Class 3',
    academicSession: '2026-27',
    admissionFee: 900,
    monthlyTuitionFee: 500,
    annualCharges: 900,
    otherCharges: 300,
    busFee: 350,
    totalEstimatedAnnualFee: 8100,
    isPublished: true,
    isVerified: true,
    sortOrder: 5,
    notes: 'Class 3 primary fee schedule.',
  },
  {
    id: 'FS-CLS4',
    classGrade: 'Class 4',
    academicSession: '2026-27',
    admissionFee: 900,
    monthlyTuitionFee: 550,
    annualCharges: 950,
    otherCharges: 300,
    busFee: 350,
    totalEstimatedAnnualFee: 8750,
    isPublished: true,
    isVerified: true,
    sortOrder: 6,
    notes: 'Class 4 primary fee schedule.',
  },
  {
    id: 'FS-CLS5',
    classGrade: 'Class 5',
    academicSession: '2026-27',
    admissionFee: 1000,
    monthlyTuitionFee: 600,
    annualCharges: 1000,
    otherCharges: 300,
    busFee: 400,
    totalEstimatedAnnualFee: 9500,
    isPublished: true,
    isVerified: true,
    sortOrder: 7,
    notes: 'Class 5 primary graduating fee schedule.',
  },
];

export const SEED_COURSES = [
  {
    id: 'CRS-NUR',
    classGrade: 'Nursery',
    academicSession: '2026-27',
    stage: 'Pre-Primary',
    age: '3+ Years',
    medium: 'Bilingual (Hindi & English foundational immersion)',
    timing: '8:30 AM – 12:30 PM (Pre-Primary schedule)',
    weeklyLoad: '24 Interactive Activity Periods / Week',
    overview: 'Early childhood discovery focusing on emotional security, sensory play, basic speech, and playful interaction.',
    curriculumPoints: [
      'Sensory exploration and playful discovery',
      'Introduction to rhymes, music, and listening skills',
      'Fine-motor skills with clay, coloring, and building blocks',
      'Early socialization and classroom habit formation',
    ],
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
    isPublished: true,
    sortOrder: 1,
  },
  {
    id: 'CRS-KG',
    classGrade: 'LKG & UKG',
    academicSession: '2026-27',
    stage: 'Kindergarten (Configurable)',
    age: '4 – 5 Years',
    medium: 'Bilingual (Hindi & English structured foundation)',
    timing: '8:00 AM – 1:00 PM (Kindergarten schedule)',
    weeklyLoad: '28 Structured Periods / Week',
    overview: 'Transitioning into early phonics, alphabet tracing, basic number concepts, and structured curiosity.',
    curriculumPoints: [
      'Alphabet identification and phonics sounds',
      'Number recognition, counting, and pattern matching',
      'Basic environmental concepts and nature storytelling',
      'Pencil grip, coloring within lines, and creative crafts',
    ],
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
    isPublished: true,
    sortOrder: 2,
  },
  {
    id: 'CRS-CLS1',
    classGrade: 'Class 1',
    academicSession: '2026-27',
    stage: 'Primary Level',
    age: '6+ Years',
    medium: 'Bilingual (UP Board curriculum standard)',
    timing: '8:00 AM – 2:00 PM (Regular primary hours)',
    weeklyLoad: '32 Periods / Week with prescribed textbooks',
    overview: 'Formal introduction to primary reading, foundational arithmetic, and bilingual language expression.',
    curriculumPoints: [
      'Reading simple sentences in Hindi and English',
      'Addition, subtraction, and single-digit mathematical logic',
      'Basic environmental studies (My Family, My Neighborhood)',
      'Neat handwriting practice, creative drawing, and moral stories',
    ],
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
    isPublished: true,
    sortOrder: 3,
  },
  {
    id: 'CRS-CLS2',
    classGrade: 'Class 2',
    academicSession: '2026-27',
    stage: 'Primary Level',
    age: '7+ Years',
    medium: 'Bilingual (UP Board curriculum standard)',
    timing: '8:00 AM – 2:00 PM',
    weeklyLoad: '34 Periods / Week',
    overview: 'Strengthening communicative comprehension, mental math agility, and natural world awareness.',
    curriculumPoints: [
      'Short paragraph reading and vocabulary expansion',
      'Multiplication tables introduction and place value understanding',
      'Living vs. non-living things, plants, and community helpers',
      'Expression through art, craft, and physical coordination drills',
    ],
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
    isPublished: true,
    sortOrder: 4,
  },
  {
    id: 'CRS-CLS3',
    classGrade: 'Class 3',
    academicSession: '2026-27',
    stage: 'Primary Level',
    age: '8+ Years',
    medium: 'Bilingual (UP Board curriculum standard)',
    timing: '8:00 AM – 2:00 PM',
    weeklyLoad: '36 Periods / Week',
    overview: 'Transitioning to structured conceptual subjects with independent reading and logical arithmetic.',
    curriculumPoints: [
      'Grammar basics, story comprehension, and descriptive sentences',
      'Multiplication, division, and introductory word problems',
      'Environmental science: habitats, water, weather, and hygiene',
      'Value education, computer awareness introduction, and teamwork games',
    ],
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
    isPublished: true,
    sortOrder: 5,
  },
  {
    id: 'CRS-CLS4',
    classGrade: 'Class 4',
    academicSession: '2026-27',
    stage: 'Primary Level',
    age: '9+ Years',
    medium: 'Bilingual (UP Board curriculum standard)',
    timing: '8:00 AM – 2:00 PM',
    weeklyLoad: '36 Periods / Week',
    overview: 'Deepening analytical inquiry, creative writing, and understanding community institutions.',
    curriculumPoints: [
      'Creative paragraph writing, poetry appreciation, and vocabulary building',
      'Fractions, measurement units, time, and geometric shapes',
      'Science concepts: body systems, matter, energy, and conservation',
      'General awareness, basic geography, and cooperative group activities',
    ],
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
    isPublished: true,
    sortOrder: 6,
  },
  {
    id: 'CRS-CLS5',
    classGrade: 'Class 5',
    academicSession: '2026-27',
    stage: 'Primary Graduating Wing',
    age: '10+ Years',
    medium: 'Bilingual (UP Board curriculum standard)',
    timing: '8:00 AM – 2:00 PM (Primary Graduating Wing)',
    weeklyLoad: '36 Periods / Week',
    overview: 'Preparatory critical reasoning, confident verbal articulation, and solid academic grounding.',
    curriculumPoints: [
      'Advanced comprehension, critical reasoning, and bilingual debates',
      'Decimals, unitary method, area, perimeter, and mathematical data interpretation',
      'Environmental science: human anatomy, ecosystems, and civic responsibility',
      'Leadership development, computer fundamentals, and readiness for middle school',
    ],
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
    isPublished: true,
    sortOrder: 7,
  },
];

import { DEMO_SAMPLE_DATA } from '../config/demoAccounts.js';

// Known demo identifiers from previous demo seeds to be purged from storage
const DEMO_IDENTIFIERS = new Set([
  'NDRN-2026-0412', 'NDRN-2026-0413', 'NDRN-2026-0414', 'NDRN-2026-0415',
  'NDRN-2026-0416', 'NDRN-2026-0417', 'NDRN-2026-0418', 'NDRN-2026-0419',
  'PAR-8821', 'PAR-8822', 'PAR-8823', 'PAR-8824',
  'FAC-2026-102', 'FAC-2026-103', 'FAC-2026-104', 'FAC-2026-105',
  'EVT-01', 'EVT-02', 'EVT-03',
  'GAL-01', 'GAL-02', 'GAL-03', 'GAL-04',
  'ADM-2026-001', 'ADM-2026-002', 'ADM-2026-003',
  'MSG-101', 'MSG-102',
  'FEE-101', 'FEE-102', 'FEE-103',
  'FS-NUR', 'FS-LKG', 'FS-UKG', 'FS-1', 'FS-2', 'FS-3', 'FS-4', 'FS-5',
  'HW-01', 'HW-02', 'HW-03', 'HW-04', 'HW-05', 'HW-06',
  'LV-101', 'LV-102'
]);

export function isDemoSessionActive() {
  try {
    if (typeof localStorage !== 'undefined') {
      const authUser = localStorage.getItem('ndrn_auth_user');
      if (authUser) {
        const parsed = JSON.parse(authUser);
        return !!parsed.isDemo;
      }
    }
  } catch {
    return false;
  }
  return false;
}

function purgeDemoRecords(data) {
  if (isDemoSessionActive()) return data; // Preserve sample evaluation data during demo session
  if (!Array.isArray(data)) return data;
  return data.filter((item) => {
    if (!item) return false;
    if (item.id && DEMO_IDENTIFIERS.has(item.id)) return false;
    if (item._id && DEMO_IDENTIFIERS.has(item._id)) return false;
    if (typeof item.name === 'string' && item.name.includes('[Faculty Name Placeholder]')) return false;
    return true;
  });
}

// Safe Local Storage Handlers with In-Memory Resilience and Automatic Demo Purge
const memoryStore = new Map();

function getStorage(key, fallback) {
  try {
    if (typeof localStorage !== 'undefined') {
      const item = localStorage.getItem(key);
      if (!item) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed)) {
        const cleaned = purgeDemoRecords(parsed);
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(key, JSON.stringify(cleaned));
          return cleaned;
        }
        return parsed;
      }
      return parsed;
    }
  } catch {
    // Fallback to memory
  }
  if (!memoryStore.has(key)) {
    memoryStore.set(key, JSON.parse(JSON.stringify(fallback)));
  }
  return memoryStore.get(key);
}

function setStorage(key, value) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
  } catch (err) {
    console.warn('DataService localStorage write failed, using memory store:', err);
  }
  memoryStore.set(key, value);
}

// --- UTILITIES FOR FEE STRUCTURE & SESSIONS ---
export function normalizeAcademicSession(session) {
  if (!session) return '';
  if (typeof session === 'object') {
    session = session.session || session.academicSession || '';
  }
  const clean = String(session).trim();
  if (clean.toLowerCase() === 'all') return 'all';
  const unified = clean.replace(/[\u2010-\u2015\u2212]/g, '-').replace(/\s+/g, '');
  return unified.replace(/^(\d{4})-(?:20)?(\d{2})$/, '$1-$2');
}

export function calculateTotalEstimatedAnnualFee(item = {}) {
  const admissionFee = Number(item.admissionFee) || 0;
  const monthlyTuitionFee = Number(item.monthlyTuitionFee) || 0;
  const annualCharges = Number(item.annualCharges) || 0;
  const otherCharges = Number(item.otherCharges) || 0;
  return admissionFee + monthlyTuitionFee * 12 + annualCharges + otherCharges;
}

export const DataService = {
  // --- WEBSITE SETTINGS ---
  getSettings() {
    const settings = getStorage(STORAGE_KEYS.SETTINGS, SEED_SETTINGS);
    let changed = false;
    if (settings.principalName === 'Dr. S. K. Sharma' || settings.principalName === 'Dr. S.K. Sharma') {
      settings.principalName = 'D.K. Saini';
      changed = true;
    }
    if (settings.affiliationInfo && settings.affiliationInfo.includes('Private')) {
      settings.affiliationInfo = settings.affiliationInfo.replace(/Private/g, 'UP Board');
      changed = true;
    }
    if (settings.schoolType === 'Private School') {
      settings.schoolType = 'UP Board';
      changed = true;
    }
    if (!settings.phone || settings.phone.includes('98765')) {
      settings.phone = '+91 8429231617';
      changed = true;
    }
    if (settings.secondaryPhone && settings.secondaryPhone.includes('98765')) {
      settings.secondaryPhone = '';
      changed = true;
    }
    if (!settings.email || settings.email.includes('ndrnvidyalaya.edu.in')) {
      settings.email = 'ueyuwhw@gmail.com';
      changed = true;
    }
    if (!settings.whatsapp || settings.whatsapp.includes('98765')) {
      settings.whatsapp = '+91 8429231617';
      changed = true;
    }
    if (changed) {
      setStorage(STORAGE_KEYS.SETTINGS, settings);
    }
    return settings;
  },
  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    setStorage(STORAGE_KEYS.SETTINGS, updated);
    this.logActivity('Settings Updated', 'School website and institutional parameters saved', 'admin');
    return updated;
  },

  // --- RECENT ACTIVITIES LOG ---
  getActivities() {
    const list = getStorage(STORAGE_KEYS.ACTIVITIES, SEED_ACTIVITIES);
    if (isDemoSessionActive() && list.length === 0) {
      return DEMO_SAMPLE_DATA.adminActivities || [];
    }
    return list;
  },
  logActivity(action, description, category = 'system') {
    const current = this.getActivities();
    const newAct = {
      id: Date.now(),
      action,
      description,
      time: 'Just now',
      category,
    };
    const updated = [newAct, ...current.slice(0, 19)];
    setStorage(STORAGE_KEYS.ACTIVITIES, updated);
    return updated;
  },

  // --- STUDENTS CRUD ---
  getStudents() {
    const stored = getStorage(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    if (isDemoSessionActive() && stored.length === 0) {
      return DEMO_SAMPLE_DATA.demoStudents || [];
    }
    return stored;
  },
  getStudentById(id) {
    const list = this.getStudents();
    return list.find((s) => s.id === id || s.admissionNo === id) || null;
  },
  addStudent(studentData) {
    const current = this.getStudents();
    const newStudent = {
      id: `NDRN-2026-${String(current.length + 1).padStart(4, '0')}`,
      status: 'Active',
      admissionDate: new Date().toISOString().split('T')[0],
      attendancePercent: 100,
      feeStatus: 'Due',
      pendingFeeAmount: 0,
      termGrade: 'Enrolled',
      ...studentData,
    };
    const updated = [newStudent, ...current];
    setStorage(STORAGE_KEYS.STUDENTS, updated);
    this.logActivity('Student Added', `Enrolled ${newStudent.name} into ${newStudent.grade}-${newStudent.section || 'A'}`, 'student');
    return newStudent;
  },
  updateStudent(id, updatedFields) {
    const current = this.getStudents();
    const updated = current.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
    setStorage(STORAGE_KEYS.STUDENTS, updated);
    this.logActivity('Student Updated', `Updated profile for ID ${id}`, 'student');
    return updated.find((s) => s.id === id);
  },
  deleteStudent(id) {
    const current = this.getStudents();
    const target = current.find((s) => s.id === id);
    const updated = current.filter((s) => s.id !== id);
    setStorage(STORAGE_KEYS.STUDENTS, updated);
    this.logActivity('Student Removed', `Deactivated record for ${target?.name || id}`, 'student');
    return updated;
  },

  // --- PARENTS CRUD ---
  getParents() {
    const stored = getStorage(STORAGE_KEYS.PARENTS, SEED_PARENTS);
    if (isDemoSessionActive() && stored.length === 0) {
      return DEMO_SAMPLE_DATA.demoParents || [];
    }
    return stored;
  },
  getParentById(id) {
    const list = this.getParents();
    return list.find((p) => p.id === id) || null;
  },
  addParent(parentData) {
    const current = this.getParents();
    const newParent = {
      id: `PAR-${String(Math.floor(1000 + Math.random() * 9000))}`,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      ...parentData,
    };
    const updated = [newParent, ...current];
    setStorage(STORAGE_KEYS.PARENTS, updated);
    this.logActivity('Parent Registered', `Added guardian ${newParent.name}`, 'parent');
    return newParent;
  },
  updateParent(id, updatedFields) {
    const current = this.getParents();
    const updated = current.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    setStorage(STORAGE_KEYS.PARENTS, updated);
    this.logActivity('Parent Updated', `Updated parent ${id}`, 'parent');
    return updated.find((p) => p.id === id);
  },
  deleteParent(id) {
    const current = this.getParents();
    const updated = current.filter((p) => p.id !== id);
    setStorage(STORAGE_KEYS.PARENTS, updated);
    this.logActivity('Parent Removed', `Removed guardian ID ${id}`, 'parent');
    return updated;
  },
  linkParentToStudent(parentId, studentId, relationship = 'Parent') {
    const student = this.getStudentById(studentId);
    if (!student) return null;
    return this.updateParent(parentId, {
      wardId: student.id,
      wardName: student.name,
      wardGrade: `${student.grade}-${student.section || 'A'}`,
      relationship,
    });
  },

  // --- TEACHERS CRUD ---
  getTeachers() {
    const stored = getStorage(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
    if (isDemoSessionActive() && stored.length === 0) {
      return DEMO_SAMPLE_DATA.demoTeachers || [];
    }
    return stored;
  },
  getTeacherById(id) {
    const list = this.getTeachers();
    return list.find((t) => t.id === id) || null;
  },
  addTeacher(teacherData) {
    const current = this.getTeachers();
    const newTeacher = {
      id: `FAC-2026-${String(current.length + 1).padStart(3, '0')}`,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0],
      assignedClasses: teacherData.assignedClasses || [],
      primarySubjects: teacherData.primarySubjects || [],
      ...teacherData,
    };
    const updated = [newTeacher, ...current];
    setStorage(STORAGE_KEYS.TEACHERS, updated);
    this.logActivity('Teacher Appointed', `Added educator ${newTeacher.name}`, 'teacher');
    return newTeacher;
  },
  updateTeacher(id, updatedFields) {
    const current = this.getTeachers();
    const updated = current.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    setStorage(STORAGE_KEYS.TEACHERS, updated);
    this.logActivity('Teacher Updated', `Updated profile for ${id}`, 'teacher');
    return updated.find((t) => t.id === id);
  },
  deleteTeacher(id) {
    const current = this.getTeachers();
    const updated = current.filter((t) => t.id !== id);
    setStorage(STORAGE_KEYS.TEACHERS, updated);
    this.logActivity('Teacher Removed', `Deactivated teacher ${id}`, 'teacher');
    return updated;
  },

  // --- CLASSES CRUD ---
  getClasses() {
    if (isDemoSessionActive()) {
      return DEMO_SAMPLE_DATA.demoClasses || SEED_CLASSES;
    }
    const classes = getStorage(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const students = this.getStudents();
    return classes.map((cls) => ({
      ...cls,
      studentCount: students.filter((s) => s.grade === cls.name).length,
    }));
  },
  addClass(classData) {
    const current = this.getClasses();
    const newClass = {
      id: `CLS-${Date.now().toString().slice(-4)}`,
      capacity: 35,
      studentCount: 0,
      classTeacher: '',
      ...classData,
    };
    const updated = [...current, newClass];
    setStorage(STORAGE_KEYS.CLASSES, updated);
    this.logActivity('Class Added', `Created cohort ${newClass.name} ${newClass.section || 'A'}`, 'academic');
    return newClass;
  },
  updateClass(id, updatedFields) {
    const current = getStorage(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const updated = current.map((c) => (c.id === id ? { ...c, ...updatedFields } : c));
    setStorage(STORAGE_KEYS.CLASSES, updated);
    return updated.find((c) => c.id === id);
  },
  deleteClass(id) {
    const current = getStorage(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    const updated = current.filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CLASSES, updated);
    return updated;
  },

  // --- SUBJECTS CRUD ---
  getSubjects() {
    return getStorage(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
  },
  addSubject(subjectData) {
    const current = this.getSubjects();
    const newSubject = {
      id: `SUB-${Date.now().toString().slice(-4)}`,
      grades: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
      maxMarks: 100,
      ...subjectData,
    };
    const updated = [...current, newSubject];
    setStorage(STORAGE_KEYS.SUBJECTS, updated);
    this.logActivity('Subject Added', `Added subject ${newSubject.name}`, 'academic');
    return newSubject;
  },
  updateSubject(id, updatedFields) {
    const current = this.getSubjects();
    const updated = current.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
    setStorage(STORAGE_KEYS.SUBJECTS, updated);
    return updated.find((s) => s.id === id);
  },
  deleteSubject(id) {
    const current = this.getSubjects();
    const updated = current.filter((s) => s.id !== id);
    setStorage(STORAGE_KEYS.SUBJECTS, updated);
    return updated;
  },

  // --- ATTENDANCE & LEAVE MANAGEMENT ---
  getAttendanceRecords() {
    const list = getStorage(STORAGE_KEYS.ATTENDANCE, []);
    if (isDemoSessionActive() && list.length === 0) {
      return DEMO_SAMPLE_DATA.attendanceRecords || [];
    }
    return list;
  },
  markClassAttendance(record) {
    const current = this.getAttendanceRecords();
    const newRec = {
      id: Date.now(),
      date: record.date || new Date().toISOString().split('T')[0],
      ...record,
    };
    const updated = [newRec, ...current];
    setStorage(STORAGE_KEYS.ATTENDANCE, updated);
    this.logActivity('Attendance Recorded', `Marked attendance for ${newRec.className}-${newRec.section}`, 'attendance');
    return newRec;
  },
  getLeaveRequests() {
    return getStorage(STORAGE_KEYS.LEAVES, []);
  },
  addLeaveRequest(leaveData) {
    const current = this.getLeaveRequests();
    const newReq = {
      id: `LV-${Date.now().toString().slice(-4)}`,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
      approvedBy: 'Pending Teacher Verification',
      ...leaveData,
    };
    const updated = [newReq, ...current];
    setStorage(STORAGE_KEYS.LEAVES, updated);
    this.logActivity('Leave Application', `Submitted for student ${newReq.studentId}`, 'attendance');
    return newReq;
  },

  // --- HOMEWORK & TASKS ---
  getHomeworkTasks(grade) {
    let all = getStorage(STORAGE_KEYS.HOMEWORK, []);
    if (isDemoSessionActive() && all.length === 0) {
      all = DEMO_SAMPLE_DATA.homeworkTasks || [];
    }
    if (!grade || grade === 'All') return all;
    const cleanGrade = grade.split('-')[0].trim();
    return all.filter((t) => !t.grade || t.grade.startsWith(cleanGrade) || cleanGrade.startsWith(t.grade));
  },
  addHomeworkTask(taskData) {
    const current = getStorage(STORAGE_KEYS.HOMEWORK, []);
    const newTask = {
      id: `HW-${Date.now().toString().slice(-4)}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      ...taskData,
    };
    const updated = [newTask, ...current];
    setStorage(STORAGE_KEYS.HOMEWORK, updated);
    this.logActivity('Homework Assigned', `Assigned ${newTask.subject} for ${newTask.grade}`, 'academic');
    return newTask;
  },
  updateHomeworkStatus(taskId, status, submissionData) {
    const all = this.getHomeworkTasks('All');
    const updated = all.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status,
            submissionDate: new Date().toLocaleDateString('en-GB'),
            ...submissionData,
          }
        : t
    );
    setStorage(STORAGE_KEYS.HOMEWORK, updated);
    return updated.find((t) => t.id === taskId);
  },

  // --- TIMETABLE ---
  getTimetableByClass(grade = 'Class 5') {
    const timetables = getStorage(STORAGE_KEYS.TIMETABLES, {});
    const cleanGrade = grade.split('-')[0].trim();
    if (timetables[cleanGrade]) return timetables[cleanGrade];
    if (isDemoSessionActive()) {
      return DEMO_SAMPLE_DATA.timetable;
    }
    return null;
  },
  saveTimetable(grade, timetableData) {
    const timetables = getStorage(STORAGE_KEYS.TIMETABLES, {});
    const cleanGrade = grade.split('-')[0].trim();
    timetables[cleanGrade] = timetableData;
    setStorage(STORAGE_KEYS.TIMETABLES, timetables);
    return timetableData;
  },

  // --- RESULTS & SCHOLASTIC REPORT CARD ---
  getStudentResults(studentId) {
    const results = getStorage(STORAGE_KEYS.RESULTS, {});
    if (results[studentId]) return results[studentId];
    if (isDemoSessionActive()) {
      return DEMO_SAMPLE_DATA.studentResults;
    }
    return null;
  },
  saveStudentResult(studentId, resultData) {
    const results = getStorage(STORAGE_KEYS.RESULTS, {});
    results[studentId] = resultData;
    setStorage(STORAGE_KEYS.RESULTS, results);
    return resultData;
  },

  // --- FEES MANAGEMENT & STUDENT LEDGER ---
  getFees() {
    const list = getStorage(STORAGE_KEYS.FEES, SEED_FEES);
    if (isDemoSessionActive() && list.length === 0) {
      return DEMO_SAMPLE_DATA.feeTransactions || [];
    }
    return list;
  },
  getFeeTransactions() {
    return this.getFees();
  },
  getStudentFeeLedger(studentId) {
    if (isDemoSessionActive()) {
      return {
        studentId: studentId || 'DEMO-STU-01',
        summary: {
          totalBilled: 12800,
          totalPaid: 9600,
          outstanding: 3200,
          nextDueDate: '10 Jan 2027',
          status: 'Quarter 4 Due',
        },
        invoices: DEMO_SAMPLE_DATA.feeInvoices || [],
        receipts: DEMO_SAMPLE_DATA.feeTransactions || [],
      };
    }

    const allFees = this.getFees();
    const studentInvoices = allFees.filter(
      (f) => studentId && f.studentId === studentId
    );

    const totalPaid = studentInvoices
      .filter((f) => f.status === 'Paid')
      .reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    return {
      studentId: studentId || '',
      summary: {
        totalBilled: totalPaid,
        totalPaid,
        outstanding: 0,
        nextDueDate: null,
        status: totalPaid > 0 ? 'Up to date' : 'No fee records found',
      },
      invoices: [],
      receipts: studentInvoices,
    };
  },
  recordFeePayment(paymentData) {
    const current = this.getFees();
    const newFee = {
      id: `FEE-${Date.now().toString().slice(-4)}`,
      receiptNo: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      paidDate: new Date().toISOString().split('T')[0],
      status: 'Paid',
      receivedBy: 'Administrative Cashier Desk',
      ...paymentData,
    };
    const updated = [newFee, ...current];
    setStorage(STORAGE_KEYS.FEES, updated);

    if (newFee.studentId) {
      this.updateStudent(newFee.studentId, {
        feeStatus: 'Paid',
        pendingFeeAmount: 0,
      });
    }

    this.logActivity('Fee Collected', `Receipt #${newFee.receiptNo} of ₹${newFee.amount} for ${newFee.studentName || 'Student'}`, 'fee');
    return newFee;
  },

  // --- NOTICES CRUD ---
  getNotices(targetAudience = 'all') {
    let list = getStorage(STORAGE_KEYS.NOTICES, SEED_NOTICES);
    if (isDemoSessionActive() && list.length === 0) {
      list = DEMO_SAMPLE_DATA.adminNotices || [];
    }
    if (!targetAudience || targetAudience === 'all') return list;
    return list.filter((n) => !n.audience || n.audience === 'all' || n.audience === targetAudience);
  },
  addNotice(noticeData) {
    const current = getStorage(STORAGE_KEYS.NOTICES, SEED_NOTICES);
    const newNotice = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      priority: noticeData.priority || 'normal',
      author: noticeData.author || 'School Administration',
      pinned: noticeData.pinned || false,
      ...noticeData,
    };
    const updated = [newNotice, ...current];
    setStorage(STORAGE_KEYS.NOTICES, updated);
    this.logActivity('Notice Published', `Circular: "${newNotice.title}" published`, 'notice');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:notices-updated', { detail: { notice: newNotice } }));
    }
    return newNotice;
  },
  updateNotice(id, updatedFields) {
    const current = getStorage(STORAGE_KEYS.NOTICES, SEED_NOTICES);
    const updated = current.map((n) => (n.id === id || n._id === id ? { ...n, ...updatedFields } : n));
    setStorage(STORAGE_KEYS.NOTICES, updated);
    this.logActivity('Notice Updated', `Updated notice ID ${id}`, 'notice');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:notices-updated', { detail: { id, updatedFields } }));
    }
    return updated.find((n) => n.id === id || n._id === id);
  },
  togglePinNotice(id) {
    const current = getStorage(STORAGE_KEYS.NOTICES, SEED_NOTICES);
    const notice = current.find((n) => n.id === id || n._id === id);
    if (!notice) return null;
    const isPinned = notice.pinned !== undefined ? Boolean(notice.pinned) : Boolean(notice.isPinned);
    return this.updateNotice(id, { pinned: !isPinned, isPinned: !isPinned });
  },
  deleteNotice(id) {
    const current = getStorage(STORAGE_KEYS.NOTICES, SEED_NOTICES);
    const updated = current.filter((n) => n.id !== id && n._id !== id);
    setStorage(STORAGE_KEYS.NOTICES, updated);
    this.logActivity('Notice Deleted', `Removed circular ID ${id}`, 'notice');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:notices-updated', { detail: { id, deleted: true } }));
    }
    return updated;
  },

  // --- EVENTS CRUD ---
  getEvents() {
    const list = getStorage(STORAGE_KEYS.EVENTS, SEED_EVENTS);
    if (isDemoSessionActive() && list.length === 0) {
      return DEMO_SAMPLE_DATA.adminEvents || [];
    }
    return list;
  },
  addEvent(eventData) {
    const current = this.getEvents();
    const resolvedStatus = eventData.status || 'Upcoming';
    const resolvedType = eventData.type || (resolvedStatus === 'Completed' || resolvedStatus === 'completed' || resolvedStatus === 'Past' ? 'past' : 'upcoming');
    const targetId = eventData.id || eventData._id || `EVT-${Date.now().toString().slice(-4)}`;
    const newEvent = {
      status: resolvedStatus,
      type: resolvedType,
      ...eventData,
      id: targetId,
    };
    if (eventData.status && !eventData.type) {
      newEvent.type = resolvedType;
    }
    const filtered = current.filter((e) => e.id !== targetId && e._id !== targetId);
    const updated = [newEvent, ...filtered];
    setStorage(STORAGE_KEYS.EVENTS, updated);
    this.logActivity('Event Created', `Scheduled event: "${newEvent.title}"`, 'event');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:events-updated', { detail: { event: newEvent } }));
    }
    return newEvent;
  },
  updateEvent(id, updatedFields) {
    const current = this.getEvents();
    const updated = current.map((e) => {
      if (e.id === id || e._id === id) {
        const merged = { ...e, ...updatedFields };
        if (updatedFields.status && !updatedFields.type) {
          merged.type = (merged.status === 'Completed' || merged.status === 'completed' || merged.status === 'Past') ? 'past' : 'upcoming';
        }
        return merged;
      }
      return e;
    });
    setStorage(STORAGE_KEYS.EVENTS, updated);
    this.logActivity('Event Updated', `Updated event ID ${id}`, 'event');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:events-updated', { detail: { id, updatedFields } }));
    }
    return updated.find((e) => e.id === id || e._id === id);
  },
  deleteEvent(id) {
    const current = this.getEvents();
    const updated = current.filter((e) => e.id !== id && e._id !== id);
    setStorage(STORAGE_KEYS.EVENTS, updated);
    this.logActivity('Event Removed', `Deleted event ID ${id}`, 'event');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:events-updated', { detail: { id, deleted: true } }));
    }
    return updated;
  },

  // --- GALLERY CRUD ---
  getGallery() {
    const items = getStorage(STORAGE_KEYS.GALLERY, SEED_GALLERY);
    if (!items || items.length === 0) {
      setStorage(STORAGE_KEYS.GALLERY, SEED_GALLERY);
      return SEED_GALLERY;
    }
    if (!items.some((g) => g.image === '/images/school-building.jpg' || g.image === '/images/school-campus.jpg')) {
      const merged = [...SEED_GALLERY, ...items];
      setStorage(STORAGE_KEYS.GALLERY, merged);
      return merged;
    }
    return items;
  },
  addGalleryItem(item) {
    const current = this.getGallery();
    const newItem = {
      id: `GAL-${Date.now().toString().slice(-4)}`,
      category: item.category || 'Campus',
      ...item,
    };
    const updated = [newItem, ...current];
    setStorage(STORAGE_KEYS.GALLERY, updated);
    this.logActivity('Gallery Photo Added', `Uploaded "${newItem.title}" to gallery`, 'gallery');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:gallery-updated', { detail: { item: newItem } }));
    }
    return newItem;
  },
  deleteGalleryItem(id) {
    const current = this.getGallery();
    const updated = current.filter((g) => g.id !== id);
    setStorage(STORAGE_KEYS.GALLERY, updated);
    this.logActivity('Gallery Photo Removed', `Deleted media ID ${id}`, 'gallery');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:gallery-updated', { detail: { id, deleted: true } }));
    }
    return updated;
  },

  // --- ADMISSIONS CRUD ---
  getAdmissions() {
    const list = getStorage(STORAGE_KEYS.ADMISSIONS, SEED_ADMISSIONS);
    if (isDemoSessionActive() && list.length === 0) {
      return DEMO_SAMPLE_DATA.adminAdmissions || [];
    }
    return list;
  },
  addAdmissionInquiry(data) {
    const current = this.getAdmissions();
    const newInquiry = {
      id: `ADM-2026-${String(current.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      status: 'New',
      notes: 'Submitted via Online Admissions Portal.',
      ...data,
    };
    const updated = [newInquiry, ...current];
    setStorage(STORAGE_KEYS.ADMISSIONS, updated);
    this.logActivity('Admission Enquiry', `New application for ${newInquiry.studentName} (${newInquiry.gradeApplying})`, 'admission');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:admissions-updated', { detail: { inquiry: newInquiry } }));
    }
    return newInquiry;
  },
  updateAdmissionStatus(id, newStatus, notes) {
    const current = this.getAdmissions();
    const updated = current.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          notes: notes !== undefined ? notes : item.notes,
        };
      }
      return item;
    });
    setStorage(STORAGE_KEYS.ADMISSIONS, updated);
    this.logActivity('Admission Status Changed', `Marked ${id} as ${newStatus}`, 'admission');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:admissions-updated', { detail: { id, status: newStatus } }));
    }
    return updated.find((a) => a.id === id) || updated;
  },
  deleteAdmission(id) {
    const current = this.getAdmissions();
    const updated = current.filter((a) => a.id !== id);
    setStorage(STORAGE_KEYS.ADMISSIONS, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:admissions-updated', { detail: { id, deleted: true } }));
    }
    return updated;
  },

  // --- CONTACTS / HELPDESK ---
  getContacts() {
    return getStorage(STORAGE_KEYS.CONTACTS, SEED_CONTACTS);
  },
  addContactMessage(msg) {
    const current = this.getContacts();
    const newMsg = {
      id: `MSG-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Open',
      reply: '',
      ...msg,
    };
    const updated = [newMsg, ...current];
    setStorage(STORAGE_KEYS.CONTACTS, updated);
    this.logActivity('Contact Query Received', `Message from ${newMsg.name}`, 'contact');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:contacts-updated', { detail: { message: newMsg } }));
    }
    return newMsg;
  },
  updateContactStatus(id, newStatus, reply) {
    const current = this.getContacts();
    const updated = current.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          status: newStatus,
          reply: reply !== undefined ? reply : c.reply,
        };
      }
      return c;
    });
    setStorage(STORAGE_KEYS.CONTACTS, updated);
    this.logActivity('Contact Response Sent', `Resolved query ${id}`, 'contact');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:contacts-updated', { detail: { id, status: newStatus } }));
    }
    return updated.find((c) => c.id === id) || updated;
  },
  deleteContact(id) {
    const current = this.getContacts();
    const updated = current.filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CONTACTS, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndrn:contacts-updated', { detail: { id, deleted: true } }));
    }
    return updated;
  },

  // --- PUBLIC & ADMIN FEE STRUCTURE CRUD ---
  getFeeStructures(onlyPublished = false, session = '2026-27') {
    const list = getStorage(STORAGE_KEYS.FEE_STRUCTURE, SEED_FEE_STRUCTURE);
    const targetSession = normalizeAcademicSession(session);
    let filtered = list;

    if (targetSession && targetSession !== 'all') {
      filtered = filtered.filter(
        (f) => normalizeAcademicSession(f.academicSession) === targetSession
      );
    }
    if (onlyPublished) {
      filtered = filtered.filter((f) => Boolean(f.isPublished));
    }
    return filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },
  getFeeStructureById(id) {
    const list = getStorage(STORAGE_KEYS.FEE_STRUCTURE, SEED_FEE_STRUCTURE);
    return list.find((f) => f.id === id || f._id === id) || null;
  },
  saveFeeStructure(data) {
    const current = getStorage(STORAGE_KEYS.FEE_STRUCTURE, SEED_FEE_STRUCTURE);
    const calculatedTotal = calculateTotalEstimatedAnnualFee(data);
    const normalizedSession = normalizeAcademicSession(data.academicSession || '2026-27');

    const recordData = {
      ...data,
      admissionFee: Number(data.admissionFee || 0),
      monthlyTuitionFee: Number(data.monthlyTuitionFee || 0),
      annualCharges: Number(data.annualCharges || 0),
      otherCharges: Number(data.otherCharges || 0),
      busFee: Number(data.busFee || 0),
      totalEstimatedAnnualFee: calculatedTotal,
      academicSession: normalizedSession,
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      isVerified: data.isVerified !== undefined ? Boolean(data.isVerified) : true,
      notes: data.notes || '',
      updatedAt: new Date().toISOString(),
    };

    let updated;
    const existingIndex = current.findIndex(
      (f) => f.id === data.id || (data._id && f._id === data._id)
    );

    if (existingIndex >= 0) {
      updated = current.map((item, idx) => (idx === existingIndex ? { ...item, ...recordData } : item));
      this.logActivity('Fee Structure Updated', `Updated fee for ${recordData.classGrade}`, 'admin');
    } else {
      const newRecord = {
        id: `FS-${Date.now().toString().slice(-4)}`,
        sortOrder: current.length + 1,
        ...recordData,
      };
      updated = [...current, newRecord];
      this.logActivity('Fee Structure Created', `Added fee for ${newRecord.classGrade}`, 'admin');
    }

    setStorage(STORAGE_KEYS.FEE_STRUCTURE, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ndrn:fee-structure-updated', {
          detail: { record: recordData, session: normalizedSession },
        })
      );
    }
    return updated;
  },
  deleteFeeStructure(id) {
    const current = getStorage(STORAGE_KEYS.FEE_STRUCTURE, SEED_FEE_STRUCTURE);
    const target = current.find((f) => f.id === id || f._id === id);
    const updated = current.filter((f) => f.id !== id && f._id !== id);
    setStorage(STORAGE_KEYS.FEE_STRUCTURE, updated);
    if (target) {
      this.logActivity('Fee Structure Deleted', `Removed fee record for ${target.classGrade}`, 'admin');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ndrn:fee-structure-updated', {
          detail: { id, deleted: true },
        })
      );
    }
    return updated;
  },
  togglePublishFeeStructure(id, isPublished) {
    const current = getStorage(STORAGE_KEYS.FEE_STRUCTURE, SEED_FEE_STRUCTURE);
    let targetRecord = null;
    const updated = current.map((f) => {
      if (f.id === id || f._id === id) {
        const nextPublished = typeof isPublished === 'boolean' ? isPublished : !f.isPublished;
        targetRecord = {
          ...f,
          isPublished: nextPublished,
          updatedAt: new Date().toISOString(),
        };
        return targetRecord;
      }
      return f;
    });
    setStorage(STORAGE_KEYS.FEE_STRUCTURE, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ndrn:fee-structure-updated', {
          detail: { id, isPublished: targetRecord ? targetRecord.isPublished : isPublished },
        })
      );
    }
    return updated;
  },
  bulkPublishFeeStructures(session = '2026-27', isPublished = true) {
    const current = getStorage(STORAGE_KEYS.FEE_STRUCTURE, SEED_FEE_STRUCTURE);
    const targetSession = normalizeAcademicSession(session);
    const updated = current.map((f) => {
      if (normalizeAcademicSession(f.academicSession) === targetSession) {
        return {
          ...f,
          isPublished,
          updatedAt: new Date().toISOString(),
        };
      }
      return f;
    });
    setStorage(STORAGE_KEYS.FEE_STRUCTURE, updated);
    this.logActivity('Fee Structure Bulk Updated', `${isPublished ? 'Published' : 'Unpublished'} all fees for ${targetSession}`, 'admin');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ndrn:fee-structure-updated', {
          detail: { session: targetSession, bulk: true, isPublished },
        })
      );
    }
    return updated;
  },
  resetFeeStructuresToDefault() {
    setStorage(STORAGE_KEYS.FEE_STRUCTURE, SEED_FEE_STRUCTURE);
    return SEED_FEE_STRUCTURE;
  },

  // --- PUBLIC & ADMIN COURSE SPECIFICATIONS CRUD ---
  getCourses(onlyPublished = false, session = '2026-27') {
    const list = getStorage(STORAGE_KEYS.COURSES, SEED_COURSES);
    const targetSession = normalizeAcademicSession(session);
    let filtered = list;

    if (targetSession && targetSession !== 'all') {
      filtered = filtered.filter(
        (c) => normalizeAcademicSession(c.academicSession) === targetSession
      );
    }
    if (onlyPublished) {
      filtered = filtered.filter((c) => Boolean(c.isPublished));
    }
    return filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  },
  getCourseById(id) {
    const list = getStorage(STORAGE_KEYS.COURSES, SEED_COURSES);
    return list.find((c) => c.id === id || c._id === id) || null;
  },
  getCourseByGrade(classGrade, session = '2026-27') {
    const list = this.getCourses(false, session);
    const target = (classGrade || '').toLowerCase().trim();
    return (
      list.find((c) => {
        const cg = (c.classGrade || '').toLowerCase().trim();
        return cg === target || cg.includes(target) || target.includes(cg);
      }) || null
    );
  },
  saveCourse(data) {
    const current = getStorage(STORAGE_KEYS.COURSES, SEED_COURSES);
    const normalizedSession = normalizeAcademicSession(data.academicSession || '2026-27');

    const recordData = {
      ...data,
      academicSession: normalizedSession,
      isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      updatedAt: new Date().toISOString(),
    };

    let updated;
    const existingIndex = current.findIndex(
      (c) => c.id === data.id || (data._id && c._id === data._id) || (c.classGrade === data.classGrade && normalizeAcademicSession(c.academicSession) === normalizedSession)
    );

    if (existingIndex >= 0) {
      updated = current.map((item, idx) => (idx === existingIndex ? { ...item, ...recordData } : item));
      this.logActivity('Course Updated', `Updated course details for ${recordData.classGrade}`, 'admin');
    } else {
      const newRecord = {
        id: `CRS-${Date.now().toString().slice(-4)}`,
        sortOrder: current.length + 1,
        ...recordData,
      };
      updated = [...current, newRecord];
      this.logActivity('Course Created', `Added course details for ${newRecord.classGrade}`, 'admin');
    }

    setStorage(STORAGE_KEYS.COURSES, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ndrn:courses-updated', {
          detail: { record: recordData, session: normalizedSession },
        })
      );
    }
    return updated;
  },
  deleteCourse(id) {
    const current = getStorage(STORAGE_KEYS.COURSES, SEED_COURSES);
    const target = current.find((c) => c.id === id || c._id === id);
    const updated = current.filter((c) => c.id !== id && c._id !== id);
    setStorage(STORAGE_KEYS.COURSES, updated);
    if (target) {
      this.logActivity('Course Deleted', `Removed course details for ${target.classGrade}`, 'admin');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ndrn:courses-updated', {
          detail: { id, deleted: true },
        })
      );
    }
    return updated;
  },
  togglePublishCourse(id, isPublished) {
    const current = getStorage(STORAGE_KEYS.COURSES, SEED_COURSES);
    let targetRecord = null;
    const updated = current.map((c) => {
      if (c.id === id || c._id === id) {
        const nextPublished = typeof isPublished === 'boolean' ? isPublished : !c.isPublished;
        targetRecord = {
          ...c,
          isPublished: nextPublished,
          updatedAt: new Date().toISOString(),
        };
        return targetRecord;
      }
      return c;
    });
    setStorage(STORAGE_KEYS.COURSES, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ndrn:courses-updated', {
          detail: { id, isPublished: targetRecord ? targetRecord.isPublished : isPublished },
        })
      );
    }
    return updated;
  },
  resetCoursesToDefault() {
    setStorage(STORAGE_KEYS.COURSES, SEED_COURSES);
    return SEED_COURSES;
  },
};

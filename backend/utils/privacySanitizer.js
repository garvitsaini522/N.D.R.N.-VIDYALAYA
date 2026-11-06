/**
 * Privacy Sanitizer & Public Data Redaction Utilities
 *
 * Ensures that public-facing and non-admin API responses strictly redact
 * private teacher telephone numbers, personal emails, internal employee IDs,
 * user account identifiers, and internal database metadata.
 */

/**
 * Redact private contact and employee fields from teacher profiles for public view.
 * @param {object} teacher
 * @returns {object} Safe public teacher representation
 */
export function sanitizePublicTeacher(teacher) {
  if (!teacher) return null;
  const raw = typeof teacher.toObject === 'function' ? teacher.toObject() : teacher;
  const id = raw._id || raw.id;

  return {
    _id: id,
    id: id ? id.toString() : undefined,
    fullName: raw.fullName || raw.name || 'Educator',
    name: raw.fullName || raw.name || 'Educator',
    designation: raw.designation || 'Faculty Member',
    wing: raw.wing || 'Primary',
    qualification: raw.qualification || '',
    experienceYears: raw.experienceYears || 0,
    experience: raw.experienceYears ? `${raw.experienceYears} Years` : (raw.experience || '3 Years'),
    primarySubjects: Array.isArray(raw.primarySubjects) ? raw.primarySubjects : [],
    photoUrl: raw.photoUrl || null,
    avatar: raw.photoUrl || null,
    bio: raw.bio || '',
    assignedClasses: Array.isArray(raw.assignedClasses)
      ? raw.assignedClasses.map((c) => {
          if (typeof c === 'object' && c !== null) {
            return {
              _id: c._id,
              name: c.name,
              section: c.section,
            };
          }
          return c;
        })
      : [],
  };
}

/**
 * Sanitize class cohort objects for public response by redacting classTeacher personal contact details.
 * @param {object} classDoc
 * @returns {object}
 */
export function sanitizePublicClass(classDoc) {
  if (!classDoc) return null;
  const raw = typeof classDoc.toObject === 'function' ? classDoc.toObject() : { ...classDoc };

  if (raw.classTeacher && typeof raw.classTeacher === 'object') {
    raw.classTeacher = {
      _id: raw.classTeacher._id,
      fullName: raw.classTeacher.fullName || 'Class Teacher',
      designation: raw.classTeacher.designation || 'Educator',
      wing: raw.classTeacher.wing || 'Primary',
    };
  }

  // Remove internal revision keys
  delete raw.__v;

  return raw;
}

/**
 * Sanitize timetable period objects so teacher email and employeeId are not exposed.
 * @param {Array} periods
 * @returns {Array}
 */
export function sanitizeTimetablePeriods(periods) {
  if (!Array.isArray(periods)) return [];
  return periods.map((p) => {
    const period = typeof p.toObject === 'function' ? p.toObject() : { ...p };
    if (period.teacher && typeof period.teacher === 'object') {
      period.teacher = {
        _id: period.teacher._id,
        fullName: period.teacher.fullName || 'Assigned Faculty',
        designation: period.teacher.designation || 'Educator',
      };
    }
    delete period.__v;
    return period;
  });
}

/**
 * Escape regular expression control characters from user queries to prevent ReDoS.
 * @param {string} string
 * @returns {string}
 */
export function escapeRegex(string) {
  if (typeof string !== 'string') return '';
  return string.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validate query parameter against an allowed whitelist of enum values.
 * @param {any} val
 * @param {string[]} allowedValues
 * @param {string|null} defaultValue
 * @returns {string|null}
 */
export function sanitizeEnumQuery(val, allowedValues, defaultValue = null) {
  if (typeof val !== 'string') return defaultValue;
  const trimmed = val.trim();
  const matched = allowedValues.find((v) => v.toLowerCase() === trimmed.toLowerCase());
  return matched || defaultValue;
}


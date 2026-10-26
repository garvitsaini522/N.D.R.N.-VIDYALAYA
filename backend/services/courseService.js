import { Course } from '../models/Course.js';
import { ApiError } from '../utils/apiError.js';

export class CourseService {
  /**
   * Normalize session format (handles en-dash, em-dash, 4-digit span)
   */
  static normalizeSession(session) {
    if (!session) return '';
    const clean = String(session).trim();
    if (clean.toLowerCase() === 'all') return 'all';
    return clean
      .replace(/[\u2010-\u2015\u2212]/g, '-')
      .replace(/\s+/g, '')
      .replace(/^(\d{4})-(?:20)?(\d{2})$/, '$1-$2');
  }

  static getSessionQuery(academicSession) {
    const norm = this.normalizeSession(academicSession);
    if (!norm || norm === 'all') return null;
    const escaped = norm.replace(/[-]/g, '[-–—]');
    return { $regex: new RegExp(`^${escaped}$`, 'i') };
  }

  /**
   * Get public published courses for an academic session
   */
  static async getPublishedCourses(academicSession = '2026-27') {
    const query = { isPublished: true };
    const sessionMatch = this.getSessionQuery(academicSession);
    if (sessionMatch) {
      query.academicSession = sessionMatch;
    }

    return Course.find(query)
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
  }

  /**
   * Get all courses for admin
   */
  static async getAllCourses(academicSession) {
    const query = {};
    const sessionMatch = this.getSessionQuery(academicSession);
    if (sessionMatch) {
      query.academicSession = sessionMatch;
    }

    return Course.find(query)
      .sort({ sortOrder: 1, createdAt: 1 })
      .populate('updatedBy', 'name email role')
      .lean();
  }

  /**
   * Get single course by ID
   */
  static async getCourseById(id) {
    const course = await Course.findById(id).populate('updatedBy', 'name email role');
    if (!course) {
      throw ApiError.notFound('Course details record not found');
    }
    return course;
  }

  /**
   * Get single course by class grade & session
   */
  static async getCourseByGrade(classGrade, academicSession = '2026-27') {
    const query = { classGrade };
    const sessionMatch = this.getSessionQuery(academicSession);
    if (sessionMatch) {
      query.academicSession = sessionMatch;
    }
    return Course.findOne(query).lean();
  }

  /**
   * Create new course record
   */
  static async createCourse(data, userId) {
    const sessionToUse = this.normalizeSession(data.academicSession || '2026-27');
    const existing = await Course.findOne({
      classGrade: data.classGrade,
      academicSession: this.getSessionQuery(sessionToUse),
    });

    if (existing) {
      throw ApiError.badRequest(
        `Course specifications already exist for ${data.classGrade} in session ${sessionToUse}. Please edit the existing record.`
      );
    }

    const course = new Course({
      ...data,
      academicSession: sessionToUse,
      updatedBy: userId,
    });

    await course.save();
    return course;
  }

  /**
   * Update course record
   */
  static async updateCourse(id, data, userId) {
    const course = await Course.findById(id);
    if (!course) {
      throw ApiError.notFound('Course record not found');
    }

    if (
      (data.classGrade && data.classGrade !== course.classGrade) ||
      (data.academicSession && data.academicSession !== course.academicSession)
    ) {
      const targetSession = data.academicSession || course.academicSession;
      const duplicate = await Course.findOne({
        _id: { $ne: id },
        classGrade: data.classGrade || course.classGrade,
        academicSession: this.getSessionQuery(targetSession),
      });

      if (duplicate) {
        throw ApiError.badRequest(
          `Course specifications already exist for ${data.classGrade || course.classGrade} in session ${targetSession}.`
        );
      }
    }

    Object.assign(course, data);
    if (data.academicSession) {
      course.academicSession = this.normalizeSession(data.academicSession);
    }
    if (userId) {
      course.updatedBy = userId;
    }

    await course.save();
    return course;
  }

  /**
   * Delete course record
   */
  static async deleteCourse(id) {
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      throw ApiError.notFound('Course record not found');
    }
    return course;
  }

  /**
   * Toggle published status
   */
  static async togglePublishStatus(id, isPublished, userId) {
    const course = await Course.findById(id);
    if (!course) {
      throw ApiError.notFound('Course record not found');
    }

    course.isPublished = typeof isPublished === 'boolean' ? isPublished : !course.isPublished;
    if (userId) {
      course.updatedBy = userId;
    }

    await course.save();
    return course;
  }
}

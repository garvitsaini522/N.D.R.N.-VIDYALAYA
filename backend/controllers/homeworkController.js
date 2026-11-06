import mongoose from 'mongoose';
import { Homework } from '../models/Homework.js';
import { Class } from '../models/Class.js';
import { Student } from '../models/Student.js';
import { Teacher } from '../models/Teacher.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Resolve Class document from ObjectId or class name
 */
async function resolveClassDoc(identifier) {
  if (!identifier) return null;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const doc = await Class.findById(identifier);
    if (doc) return doc;
  }
  const cleanName = identifier.split('-')[0].trim();
  return await Class.findOne({ name: cleanName });
}

/**
 * GET /api/homework
 * Retrieve homework assignments with role-scoped access and verified submission states
 */
export async function getHomework(req, res, next) {
  try {
    const { classId, subject, status = 'active', page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    const user = req.user;
    let viewingStudentId = null;

    // 1. Role-based scoping
    if (user?.role === 'student') {
      if (!user.isLinked || !user.studentId) {
        throw ApiError.forbidden('Forbidden: Student account is not linked to an official student record.');
      }
      viewingStudentId = user.studentId;
      const student = await Student.findById(user.studentId).select('class').lean();
      if (!student || !student.class) {
        throw ApiError.forbidden('Forbidden: Student does not have an active class enrollment.');
      }
      query.class = student.class;
    } else if (user?.role === 'parent') {
      if (!user.isLinked || !user.wardIds || user.wardIds.length === 0) {
        throw ApiError.forbidden('Forbidden: Parent account is not linked to any verified student records.');
      }
      const wards = await Student.find({ _id: { $in: user.wardIds } }).select('_id class').lean();
      const wardClassIds = wards.map((w) => w.class?.toString()).filter(Boolean);

      if (classId) {
        const resolved = await resolveClassDoc(classId);
        if (resolved && wardClassIds.includes(resolved._id.toString())) {
          query.class = resolved._id;
        } else {
          throw ApiError.forbidden('Forbidden: Parents can only access homework for classes attended by their linked wards.');
        }
      } else {
        query.class = { $in: wardClassIds };
      }

      if (req.query.studentId && user.wardIds.map((id) => id.toString()).includes(req.query.studentId.toString())) {
        viewingStudentId = req.query.studentId;
      } else if (wards.length > 0) {
        viewingStudentId = wards[0]._id.toString();
      }
    } else if (user?.role === 'teacher' && user?.wing !== 'Administration') {
      const assignedClasses = (user.assignedClasses || []).map((c) => c.toString());
      if (classId) {
        const resolved = await resolveClassDoc(classId);
        if (resolved && assignedClasses.includes(resolved._id.toString())) {
          query.class = resolved._id;
        } else {
          throw ApiError.forbidden('Forbidden: Teachers are only permitted to view homework for their assigned classes.');
        }
      } else if (assignedClasses.length > 0) {
        query.class = { $in: assignedClasses };
      } else {
        query.class = { $in: [] };
      }
    } else if (classId) {
      const resolved = await resolveClassDoc(classId);
      if (resolved) {
        query.class = resolved._id;
      }
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Homework.find(query)
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('class', 'name section roomNumber')
        .populate('assignedBy', 'fullName designation employeeId')
        .lean(),
      Homework.countDocuments(query),
    ]);

    // Format homework records with accurate submission status
    const formatted = items.map((hw) => {
      let isSubmitted = false;
      let submissionDate = null;
      let submissionNotes = null;
      let submissionStatus = 'Pending';

      if (viewingStudentId && Array.isArray(hw.submissions)) {
        const found = hw.submissions.find(
          (s) => s.student?.toString() === viewingStudentId.toString()
        );
        if (found) {
          isSubmitted = true;
          submissionDate = found.submittedAt;
          submissionNotes = found.submissionNotes;
          submissionStatus = 'Submitted';
        } else if (new Date() > new Date(hw.dueDate)) {
          submissionStatus = 'Overdue';
        }
      }

      return {
        id: hw._id.toString(),
        _id: hw._id.toString(),
        title: hw.title,
        subject: hw.subject,
        description: hw.description,
        instructions: hw.description,
        assignedDate: hw.assignedDate,
        dueDate: hw.dueDate,
        dueDateFormatted: new Date(hw.dueDate).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        className: hw.class ? `${hw.class.name} - Section ${hw.class.section}` : 'Primary Cohort',
        classId: hw.class?._id?.toString() || hw.class?.toString(),
        assignedBy: hw.assignedBy?.fullName || 'Faculty Incharge',
        assignedByDesignation: hw.assignedBy?.designation || 'Educator',
        attachments: hw.attachments || [],
        status: submissionStatus,
        isSubmitted,
        submissionDate,
        submissionNotes,
        totalSubmissions: (hw.submissions || []).length,
      };
    });

    return ApiResponse.paginated(res, formatted, page, limit, total, 'Homework tasks retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/homework
 * Issue new homework assignment for a class cohort (Teacher / Administrator)
 */
export async function createHomework(req, res, next) {
  try {
    const { classId, subject, title, description, dueDate, attachments } = req.body;

    const classDoc = await resolveClassDoc(classId);
    if (!classDoc) {
      throw ApiError.notFound('Target class cohort not found in database.');
    }

    // Role-based permission check (Requirement 6)
    if (req.user?.role === 'teacher' && req.user?.wing !== 'Administration') {
      const assignedClasses = (req.user.assignedClasses || []).map((c) => c.toString());
      if (!assignedClasses.includes(classDoc._id.toString())) {
        throw ApiError.forbidden('Forbidden: Teachers are only permitted to issue homework for their assigned classes.');
      }
    }

    // Resolve teacher record
    let teacherId = null;
    if (req.user?.role === 'teacher') {
      const teacherDoc = await Teacher.findOne({ user: req.user.id });
      if (teacherDoc) {
        teacherId = teacherDoc._id;
      }
    }
    if (!teacherId && req.body.teacherId && mongoose.Types.ObjectId.isValid(req.body.teacherId)) {
      teacherId = req.body.teacherId;
    }
    if (!teacherId) {
      // Find default faculty for class
      const defaultTeacher = await Teacher.findOne({});
      teacherId = defaultTeacher?._id || new mongoose.Types.ObjectId();
    }

    const homework = await Homework.create({
      class: classDoc._id,
      subject: (subject || '').trim(),
      title: (title || '').trim(),
      description: (description || '').trim(),
      dueDate: new Date(dueDate),
      assignedBy: teacherId,
      attachments: Array.isArray(attachments) ? attachments : [],
      status: 'active',
      submissions: [],
    });

    const populated = await Homework.findById(homework._id)
      .populate('class', 'name section')
      .populate('assignedBy', 'fullName designation')
      .lean();

    return ApiResponse.created(res, populated, 'Homework assigned successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/homework/:id/submit
 * Submit homework solution directly to MongoDB (Student / Parent on behalf of linked child)
 */
export async function submitHomework(req, res, next) {
  try {
    const { id } = req.params;
    const { submissionNotes } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.badRequest('Invalid homework task identifier.');
    }

    const homework = await Homework.findById(id).populate('class', 'name section');
    if (!homework) {
      throw ApiError.notFound('Homework task not found in database.');
    }

    const user = req.user;
    let targetStudentId = null;

    // Strictly enforce student identity (Requirement 5: Never allow submitting for another student)
    if (user?.role === 'student') {
      if (!user.isLinked || !user.studentId) {
        throw ApiError.forbidden('Forbidden: Student account is not linked to an official student record.');
      }
      targetStudentId = user.studentId;
    } else if (user?.role === 'parent') {
      if (!user.isLinked || !user.wardIds || user.wardIds.length === 0) {
        throw ApiError.forbidden('Forbidden: Parent account is not linked to any verified student records.');
      }
      const candidateId = req.body.studentId || user.wardIds[0];
      const allowedWards = user.wardIds.map((w) => w.toString());
      if (!allowedWards.includes(candidateId.toString())) {
        throw ApiError.forbidden('Forbidden: Parents can only submit work for their verified linked children.');
      }
      targetStudentId = candidateId;
    } else {
      throw ApiError.forbidden('Forbidden: Only students or parents can submit homework responses.');
    }

    // Validate student exists and is enrolled in the target class cohort (Requirement 4)
    const student = await Student.findById(targetStudentId);
    if (!student) {
      throw ApiError.notFound('Student record not found in database.');
    }

    if (student.class.toString() !== homework.class._id.toString()) {
      throw ApiError.badRequest(
        `Student ${student.fullName} is not enrolled in class ${homework.class.name} - Section ${homework.class.section}.`
      );
    }

    // Record or update submission in MongoDB (Requirement 3 & 7)
    const existingIdx = homework.submissions.findIndex(
      (s) => s.student.toString() === student._id.toString()
    );

    const submissionEntry = {
      student: student._id,
      studentName: student.fullName,
      submissionNotes: (submissionNotes || '').trim() || 'Work completed and submitted.',
      submittedAt: new Date(),
      status: 'submitted',
    };

    if (existingIdx >= 0) {
      homework.submissions[existingIdx].submissionNotes = submissionEntry.submissionNotes;
      homework.submissions[existingIdx].submittedAt = submissionEntry.submittedAt;
      homework.submissions[existingIdx].status = 'submitted';
    } else {
      homework.submissions.push(submissionEntry);
    }

    await homework.save();

    return ApiResponse.success(
      res,
      {
        homeworkId: homework._id,
        studentId: student._id,
        studentName: student.fullName,
        status: 'Submitted',
        submittedAt: submissionEntry.submittedAt,
        submissionNotes: submissionEntry.submissionNotes,
      },
      'Homework response saved and persisted to database successfully'
    );
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/homework/:id
 * Update homework task details (Teacher / Administrator)
 */
export async function updateHomework(req, res, next) {
  try {
    const { id } = req.params;
    const homework = await Homework.findById(id);
    if (!homework) {
      throw ApiError.notFound('Homework task not found');
    }

    // Check teacher permission
    if (req.user?.role === 'teacher' && req.user?.wing !== 'Administration') {
      const assignedClasses = (req.user.assignedClasses || []).map((c) => c.toString());
      if (!assignedClasses.includes(homework.class.toString())) {
        throw ApiError.forbidden('Forbidden: Teachers can only modify homework for their assigned classes.');
      }
    }

    const allowedUpdates = ['title', 'description', 'dueDate', 'status', 'attachments'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        homework[field] = req.body[field];
      }
    });

    await homework.save();
    return ApiResponse.success(res, homework, 'Homework updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/homework/:id
 * Delete homework task from MongoDB (Teacher / Administrator)
 */
export async function deleteHomework(req, res, next) {
  try {
    const { id } = req.params;
    const homework = await Homework.findById(id);
    if (!homework) {
      throw ApiError.notFound('Homework task not found');
    }

    if (req.user?.role === 'teacher' && req.user?.wing !== 'Administration') {
      const assignedClasses = (req.user.assignedClasses || []).map((c) => c.toString());
      if (!assignedClasses.includes(homework.class.toString())) {
        throw ApiError.forbidden('Forbidden: Teachers can only delete homework for their assigned classes.');
      }
    }

    await Homework.findByIdAndDelete(id);
    return ApiResponse.success(res, { deletedId: id }, 'Homework task removed successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/homework/:id/submissions
 * View submissions roster for an assignment (Teacher / Administrator)
 */
export async function getHomeworkSubmissions(req, res, next) {
  try {
    const { id } = req.params;
    const homework = await Homework.findById(id)
      .populate('class', 'name section')
      .populate('submissions.student', 'fullName admissionNumber rollNumber gender')
      .lean();

    if (!homework) {
      throw ApiError.notFound('Homework task not found');
    }

    if (req.user?.role === 'teacher' && req.user?.wing !== 'Administration') {
      const assignedClasses = (req.user.assignedClasses || []).map((c) => c.toString());
      if (!assignedClasses.includes(homework.class?._id?.toString())) {
        throw ApiError.forbidden('Forbidden: Teachers can only view submissions for their assigned classes.');
      }
    }

    return ApiResponse.success(res, homework.submissions || [], 'Homework submissions retrieved');
  } catch (error) {
    next(error);
  }
}

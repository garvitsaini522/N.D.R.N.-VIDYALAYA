import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { Class } from '../models/Class.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getStudents(req, res, next) {
  try {
    // If student or parent accidentally hits getStudents, forbid immediately
    if (req.user?.role === 'student' || req.user?.role === 'parent') {
      throw ApiError.forbidden('Forbidden: You are not authorized to query the full student directory.');
    }

    const { classId, section, status = 'active', search, page = 1, limit = 20 } = req.query;
    const query = {};

    // For teachers: enforce class assignment restrictions unless Administration wing
    if (req.user?.role === 'teacher' && req.user?.wing !== 'Administration') {
      const assignedClasses = (req.user.assignedClasses || []).map((c) => c.toString());
      if (classId) {
        if (!assignedClasses.includes(classId.toString())) {
          throw ApiError.forbidden('Forbidden: Teachers are only permitted to view student rosters for their assigned classes.');
        }
        query.class = classId;
      } else {
        query.class = { $in: assignedClasses };
      }
    } else if (classId) {
      query.class = classId;
    }

    if (status && status !== 'all') query.status = status;
    if (section) query.section = section;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Student.find(query)
        .sort({ admissionNumber: 1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('class', 'name section')
        .populate('parent', 'primaryContact fatherName motherName')
        .lean(),
      Student.countDocuments(query),
    ]);

    return ApiResponse.paginated(res, items, page, limit, total, 'Students fetched successfully');
  } catch (error) {
    next(error);
  }
}

export async function getStudentById(req, res, next) {
  try {
    const isMe = req.params.id === 'me';
    let student;

    if (isMe) {
      if (req.user.role === 'student') {
        if (!req.user.isLinked || !req.user.studentId) {
          throw ApiError.forbidden('Forbidden: Your student account is not linked to any official student record.');
        }
        student = await Student.findById(req.user.studentId)
          .populate('class')
          .populate('parent')
          .populate('user', 'email role lastLogin')
          .lean();
      } else if (req.user.role === 'parent') {
        if (!req.user.isLinked || !Array.isArray(req.user.wardIds) || req.user.wardIds.length === 0) {
          throw ApiError.forbidden('Forbidden: Parent account is not linked to any official student record.');
        }
        student = await Student.findById(req.user.wardIds[0])
          .populate('class')
          .populate('parent')
          .populate('user', 'email role lastLogin')
          .lean();
      } else {
        student = await Student.findOne({ user: req.user.id })
          .populate('class')
          .populate('parent')
          .populate('user', 'email role lastLogin')
          .lean();
      }
    } else {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { _id: req.params.id } : { admissionNumber: req.params.id.toUpperCase() };
      student = await Student.findOne(query)
        .populate('class')
        .populate('parent')
        .populate('user', 'email role lastLogin')
        .lean();
    }

    if (!student) {
      throw ApiError.notFound('Student not found');
    }

    // Role-based defense-in-depth authorization checks:
    const role = req.user?.role;
    if (role === 'student') {
      const studentUserId = student.user?._id ? student.user._id.toString() : student.user ? student.user.toString() : null;
      const isOwn =
        Boolean(req.user.studentId && req.user.studentId.toString() === student._id.toString()) ||
        Boolean(studentUserId && studentUserId === req.user.id.toString());
      if (!isOwn) {
        throw ApiError.forbidden('Forbidden: Students are only permitted to access their own academic records.');
      }
    } else if (role === 'parent') {
      const allowedWards = Array.isArray(req.user.wardIds) ? req.user.wardIds.map((id) => id.toString()) : [];
      const isWard = req.user.isLinked && allowedWards.includes(student._id.toString());
      if (!isWard) {
        throw ApiError.forbidden('Forbidden: Parents are only permitted to access records for their linked children.');
      }
    } else if (role === 'teacher' && req.user.wing !== 'Administration') {
      const assignedClasses = (req.user.assignedClasses || []).map((c) => c.toString());
      const studentClassId = student.class?._id ? student.class._id.toString() : student.class?.toString();
      if (assignedClasses.length > 0 && studentClassId && !assignedClasses.includes(studentClassId)) {
        throw ApiError.forbidden('Forbidden: Teachers are only permitted to access records for students in their assigned classes.');
      }
    }

    return ApiResponse.success(res, student, 'Student details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createStudent(req, res, next) {
  try {
    const studentData = { ...req.body };

    // Format fullName
    if (!studentData.fullName && studentData.name) {
      studentData.fullName = studentData.name;
    }

    // Format dateOfBirth
    if (!studentData.dateOfBirth && studentData.dob) {
      studentData.dateOfBirth = new Date(studentData.dob);
    } else if (!studentData.dateOfBirth) {
      studentData.dateOfBirth = new Date('2018-05-15');
    }

    // Format rollNumber
    if (!studentData.rollNumber && studentData.rollNo) {
      studentData.rollNumber = String(studentData.rollNo);
    }

    // Auto-generate admissionNumber if not provided
    if (!studentData.admissionNumber) {
      const year = new Date().getFullYear();
      const count = await Student.countDocuments();
      studentData.admissionNumber = `NDRN-${year}-${String(count + 1).padStart(4, '0')}`;
    } else {
      studentData.admissionNumber = String(studentData.admissionNumber).toUpperCase();
    }

    // Resolve class reference
    const rawClass = studentData.class || studentData.grade || studentData.className;
    if (rawClass) {
      if (mongoose.Types.ObjectId.isValid(rawClass)) {
        studentData.class = rawClass;
      } else {
        let classDoc = await Class.findOne({ name: rawClass });
        if (!classDoc) {
          classDoc = await Class.create({
            name: rawClass,
            section: studentData.section || 'A',
            academicYear: studentData.academicYear || '2026-2027',
          });
        }
        studentData.class = classDoc._id;
      }
    }

    // Handle parent reference if parentName & phone are supplied
    if (!studentData.parent && studentData.parentName && studentData.parentPhone) {
      let parent = await Parent.findOne({ 'primaryContact.phone': studentData.parentPhone });
      if (!parent) {
        parent = await Parent.create({
          fatherName: studentData.parentName,
          primaryContact: {
            name: studentData.parentName,
            phone: studentData.parentPhone,
            email: studentData.parentEmail || undefined,
            relationship: 'Father',
          },
          address: {
            street: studentData.address || 'Daulatyarpur',
            village: 'Daulatyarpur',
            district: 'Hardoi',
            state: 'Uttar Pradesh',
          },
        });
      }
      studentData.parent = parent._id;
    }

    const student = await Student.create(studentData);

    // If parent was created or found, link student to parent's students array
    if (studentData.parent) {
      await Parent.findByIdAndUpdate(studentData.parent, {
        $addToSet: { students: student._id },
      });
    }

    const populated = await Student.findById(student._id)
      .populate('class', 'name section')
      .populate('parent', 'primaryContact fatherName motherName');

    return ApiResponse.created(res, populated, 'Student enrolled successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { admissionNumber: req.params.id.toUpperCase() };

    const existingStudent = await Student.findOne(query);
    if (!existingStudent) {
      throw ApiError.notFound('Student record not found');
    }

    let updateFields = {};

    if (req.user.role === 'parent') {
      if (!req.user.isLinked || !req.user.parentId) {
        throw ApiError.forbidden('Forbidden: Your parent account is not linked to any official parent record.');
      }

      const allowedWards = Array.isArray(req.user.wardIds) ? req.user.wardIds.map((id) => id.toString()) : [];
      const isLinkedWard = allowedWards.includes(existingStudent._id.toString());

      if (!isLinkedWard) {
        throw ApiError.forbidden('Forbidden: Parents are only permitted to update details for their linked child.');
      }

      // Permitted personal details whitelist for parents
      const {
        dateOfBirth,
        dob,
        gender,
        bloodGroup,
        address,
        emergencyContact,
        emergencyPhone,
      } = req.body;

      if (dateOfBirth || dob) {
        updateFields.dateOfBirth = new Date(dateOfBirth || dob);
      }
      if (gender && ['Male', 'Female', 'Other'].includes(gender)) {
        updateFields.gender = gender;
      }
      if (bloodGroup) {
        updateFields.bloodGroup = bloodGroup;
      }
      if (address !== undefined) {
        if (typeof address === 'string') {
          updateFields.address = {
            ...(existingStudent.address ? existingStudent.address.toObject?.() || existingStudent.address : {}),
            street: address,
          };
        } else if (typeof address === 'object') {
          updateFields.address = {
            ...(existingStudent.address ? existingStudent.address.toObject?.() || existingStudent.address : {}),
            ...address,
          };
        }
      }
      if (emergencyContact !== undefined || emergencyPhone !== undefined) {
        const contactObj = typeof emergencyContact === 'object' ? emergencyContact : {};
        updateFields.emergencyContact = {
          ...(existingStudent.emergencyContact ? existingStudent.emergencyContact.toObject?.() || existingStudent.emergencyContact : {}),
          ...contactObj,
          phone: emergencyPhone || contactObj.phone || existingStudent.emergencyContact?.phone,
        };
      }
    } else if (req.user.role === 'admin') {
      // Administrators can update all standard student profile fields
      updateFields = { ...req.body };
      delete updateFields._id;
      delete updateFields.linkingCode;
      delete updateFields.linkingCodeExpires;

      if (updateFields.name && !updateFields.fullName) {
        updateFields.fullName = updateFields.name;
      }
      if (updateFields.dob && !updateFields.dateOfBirth) {
        updateFields.dateOfBirth = new Date(updateFields.dob);
      }
      if (updateFields.rollNo && !updateFields.rollNumber) {
        updateFields.rollNumber = String(updateFields.rollNo);
      }
      if (updateFields.status) {
        updateFields.status = String(updateFields.status).toLowerCase();
      }
      if (updateFields.grade && !updateFields.class) {
        const rawClass = updateFields.grade;
        if (mongoose.Types.ObjectId.isValid(rawClass)) {
          updateFields.class = rawClass;
        } else {
          let classDoc = await Class.findOne({ name: rawClass });
          if (!classDoc) {
            classDoc = await Class.create({
              name: rawClass,
              section: updateFields.section || existingStudent.section || 'A',
              academicYear: updateFields.academicYear || existingStudent.academicYear || '2026-2027',
            });
          }
          updateFields.class = classDoc._id;
        }
      }
      if (updateFields.parentName || updateFields.parentPhone) {
        if (existingStudent.parent) {
          const parentUpdates = {};
          if (updateFields.parentName) {
            parentUpdates.fatherName = updateFields.parentName;
            parentUpdates['primaryContact.name'] = updateFields.parentName;
          }
          if (updateFields.parentPhone) {
            parentUpdates['primaryContact.phone'] = updateFields.parentPhone;
          }
          if (updateFields.parentEmail) {
            parentUpdates['primaryContact.email'] = updateFields.parentEmail;
          }
          await Parent.findByIdAndUpdate(existingStudent.parent, { $set: parentUpdates });
        }
      }
    } else {
      throw ApiError.forbidden(`Forbidden: Role '${req.user.role}' is not authorized to update student records.`);
    }

    const student = await Student.findOneAndUpdate(
      query,
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('class')
      .populate('parent')
      .populate('user', 'email role lastLogin');

    return ApiResponse.success(res, student, 'Student details updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      throw ApiError.forbidden('Only administrators can delete student records.');
    }
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { admissionNumber: req.params.id.toUpperCase() };
    const student = await Student.findOneAndDelete(query);
    if (!student) {
      throw ApiError.notFound('Student record not found');
    }
    return ApiResponse.success(res, null, 'Student record deleted successfully');
  } catch (error) {
    next(error);
  }
}

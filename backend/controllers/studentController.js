import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { Parent } from '../models/Parent.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getStudents(req, res, next) {
  try {
    const { classId, section, status = 'active', search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (classId) query.class = classId;
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
      student = await Student.findOne({ user: req.user.id })
        .populate('class')
        .populate('parent')
        .populate('user', 'email role lastLogin')
        .lean();
    } else {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { _id: req.params.id } : { admissionNumber: req.params.id };
      student = await Student.findOne(query)
        .populate('class')
        .populate('parent')
        .populate('user', 'email role lastLogin')
        .lean();
    }

    if (!student) {
      throw ApiError.notFound('Student not found');
    }

    return ApiResponse.success(res, student, 'Student details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createStudent(req, res, next) {
  try {
    const student = await Student.create(req.body);
    return ApiResponse.created(res, student, 'Student enrolled successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateStudent(req, res, next) {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { admissionNumber: req.params.id };

    const existingStudent = await Student.findOne(query);
    if (!existingStudent) {
      throw ApiError.notFound('Student record not found');
    }

    let updateFields = {};

    if (req.user.role === 'parent') {
      // Security Check: Verify parent is authorized to update this student ward
      const parentDoc = await Parent.findOne({ user: req.user.id });
      const allowedWards = [
        ...(parentDoc?.students ? parentDoc.students.map((s) => s.toString()) : []),
        ...(req.user.wardIds || []),
        ...(req.user.wardId ? [req.user.wardId] : []),
      ];

      const isLinked =
        (existingStudent.parent && parentDoc && existingStudent.parent.toString() === parentDoc._id.toString()) ||
        allowedWards.includes(existingStudent._id.toString()) ||
        allowedWards.includes(existingStudent.admissionNumber);

      if (!isLinked && parentDoc) {
        throw ApiError.forbidden('Parents are only permitted to update details for their linked child');
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
    } else {
      // Administrators can update all standard student profile fields
      updateFields = { ...req.body };
      delete updateFields._id;
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

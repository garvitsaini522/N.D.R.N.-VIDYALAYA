import mongoose from 'mongoose';
import { Fee } from '../models/Fee.js';
import { Student } from '../models/Student.js';
import { FeeService } from '../services/feeService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { config } from '../config/env.js';

export async function getFees(req, res, next) {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
      throw ApiError.forbidden('Forbidden: You are not authorized to query fee rosters.');
    }

    const { studentId, status, feeType, page = 1, limit = 20 } = req.query;
    const query = {};

    if (studentId) query.student = studentId;
    if (status && status !== 'all') query.status = status;
    if (feeType && feeType !== 'all') query.feeType = feeType;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Fee.find(query)
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('student', 'fullName admissionNumber rollNumber class')
        .lean(),
      Fee.countDocuments(query),
    ]);

    return ApiResponse.paginated(res, items, page, limit, total, 'Fee records retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createFee(req, res, next) {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
      throw ApiError.forbidden('Forbidden: Only administrators can create fee invoices.');
    }

    const fee = await Fee.create({
      ...req.body,
      student: req.body.studentId,
    });
    return ApiResponse.created(res, fee, 'Fee invoice generated successfully');
  } catch (error) {
    next(error);
  }
}

export async function recordPayment(req, res, next) {
  try {
    if (req.user?.role !== 'admin' && req.user?.role !== 'staff') {
      throw ApiError.forbidden('Forbidden: Only authorized administrative staff can record offline payments.');
    }

    const { paidAmount, paymentMethod, transactionId, remarks } = req.body;
    const fee = await FeeService.recordPayment(
      req.params.id,
      { paidAmount, paymentMethod, transactionId, remarks },
      req.user?.id
    );

    return ApiResponse.success(res, fee, 'Fee payment recorded successfully');
  } catch (error) {
    next(error);
  }
}

export async function getGatewayStatus(req, res, next) {
  try {
    const status = FeeService.getGatewayStatus();
    return ApiResponse.success(res, status, 'Payment gateway configuration status');
  } catch (error) {
    next(error);
  }
}

export async function payFee(req, res, next) {
  try {
    const { feeId, studentId, term, amount, paymentMode, transactionId, remarks } = req.body;
    let targetStudentId = studentId;

    if (!targetStudentId || targetStudentId === 'me') {
      if (req.user?.role === 'student') {
        targetStudentId = req.user.studentId;
      }
    }

    // Role-based access validation
    if (req.user?.role === 'student') {
      if (!req.user.isLinked || !req.user.studentId) {
        throw ApiError.forbidden('Forbidden: Student account is not linked to an official student record.');
      }
      if (targetStudentId && targetStudentId.toString() !== req.user.studentId.toString()) {
        throw ApiError.forbidden('Forbidden: Students can only initiate fee payments for their own account.');
      }
      targetStudentId = req.user.studentId;

      // Online payment gateway check - never simulate in production
      if (!config.paymentGateway?.enabled) {
        throw ApiError.serviceUnavailable(
          'Online fee payment is currently unavailable as no online payment gateway is configured. Please visit the Daulatyarpur Campus Accounts Counter to remit fees.'
        );
      }

      const order = await FeeService.initiateOnlinePayment({ feeId, amount }, req.user);
      return ApiResponse.success(res, order, 'Payment order initiated');
    } else if (req.user?.role === 'parent') {
      if (!req.user.isLinked || !Array.isArray(req.user.wardIds) || req.user.wardIds.length === 0) {
        throw ApiError.forbidden('Forbidden: Parent account is not linked to any official student record.');
      }
      const allowedWards = req.user.wardIds.map((id) => id.toString());
      if (!targetStudentId || !allowedWards.includes(targetStudentId.toString())) {
        throw ApiError.forbidden('Forbidden: Parents can only initiate fee payments for their verified linked children.');
      }

      // Online payment gateway check - never simulate in production
      if (!config.paymentGateway?.enabled) {
        throw ApiError.serviceUnavailable(
          'Online fee payment is currently unavailable as no online payment gateway is configured. Please visit the Daulatyarpur Campus Accounts Counter to remit fees.'
        );
      }

      const order = await FeeService.initiateOnlinePayment({ feeId, amount }, req.user);
      return ApiResponse.success(res, order, 'Payment order initiated');
    } else if (['admin', 'staff'].includes(req.user?.role)) {
      if (mongoose.connection.readyState !== 1) {
        throw ApiError.serviceUnavailable('Database connection is currently unavailable. Please ensure MongoDB is running.');
      }
      // Administrative staff recording an in-person desk fee payment
      let feeDoc;
      if (feeId && mongoose.Types.ObjectId.isValid(feeId)) {
        feeDoc = await FeeService.recordPayment(
          feeId,
          {
            paidAmount: amount,
            paymentMethod: paymentMode || 'Cash',
            transactionId,
            remarks: remarks || 'Accounts desk payment',
          },
          req.user?.id
        );
      } else {
        feeDoc = await FeeService.recordOfflinePayment(
          {
            studentId: targetStudentId,
            term: term || 'Tuition Fee',
            amount: Number(amount),
            paidAmount: Number(amount),
            paymentMethod: paymentMode || 'Cash',
            transactionId,
            remarks: remarks || 'Accounts counter in-person payment',
          },
          req.user?.id
        );
      }

      const populated = await Fee.findById(feeDoc._id).populate('student', 'fullName admissionNumber rollNumber class');
      return ApiResponse.success(res, populated, 'Administrative payment recorded successfully');
    } else {
      throw ApiError.forbidden('Forbidden: Unauthorized to process fee transactions.');
    }
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const { feeId, orderId, paymentId, signature } = req.body;
    const fee = await FeeService.verifyOnlinePayment(
      { feeId, orderId, paymentId, signature },
      req.user
    );

    const populated = await Fee.findById(fee._id).populate('student', 'fullName admissionNumber rollNumber class');
    return ApiResponse.success(res, populated, 'Payment verified and confirmed successfully');
  } catch (error) {
    next(error);
  }
}

export async function getStudentLedger(req, res, next) {
  try {
    let { studentId } = req.params;

    if (!studentId || studentId === 'me') {
      if (req.user?.role === 'student') {
        studentId = req.user.studentId;
      } else if (req.user?.role === 'parent' && Array.isArray(req.user.wardIds) && req.user.wardIds.length > 0) {
        studentId = req.user.wardIds[0];
      }
    }

    if (!studentId) {
      throw ApiError.badRequest('Student identifier is required');
    }

    // Role-based access validation
    const role = req.user?.role;
    if (role === 'teacher') {
      throw ApiError.forbidden('Forbidden: Teachers are not authorized to access student fee records.');
    }

    if (role === 'student') {
      if (!req.user.isLinked || !req.user.studentId) {
        throw ApiError.forbidden('Forbidden: Student account is not linked to an official student record.');
      }
      const isSelf =
        studentId.toString() === req.user.studentId.toString() ||
        (req.user.admissionNumber && studentId.toUpperCase() === req.user.admissionNumber.toUpperCase());
      if (!isSelf) {
        throw ApiError.forbidden('Forbidden: Students can only view their own fee ledger.');
      }
      studentId = req.user.studentId;
    } else if (role === 'parent') {
      if (!req.user.isLinked || !Array.isArray(req.user.wardIds) || req.user.wardIds.length === 0) {
        throw ApiError.forbidden('Forbidden: Parent account is not linked to any official student record.');
      }
      const allowedWards = req.user.wardIds.map((id) => id.toString());
      let resolvedStudentId = studentId;
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        const studentDoc = await Student.findOne({
          _id: { $in: allowedWards },
          admissionNumber: studentId.toUpperCase(),
        }).select('_id').lean();
        if (studentDoc) {
          resolvedStudentId = studentDoc._id.toString();
        }
      }
      const isAllowed = allowedWards.includes(resolvedStudentId.toString());
      if (!isAllowed) {
        throw ApiError.forbidden('Forbidden: Parents can only view fee ledgers for their verified linked children.');
      }
      studentId = resolvedStudentId;
    } else if (!['admin', 'staff'].includes(role)) {
      throw ApiError.forbidden('Forbidden: Unauthorized to access financial records.');
    }

    const ledger = await FeeService.getStudentLedger(studentId);
    return ApiResponse.success(res, ledger, 'Student fee ledger retrieved');
  } catch (error) {
    next(error);
  }
}

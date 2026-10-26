import { Fee } from '../models/Fee.js';
import { FeeService } from '../services/feeService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getFees(req, res, next) {
  try {
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
        .populate('student', 'fullName admissionNumber rollNumber class'),
      Fee.countDocuments(query),
    ]);

    return ApiResponse.paginated(res, items, page, limit, total, 'Fee records retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createFee(req, res, next) {
  try {
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

export async function getStudentLedger(req, res, next) {
  try {
    const ledger = await FeeService.getStudentLedger(req.params.studentId);
    return ApiResponse.success(res, ledger, 'Student fee ledger retrieved');
  } catch (error) {
    next(error);
  }
}

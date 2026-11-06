import mongoose from 'mongoose';
import { AdmissionService } from '../services/admissionService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';
import { escapeRegex, sanitizeEnumQuery } from '../utils/privacySanitizer.js';

const VALID_ADMISSION_STATUSES = [
  'Received',
  'Pending',
  'Contacted',
  'Under Review',
  'Verified',
  'Admitted',
  'Rejected',
  'Cancelled',
  'new',
  'contacted',
  'documents_pending',
  'under_review',
  'verified',
  'admitted',
  'rejected',
  'cancelled',
];

export async function submitEnquiry(req, res, next) {
  try {
    const enquiry = await AdmissionService.createEnquiry(req.body);
    logger.info(
      `[Admission Enquiry Received] Ref: ${enquiry.enquiryNumber} | Grade: ${enquiry.gradeApplying}`
    );
    return ApiResponse.created(
      res,
      {
        enquiryNumber: enquiry.enquiryNumber,
        studentName: enquiry.studentName,
        gradeApplying: enquiry.gradeApplying,
        status: enquiry.status,
        deliveryStatus: enquiry.deliveryStatus,
      },
      `Admission enquiry submitted successfully and recorded in school database. Your reference number is ${enquiry.enquiryNumber}.`
    );
  } catch (error) {
    next(error);
  }
}

export async function getEnquiries(req, res, next) {
  try {
    const { status, grade, search, page = 1, limit = 10 } = req.query;
    const cleanStatus = sanitizeEnumQuery(status, VALID_ADMISSION_STATUSES, null);
    const cleanGrade = typeof grade === 'string' ? grade.trim() : null;
    const cleanSearch = typeof search === 'string' ? escapeRegex(search) : null;

    const { items, total } = await AdmissionService.getEnquiries({
      status: cleanStatus,
      grade: cleanGrade,
      search: cleanSearch,
      page: Math.max(1, parseInt(page, 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 10)),
    });

    return ApiResponse.paginated(res, items, page, limit, total, 'Admission enquiries retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getEnquiryById(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id) && !/^ADM-\d{4}-\d+$/i.test(id)) {
      throw ApiError.badRequest('Invalid admission enquiry ID format');
    }

    const admission = await AdmissionService.findEnquiry(id);
    if (!admission) {
      throw ApiError.notFound('Admission record not found');
    }

    return ApiResponse.success(res, admission, 'Admission record retrieved');
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id) && !/^ADM-\d{4}-\d+$/i.test(id)) {
      throw ApiError.badRequest('Invalid admission enquiry ID format');
    }

    const status = req.body.status;
    const note = req.body.note || req.body.notes;

    const updated = await AdmissionService.updateStatus(id, {
      status,
      note,
      staffId: req.user?.id,
    });

    return ApiResponse.success(res, updated, 'Admission status updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteEnquiry(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id) && !/^ADM-\d{4}-\d+$/i.test(id)) {
      throw ApiError.badRequest('Invalid admission enquiry ID format');
    }

    const deleted = await AdmissionService.deleteEnquiry(id);
    if (!deleted) {
      throw ApiError.notFound('Admission record not found');
    }
    return ApiResponse.success(res, null, 'Admission record deleted');
  } catch (error) {
    next(error);
  }
}

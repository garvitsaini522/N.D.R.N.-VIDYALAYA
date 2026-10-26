import { AdmissionService } from '../services/admissionService.js';
import { Admission } from '../models/Admission.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function submitEnquiry(req, res, next) {
  try {
    const enquiry = await AdmissionService.createEnquiry(req.body);
    console.log(
      `[Admission Enquiry Dispatched] Ref: ${enquiry.enquiryNumber} -> Principal WhatsApp: +91 8429231617 | Principal Email: ueyuwhw@gmail.com | Student: ${enquiry.studentName} (${enquiry.gradeApplying})`
    );
    return ApiResponse.created(
      res,
      {
        enquiryNumber: enquiry.enquiryNumber,
        studentName: enquiry.studentName,
        gradeApplying: enquiry.gradeApplying,
        status: enquiry.status,
      },
      `Admission enquiry submitted successfully. Your reference number is ${enquiry.enquiryNumber}.`
    );
  } catch (error) {
    next(error);
  }
}

export async function getEnquiries(req, res, next) {
  try {
    const { status, grade, search, page = 1, limit = 10 } = req.query;
    const { items, total } = await AdmissionService.getEnquiries({
      status,
      grade,
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    return ApiResponse.paginated(res, items, page, limit, total, 'Admission enquiries retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getEnquiryById(req, res, next) {
  try {
    const admission = await Admission.findById(req.params.id)
      .populate('notes.author', 'name role')
      .populate('assignedStaff', 'name email');

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
    const { status, note } = req.body;
    const updated = await AdmissionService.updateStatus(req.params.id, {
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
    const admission = await Admission.findByIdAndDelete(req.params.id);
    if (!admission) {
      throw ApiError.notFound('Admission record not found');
    }
    return ApiResponse.success(res, null, 'Admission record deleted');
  } catch (error) {
    next(error);
  }
}

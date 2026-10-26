import { Admission } from '../models/Admission.js';
import { ApiError } from '../utils/apiError.js';

export class AdmissionService {
  /**
   * Generate sequential or timestamped unique enquiry number
   */
  static async generateEnquiryNumber() {
    const year = new Date().getFullYear();
    const count = await Admission.countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    return `ADM-${year}-${sequence}`;
  }

  /**
   * Register a new admission enquiry
   */
  static async createEnquiry(enquiryData) {
    const enquiryNumber = await this.generateEnquiryNumber();

    const admission = await Admission.create({
      ...enquiryData,
      enquiryNumber,
      status: 'new',
    });

    return admission;
  }

  /**
   * Get filtered and paginated admissions
   */
  static async getEnquiries({ status, grade, search, page = 1, limit = 10 }) {
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (grade && grade !== 'all') {
      query.gradeApplying = grade;
    }

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { enquiryNumber: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Admission.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Admission.countDocuments(query),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Update enquiry status and append staff note
   */
  static async updateStatus(id, { status, note, staffId }) {
    const admission = await Admission.findById(id);
    if (!admission) {
      throw ApiError.notFound(`Admission enquiry with ID '${id}' not found`);
    }

    admission.status = status;
    if (staffId) {
      admission.assignedStaff = staffId;
    }

    if (note) {
      admission.notes.push({
        author: staffId,
        note,
        date: new Date(),
      });
    }

    await admission.save();
    return admission;
  }
}

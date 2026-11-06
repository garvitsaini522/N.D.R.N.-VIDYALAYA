import mongoose from 'mongoose';
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
   * Register a new admission enquiry in MongoDB with duplicate detection
   */
  static async createEnquiry(enquiryData) {
    const normalizedPhone = enquiryData.phone ? String(enquiryData.phone).trim() : '';
    const studentName = enquiryData.studentName ? String(enquiryData.studentName).trim() : '';
    const gradeApplying = enquiryData.gradeApplying;

    // Duplicate check: prevent rapid resubmission of identical enquiry within 15 minutes
    if (normalizedPhone && studentName && gradeApplying) {
      const recentWindow = new Date(Date.now() - 15 * 60 * 1000);
      const existing = await Admission.findOne({
        phone: normalizedPhone,
        studentName: { $regex: new RegExp(`^${studentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        gradeApplying,
        createdAt: { $gte: recentWindow },
      });

      if (existing) {
        throw ApiError.conflict(
          `An admission enquiry for ${studentName} (${gradeApplying}) with contact number ${normalizedPhone} was already received recently. Reference ID: ${existing.enquiryNumber}.`
        );
      }
    }

    const enquiryNumber = await this.generateEnquiryNumber();

    const admission = await Admission.create({
      ...enquiryData,
      enquiryNumber,
      status: enquiryData.status || 'Received',
      deliveryStatus: 'Not Applicable',
    });

    return admission;
  }

  /**
   * Find an admission enquiry by ObjectId or Enquiry Number
   */
  static async findEnquiry(idOrNumber) {
    if (!idOrNumber) return null;
    const cleanId = String(idOrNumber).trim();

    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      const byId = await Admission.findById(cleanId)
        .populate('notes.author', 'name role')
        .populate('assignedStaff', 'name email');
      if (byId) return byId;
    }

    return Admission.findOne({ enquiryNumber: cleanId.toUpperCase() })
      .populate('notes.author', 'name role')
      .populate('assignedStaff', 'name email');
  }

  /**
   * Get filtered and paginated admissions
   */
  static async getEnquiries({ status, grade, search, page = 1, limit = 10 }) {
    const query = {};

    if (status && status !== 'all' && status !== 'All') {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    if (grade && grade !== 'all' && grade !== 'All') {
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
      Admission.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Admission.countDocuments(query),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Update enquiry status and append staff note
   */
  static async updateStatus(idOrNumber, { status, note, staffId }) {
    const admission = await this.findEnquiry(idOrNumber);
    if (!admission) {
      throw ApiError.notFound(`Admission enquiry with ID '${idOrNumber}' not found`);
    }

    if (status) {
      admission.status = status;
    }

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

  /**
   * Delete an enquiry by ObjectId or Enquiry Number
   */
  static async deleteEnquiry(idOrNumber) {
    if (!idOrNumber) return null;
    const cleanId = String(idOrNumber).trim();

    if (mongoose.Types.ObjectId.isValid(cleanId)) {
      const byId = await Admission.findByIdAndDelete(cleanId);
      if (byId) return byId;
    }

    return Admission.findOneAndDelete({ enquiryNumber: cleanId.toUpperCase() });
  }
}

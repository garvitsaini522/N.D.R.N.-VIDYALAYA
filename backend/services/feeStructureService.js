import { FeeStructure } from '../models/FeeStructure.js';
import { ApiError } from '../utils/apiError.js';

export class FeeStructureService {
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
   * Get public published fee structure for a session
   */
  static async getPublishedFeeStructures(academicSession = '2026-27') {
    const query = { isPublished: true };
    const sessionMatch = this.getSessionQuery(academicSession);
    if (sessionMatch) {
      query.academicSession = sessionMatch;
    }

    return FeeStructure.find(query)
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();
  }

  /**
   * Get all fee structures for admin (published and unpublished)
   */
  static async getAllFeeStructures(academicSession) {
    const query = {};
    const sessionMatch = this.getSessionQuery(academicSession);
    if (sessionMatch) {
      query.academicSession = sessionMatch;
    }

    return FeeStructure.find(query)
      .sort({ sortOrder: 1, createdAt: 1 })
      .populate('updatedBy', 'name email role')
      .lean();
  }

  /**
   * Get single fee structure by ID
   */
  static async getFeeStructureById(id) {
    const feeStructure = await FeeStructure.findById(id).populate('updatedBy', 'name email role');
    if (!feeStructure) {
      throw ApiError.notFound('Fee structure record not found');
    }
    return feeStructure;
  }

  /**
   * Create new fee structure record
   */
  static async createFeeStructure(data, userId) {
    const sessionToUse = this.normalizeSession(data.academicSession || '2026-27');
    const existing = await FeeStructure.findOne({
      classGrade: data.classGrade,
      academicSession: this.getSessionQuery(sessionToUse),
    });

    if (existing) {
      throw ApiError.badRequest(
        `A fee structure record already exists for ${data.classGrade} in session ${sessionToUse}. Please edit the existing record.`
      );
    }

    const calculatedTotal =
      Number(data.admissionFee || 0) +
      Number(data.monthlyTuitionFee || 0) * 12 +
      Number(data.annualCharges || 0) +
      Number(data.otherCharges || 0);

    const feeStructure = new FeeStructure({
      ...data,
      academicSession: sessionToUse,
      totalEstimatedAnnualFee: calculatedTotal,
      updatedBy: userId,
    });

    await feeStructure.save();
    return feeStructure;
  }

  /**
   * Update existing fee structure record
   */
  static async updateFeeStructure(id, data, userId) {
    const feeStructure = await FeeStructure.findById(id);
    if (!feeStructure) {
      throw ApiError.notFound('Fee structure record not found');
    }

    if (data.academicSession) {
      data.academicSession = this.normalizeSession(data.academicSession);
    }

    // Check unique constraint if classGrade or academicSession changed
    if (
      (data.classGrade && data.classGrade !== feeStructure.classGrade) ||
      (data.academicSession && data.academicSession !== feeStructure.academicSession)
    ) {
      const targetSession = data.academicSession || feeStructure.academicSession;
      const duplicate = await FeeStructure.findOne({
        _id: { $ne: id },
        classGrade: data.classGrade || feeStructure.classGrade,
        academicSession: this.getSessionQuery(targetSession),
      });

      if (duplicate) {
        throw ApiError.badRequest(
          `A fee structure already exists for ${data.classGrade || feeStructure.classGrade} in session ${targetSession}.`
        );
      }
    }

    Object.assign(feeStructure, data);

    feeStructure.totalEstimatedAnnualFee =
      Number(feeStructure.admissionFee || 0) +
      Number(feeStructure.monthlyTuitionFee || 0) * 12 +
      Number(feeStructure.annualCharges || 0) +
      Number(feeStructure.otherCharges || 0);

    if (userId) {
      feeStructure.updatedBy = userId;
    }

    await feeStructure.save();
    return feeStructure;
  }

  /**
   * Delete fee structure record
   */
  static async deleteFeeStructure(id) {
    const feeStructure = await FeeStructure.findByIdAndDelete(id);
    if (!feeStructure) {
      throw ApiError.notFound('Fee structure record not found');
    }
    return true;
  }

  /**
   * Toggle publish status
   */
  static async togglePublishStatus(id, isPublished, userId) {
    const feeStructure = await FeeStructure.findById(id);
    if (!feeStructure) {
      throw ApiError.notFound('Fee structure record not found');
    }

    feeStructure.isPublished =
      typeof isPublished === 'boolean' ? isPublished : !feeStructure.isPublished;

    if (userId) {
      feeStructure.updatedBy = userId;
    }

    await feeStructure.save();
    return feeStructure;
  }
}

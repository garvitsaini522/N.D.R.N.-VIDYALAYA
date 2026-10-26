import { Notice } from '../models/Notice.js';
import { ApiError } from '../utils/apiError.js';

export class NoticeService {
  /**
   * Fetch published notices for public or portal view
   */
  static async getNotices({ category, audience = 'all', page = 1, limit = 20, status = 'published' }) {
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    if (audience && audience !== 'all') {
      query.targetAudience = { $in: ['all', audience] };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Notice.find(query)
        .sort({ isPinned: -1, publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('publishedBy', 'name role'),
      Notice.countDocuments(query),
    ]);

    return { items, total, page, limit };
  }

  /**
   * Create notice
   */
  static async createNotice(data, userId) {
    const notice = await Notice.create({
      ...data,
      publishedBy: userId,
    });
    return notice;
  }

  /**
   * Update notice
   */
  static async updateNotice(id, updates) {
    const notice = await Notice.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!notice) {
      throw ApiError.notFound(`Notice with ID '${id}' not found`);
    }
    return notice;
  }

  /**
   * Delete notice
   */
  static async deleteNotice(id) {
    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) {
      throw ApiError.notFound(`Notice with ID '${id}' not found`);
    }
    return notice;
  }
}

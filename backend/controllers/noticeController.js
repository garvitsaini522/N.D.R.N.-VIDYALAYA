import { NoticeService } from '../services/noticeService.js';
import { Notice } from '../models/Notice.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getNotices(req, res, next) {
  try {
    const { category, audience, page = 1, limit = 20, status } = req.query;
    const result = await NoticeService.getNotices({
      category,
      audience,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status: status || 'published',
    });

    return ApiResponse.paginated(
      res,
      result.items,
      result.page,
      result.limit,
      result.total,
      'Notices retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
}

export async function getNoticeById(req, res, next) {
  try {
    const notice = await Notice.findById(req.params.id).populate('publishedBy', 'name role');
    if (!notice) {
      throw ApiError.notFound('Notice not found');
    }
    return ApiResponse.success(res, notice, 'Notice details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createNotice(req, res, next) {
  try {
    const payload = { ...req.body };
    if (!payload.content && payload.summary) {
      payload.content = payload.summary;
    }
    if (payload.category) {
      const cat = payload.category.trim();
      if (cat.toLowerCase() === 'academics') payload.category = 'Academic';
    }
    if (payload.pinned !== undefined && payload.isPinned === undefined) {
      payload.isPinned = Boolean(payload.pinned);
    }
    const notice = await NoticeService.createNotice(payload, req.user?.id);
    return ApiResponse.created(res, notice, 'Notice published successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateNotice(req, res, next) {
  try {
    const payload = { ...req.body };
    if (!payload.content && payload.summary) {
      payload.content = payload.summary;
    }
    if (payload.category) {
      const cat = payload.category.trim();
      if (cat.toLowerCase() === 'academics') payload.category = 'Academic';
    }
    if (payload.pinned !== undefined && payload.isPinned === undefined) {
      payload.isPinned = Boolean(payload.pinned);
    }
    const notice = await NoticeService.updateNotice(req.params.id, payload);
    return ApiResponse.success(res, notice, 'Notice updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteNotice(req, res, next) {
  try {
    await NoticeService.deleteNotice(req.params.id);
    return ApiResponse.success(res, null, 'Notice deleted successfully');
  } catch (error) {
    next(error);
  }
}

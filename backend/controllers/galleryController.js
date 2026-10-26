import { Gallery } from '../models/Gallery.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getGallery(req, res, next) {
  try {
    const { category, page = 1, limit = 24 } = req.query;
    const query = { status: 'active' };

    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Gallery.find(query)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Gallery.countDocuments(query),
    ]);

    return ApiResponse.paginated(res, items, page, limit, total, 'Gallery items retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createGalleryItem(req, res, next) {
  try {
    const item = await Gallery.create({
      ...req.body,
      uploadedBy: req.user?.id,
    });
    return ApiResponse.created(res, item, 'Gallery photo added successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteGalleryItem(req, res, next) {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) {
      throw ApiError.notFound('Gallery item not found');
    }
    return ApiResponse.success(res, null, 'Gallery item deleted');
  } catch (error) {
    next(error);
  }
}

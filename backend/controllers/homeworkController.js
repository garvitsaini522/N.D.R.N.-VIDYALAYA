import { Homework } from '../models/Homework.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getHomework(req, res, next) {
  try {
    const { classId, subject, status = 'active', page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (classId) query.class = classId;
    if (subject) query.subject = subject;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Homework.find(query)
        .sort({ dueDate: 1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('class', 'name section')
        .populate('assignedBy', 'fullName designation'),
      Homework.countDocuments(query),
    ]);

    return ApiResponse.paginated(res, items, page, limit, total, 'Homework tasks retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createHomework(req, res, next) {
  try {
    const homework = await Homework.create({
      ...req.body,
      class: req.body.classId,
      assignedBy: req.body.teacherId || req.user?.id,
    });

    return ApiResponse.created(res, homework, 'Homework assigned successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateHomework(req, res, next) {
  try {
    const homework = await Homework.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!homework) {
      throw ApiError.notFound('Homework not found');
    }
    return ApiResponse.success(res, homework, 'Homework updated successfully');
  } catch (error) {
    next(error);
  }
}

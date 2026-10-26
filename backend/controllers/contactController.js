import { ContactMessage } from '../models/ContactMessage.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function submitContactMessage(req, res, next) {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const message = await ContactMessage.create({
      ...req.body,
      ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : null,
    });

    return ApiResponse.created(
      res,
      {
        id: message._id,
        name: message.name,
        subject: message.subject,
        createdAt: message.createdAt,
      },
      'Thank you for contacting N.D.R.N. Vidyalaya. Your message has been received.'
    );
  } catch (error) {
    next(error);
  }
}

export async function getContactMessages(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ContactMessage.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .populate('repliedBy', 'name role'),
      ContactMessage.countDocuments(query),
    ]);

    return ApiResponse.paginated(res, items, page, limit, total, 'Contact messages retrieved');
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );

    if (!message) {
      throw ApiError.notFound('Contact message not found');
    }

    return ApiResponse.success(res, message, 'Message marked as read');
  } catch (error) {
    next(error);
  }
}

export async function deleteMessage(req, res, next) {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      throw ApiError.notFound('Contact message not found');
    }
    return ApiResponse.success(res, null, 'Contact message deleted');
  } catch (error) {
    next(error);
  }
}

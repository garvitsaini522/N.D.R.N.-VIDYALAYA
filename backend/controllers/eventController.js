import mongoose from 'mongoose';
import { Event } from '../models/Event.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getEvents(req, res, next) {
  try {
    const { type, category, page = 1, limit = 50 } = req.query;
    const query = { status: { $ne: 'cancelled' } };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (category && category !== 'All' && category !== 'all') {
      const cleanCat = category.replace(/s$/i, '');
      query.category = new RegExp(cleanCat, 'i');
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Event.find(query)
        .sort({ startDate: type === 'past' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Event.countDocuments(query),
    ]);

    return ApiResponse.paginated(res, items, page, limit, total, 'Events fetched successfully');
  } catch (error) {
    next(error);
  }
}

export async function getEventById(req, res, next) {
  try {
    const isMongoId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isMongoId ? { _id: req.params.id } : { $or: [{ customId: req.params.id }, { id: req.params.id }] };
    const event = await Event.findOne(query);
    if (!event) {
      throw ApiError.notFound('Event not found');
    }
    return ApiResponse.success(res, event, 'Event retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createEvent(req, res, next) {
  try {
    const payload = { ...req.body };
    if (!payload.startDate && payload.date) {
      const parsed = new Date(payload.date);
      if (!isNaN(parsed.getTime())) {
        payload.startDate = parsed;
      }
    }
    if (!payload.description && payload.summary) {
      payload.description = payload.summary;
    }
    if (payload.category === 'Celebration') {
      payload.category = 'Celebrations';
    }
    const currentStatus = String(payload.status || '').toLowerCase();
    if (currentStatus === 'upcoming' || currentStatus === 'scheduled') {
      payload.status = 'scheduled';
      payload.type = 'upcoming';
    } else if (currentStatus === 'completed' || currentStatus === 'past') {
      payload.status = 'completed';
      payload.type = 'past';
    }
    if (!payload.customId && payload.id) {
      payload.customId = payload.id;
    }
    const event = await Event.create(payload);
    return ApiResponse.created(res, event, 'Event created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const payload = { ...req.body };
    if (!payload.startDate && payload.date) {
      const parsed = new Date(payload.date);
      if (!isNaN(parsed.getTime())) {
        payload.startDate = parsed;
      }
    }
    if (!payload.description && payload.summary) {
      payload.description = payload.summary;
    }
    if (payload.category === 'Celebration') {
      payload.category = 'Celebrations';
    }
    const currentStatus = String(payload.status || '').toLowerCase();
    if (currentStatus === 'upcoming' || currentStatus === 'scheduled') {
      payload.status = 'scheduled';
      payload.type = 'upcoming';
    } else if (currentStatus === 'completed' || currentStatus === 'past') {
      payload.status = 'completed';
      payload.type = 'past';
    }
    const isMongoId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isMongoId ? { _id: req.params.id } : { $or: [{ customId: req.params.id }, { id: req.params.id }] };
    const event = await Event.findOneAndUpdate(query, payload, {
      new: true,
      runValidators: true,
    });
    if (!event) {
      throw ApiError.notFound('Event not found');
    }
    return ApiResponse.success(res, event, 'Event updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteEvent(req, res, next) {
  try {
    const isMongoId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isMongoId ? { _id: req.params.id } : { $or: [{ customId: req.params.id }, { id: req.params.id }] };
    const event = await Event.findOneAndDelete(query);
    if (!event) {
      throw ApiError.notFound('Event not found');
    }
    return ApiResponse.success(res, null, 'Event deleted successfully');
  } catch (error) {
    next(error);
  }
}

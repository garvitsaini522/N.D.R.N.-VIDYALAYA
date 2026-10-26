/**
 * Standardized API Response formatter for consistent JSON responses across all endpoints
 */
export class ApiResponse {
  /**
   * Successful response (200 OK)
   */
  static success(res, data = null, message = 'Success', statusCode = 200, meta = null) {
    const payload = {
      success: true,
      message,
      data,
    };

    if (meta) {
      payload.meta = meta;
    }

    return res.status(statusCode).json(payload);
  }

  /**
   * Resource Created response (201 Created)
   */
  static created(res, data = null, message = 'Resource created successfully', meta = null) {
    return this.success(res, data, message, 201, meta);
  }

  /**
   * Paginated response
   */
  static paginated(res, items = [], page = 1, limit = 10, total = 0, message = 'Data fetched successfully') {
    const totalPages = Math.ceil(total / limit) || 1;
    return res.status(200).json({
      success: true,
      message,
      data: items,
      meta: {
        page: Number(page),
        limit: Number(limit),
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }

  /**
   * Error response
   */
  static error(res, message = 'An unexpected error occurred', statusCode = 500, errors = null) {
    const payload = {
      success: false,
      message,
    };

    if (errors) {
      payload.errors = errors;
    }

    return res.status(statusCode).json(payload);
  }
}

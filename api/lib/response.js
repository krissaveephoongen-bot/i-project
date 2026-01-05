// Standardized response formatting
export const successResponse = (res, data, statusCode = 200, message = 'Success') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const paginatedResponse = (res, data, page, limit, total, statusCode = 200) => {
  const totalPages = Math.ceil(total / limit);
  return res.status(statusCode).json({
    success: true,
    message: 'Success',
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
    timestamp: new Date().toISOString(),
  });
};

export const errorResponse = (res, message, statusCode = 400, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  });
};

export const validationErrorResponse = (res, errors) => {
  return res.status(422).json({
    success: false,
    message: 'Validation error',
    errors: Array.isArray(errors) ? errors : [errors],
    timestamp: new Date().toISOString(),
  });
};

export const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-V, Authorization'
  );
};

export const handleOptions = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
};

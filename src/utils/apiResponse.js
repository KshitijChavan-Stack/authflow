export class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data) {
      this.data = data;
    }
    this.timestamp = new Date().toISOString();
  }
}

export const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
};

export const createdResponse = (res, message, data = null) => {
  return successResponse(res, message, data, 201);
};

export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

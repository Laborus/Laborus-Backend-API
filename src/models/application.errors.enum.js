const APPLICATION_ERRORS = {
  INVALID_TOKEN: {
    statusCode: 401,
    error: "INVALID_TOKEN",
    message: "The token provided is invalid.",
  },
  EMAIL_IN_USE: {
    statusCode: 409,
    error: "EMAIL_IN_USE",
    message: "The email address is already in use.",
  },
  UNAUTHORIZED: {
    statusCode: 403,
    error: "UNAUTHORIZED",
    message: "You are not authorized to access this resource.",
  },
  FORBIDDEN_RESOURCE: {
    statusCode: 403,
    error: "FORBIDDEN_RESOURCE",
    message: "You do not have permission to access this resource.",
  },
  INVALID_CREDENTIALS: {
    statusCode: 401,
    error: "INVALID_CREDENTIALS",
    message: "The credentials provided are invalid.",
  },
  EMAIL_NOT_VERIFIED: {
    statusCode: 400,
    error: "EMAIL_NOT_VERIFIED",
    message: "The email address has not been verified.",
  },
  BAD_REQUEST: {
    statusCode: 400,
    error: "BAD_REQUEST",
    message: "The request is invalid or malformed.",
  },
  NOT_FOUND: {
    statusCode: 404,
    error: "NOT_FOUND",
    message: "The requested resource was not found.",
  },
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    error: "INTERNAL_SERVER_ERROR",
    message: "An internal server error occurred.",
  },
  SERVICE_UNAVAILABLE: {
    statusCode: 503,
    error: "SERVICE_UNAVAILABLE",
    message: "The service is currently unavailable.",
  },
  CONFLICT: {
    statusCode: 409,
    error: "CONFLICT",
    message: "There is a conflict with the current state of the resource.",
  },
  PAYLOAD_TOO_LARGE: {
    statusCode: 413,
    error: "PAYLOAD_TOO_LARGE",
    message: "The request payload is too large.",
  },
  UNPROCESSABLE_ENTITY: {
    statusCode: 422,
    error: "UNPROCESSABLE_ENTITY",
    message: "The request was well-formed but cannot be processed.",
  },
  RATE_LIMIT_EXCEEDED: {
    statusCode: 429,
    error: "RATE_LIMIT_EXCEEDED",
    message: "You have exceeded the allowed number of requests.",
  },
  NOT_IMPLEMENTED: {
    statusCode: 501,
    error: "NOT_IMPLEMENTED",
    message: "This functionality has not been implemented.",
  },
  REQUEST_TIMEOUT: {
    statusCode: 408,
    error: "REQUEST_TIMEOUT",
    message: "The request timed out.",
  },
  UNSUPPORTED_MEDIA_TYPE: {
    statusCode: 415,
    error: "UNSUPPORTED_MEDIA_TYPE",
    message: "The media type is not supported.",
  },
  TOO_MANY_REQUESTS: {
    statusCode: 429,
    error: "TOO_MANY_REQUESTS",
    message: "You are sending too many requests in a short period.",
  },
  FAILED_DEPENDENCY: {
    statusCode: 424,
    error: "FAILED_DEPENDENCY",
    message: "The request failed due to a failed dependency.",
  },
};

module.exports = APPLICATION_ERRORS;

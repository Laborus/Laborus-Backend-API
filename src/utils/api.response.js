const APPLICATION_ERRORS = require("../models/application.errors.enum");

exports.successResponse = function (res, msg) {
  const data = {
    status: "SUCCESS",
    message: msg,
  };
  return res.status(200).json(data);
};

exports.successResponseWithData = function (res, msg, data) {
  const resData = {
    status: "SUCCESS",
    message: msg,
    data: data,
  };
  return res.status(200).json(resData);
};

exports.errorResponse = function (res, errorKey) {
  let error = APPLICATION_ERRORS[errorKey];
  if (!error) {
    error = APPLICATION_ERRORS.INTERNAL_SERVER_ERROR;
  }
  const data = {
    status: "FAILED",
    error: error.error,
    message: error.message,
  };
  return res.status(error.statusCode).json(data);
};

exports.notFoundResponse = function (res, msg) {
  const error = APPLICATION_ERRORS.NOT_FOUND;
  const data = {
    status: "FAILED",
    error: error.error,
    message: msg || error.message,
  };
  return res.status(error.statusCode).json(data);
};

exports.validationErrorWithData = function (res, msg, data) {
  const error = APPLICATION_ERRORS.BAD_REQUEST;
  const resData = {
    status: "FAILED",
    error: error.error,
    message: msg || error.message,
    data: data,
  };
  return res.status(error.statusCode).json(resData);
};

exports.unauthorizedResponse = function (res, msg) {
  const error = APPLICATION_ERRORS.UNAUTHORIZED;
  const data = {
    status: "FAILED",
    error: error.error,
    message: msg || error.message,
  };
  return res.status(error.statusCode).json(data);
};

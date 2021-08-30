const joi = require("joi");

const paginationSchema = {
  pageNo: joi
    .string()
    .trim()
    .pattern(/^[0-9]*$/) // find a way to limit the number according to number of documents
    .message("Enter a valid number"),
  limitNo: joi
    .string()
    .trim()
    .pattern(/^[0-9]*$/) // find a way to limit the number according to number of documents
    .message("Enter a valid number"),
};

const signupSchema = {
  name: joi
    .string()
    .required()
    .trim()
    .pattern(/^[a-zA-Z-0-9 ]+$/)
    .min(3)
    .max(30)
    .messages({
      "string.base": `team name must be consists of letters & numbers only`,
      "string.empty": `team name cannot be an empty field`,
      "string.min": `team name should have a minimum length of {#limit} (letters & numbers)`,
      "string.max": `team name should have a maximum length of {#limit} (letters & numbers)`,
      "string.pattern.base": `team name must be consists of letters & numbers only`,
      "any.required": `team name is required`,
    }),

  email: joi
    .string()
    .required()
    .email({ minDomainSegments: 2 })
    .messages({
      "string.base": `Invalid email`,
      "string.email": `Invalid email`,
      "string.empty": `email cannot be an empty field`,
      "any.required": `email is required`,
      "string.pattern.base": `Invalid email`,
    }),

  password: joi
    .string()
    .required()
    .trim()
    .pattern(/(?=^.{8,}$)((?=.*\d)(?=.*\W+)).*$/)
    .min(8)
    .messages({
      "string.base": `password must be at least a minimum of 8 characters long with 1 small letter, 1 capital letter, 1 number and 1 special character`,
      "string.empty": `password cannot be an empty field`,
      "string.min": `password should have a minimum length of {#limit}`,
      "string.pattern.base": `password must be at least a minimum of 8 characters long with 1 small letter, 1 capital letter, 1 number and 1 special character`,
      "any.required": `password is required`,
    }),

  secret: joi.string()
    .required()
    .trim(),

  country: joi.string()
    .required()
    .trim(),
};

const loginSchema = {
  email: joi.string().required().email().message("Invalid email"),

  password: joi
    .string()
    .required()
};

const updatePasswordSchema = {
  oldPassword: joi
    .string()
    .required()
    .trim()
    .pattern(/(?=^.{8,}$)((?=.*\d)(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
    .min(8)
    .messages({
      "string.base": `old password invalid`,
      "string.empty": `old password cannot be an empty field`,
      "string.pattern.base": `old password invalid`,
      "any.required": `old password is required`,
    }),
  newPassword: joi
    .string()
    .required()
    .trim()
    .pattern(/(?=^.{8,}$)((?=.*\d)(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
    .min(8)
    .messages({
      "string.base": `new password must be at least a minimum of 8 characters long with 1 small letter, 1 capital letter, 1 number and 1 special character`,
      "string.empty": `new password cannot be an empty field`,
      "string.pattern.base": `new password must be at least a minimum of 8 characters long with 1 small letter, 1 capital letter, 1 number and 1 special character`,
      "any.required": `new password is required`,
    }),
};

const otpSchema = {
  otp: joi
    .string()
    .required()
    .trim()
    .min(6)
    .pattern(/[0-9]{6}/)
    .messages({
      "string.base": `invalid code`,
      "string.empty": `code cannot be an empty field`,
      "string.pattern.base": `invalid code`,
      "string.min": "invalid code",
      "any.required": `code is required`,
    }),
};

module.exports = {
  signup: joi.object(signupSchema),
  login: joi.object(loginSchema),
  otp: joi.object(otpSchema),
  updatePassword: joi.object(updatePasswordSchema),
  pagination: joi.object(paginationSchema),
  forgotPassword: joi.object({ email: signupSchema.email }),
  resetPassword: joi.object({ password: signupSchema.password }),
  teamName: joi.object({ name: signupSchema.name }),
};

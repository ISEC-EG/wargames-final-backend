const signup = require("./signup");
const sendVerification = require("./send-otp");
const verify = require("./verify");
const login = require("./login");
const updatePassword = require("./update-password");
const forgotPassword = require("./forgot-password");
const resetPassword = require("./reset-password");
const updateName = require("./update-name");
const dashboard = require("./dashboard");
const downloadTeams = require("./download-teams");
const viewProfile = require("./view-profile");
const removeTeam = require("./deleteByEmail");
const getOtp = require("./getOpt-forAdmin");
const generateCredentials = require("./generate-credentials");
const logout = require('./logout');
const createSecretKey = require('./createSecretKey');

module.exports = {
  signup,
  sendVerification,
  verify,
  login,
  updatePassword,
  forgotPassword,
  resetPassword,
  updateName,
  dashboard,
  downloadTeams,
  viewProfile,
  removeTeam,
  getOtp,
  generateCredentials,
  logout,
  createSecretKey
};

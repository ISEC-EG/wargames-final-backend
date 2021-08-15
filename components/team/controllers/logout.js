const createError = require("http-errors");

async function logout(req, res, next) {
  try {
    if (req.session.user_sid) {
      res.clearCookie("auth_token");
      res.clearCookie("session_sid");
      res.clearCookie("ct0");
      // res.clearCookie("_csrf");
      // res.clearCookie("XSRF-TOKEN");
      req.session.destroy();
      return res.status(200).json({ status: "ok" });
    }
    return res.status(304).json({});
  } catch (err) {
    next(createError(500));
  }
}

module.exports = logout;


const Company = require("../models/company");

async function chatAuthMiddleware(req, res, next) {
  // Skip auth on OPTIONS preflight — CORS middleware handles it before this runs
  if (req.method === "OPTIONS") return next();

  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ error: "x-api-key header required" });
    }

    const company = await Company.findOne({
      apiKey,
      isActive: true,
    }).lean();

    if (!company) {
      return res.status(401).json({ error: "Invalid or inactive company" });
    }

    req.companyId = company._id.toString();
    req.company = company; 

    next();
  } catch (err) {
    return res.status(401).json({ error: "Auth failed" });
  }
}

module.exports = { chatAuthMiddleware };
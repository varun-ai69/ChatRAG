const User = require("../models/user");
const Company = require("../models/company");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

function generateApiKey() {
  return "pk_live_" + crypto.randomBytes(24).toString("hex");
}


//this function for registering the company and admin in database
exports.registerCompany = async (req, res) => {
  try {
    const data = req.body;

    if (!data.companyName || !data.name || !data.email || !data.password || !data.botName) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const existingCompany = await Company.findOne({ name: data.companyName });
    if (existingCompany) {
      return res.status(409).json({ error: "Company already exists"});
    }

    const apiKey = generateApiKey();

    const adminUser = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: "ADMIN"
    });

    const company = await Company.create({
      name: data.companyName,
      createdBy: adminUser._id,
      apiKey: apiKey,
      botName: data.botName,                    
      welcomeMessage: data.welcomeMessage || ""
    });

    adminUser.companyId = company._id;
    await adminUser.save();

    const payLoad = {
      userId: adminUser._id,
      companyId: company._id,
      role: adminUser.role
    }

    const token = jwt.sign(

      payLoad
      ,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Company registered successfully",
      token,
      apiKey : company.apiKey,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        companyId: company._id
      }
    });
  } catch (err) {
    console.error("signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// this function for login of employee and admin 
exports.login = async (req, res) => {
  try {
    const loginData = req.body;

    if (!loginData.email || !loginData.password)
      return res.status(400).json({ error: "Email & password required" });


    const user = await User.findOne({ email: loginData.email }).select("+password");
    if (!user || !user.isActive)
      return res.status(401).json({ error: "Invalid credentials" });

    const company = await Company.findById(user.companyId);

    if (!company || !company.isActive) {
      return res.status(403).json({
        error: "Company is inactive"
      });
    }


    const isMatch = await bcrypt.compare(loginData.password, user.password);

    if (!isMatch)
      return res.status(401).json({ error: "Invalid credentials" });


    user.lastLoginAt = new Date();
    await user.save();

    const payLoad = {
      userId: user._id,
      companyId: user.companyId,
      role: user.role
    }

    const token = jwt.sign(

      payLoad
      ,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      apiKey : company.apiKey,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


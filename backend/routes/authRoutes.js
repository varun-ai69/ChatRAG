const router = require("express").Router();
const {registerCompany, login} = require("../controllers/authController");




router.post("/register-company", registerCompany);
router.post("/login",login);




module.exports = router;
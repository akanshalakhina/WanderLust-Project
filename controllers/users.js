const User = require("../models/user.js");


// ================= SIGNUP FORM =================

module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};


// ================= SIGNUP =================

module.exports.signUp = async (req, res, next) => {

  try {

    let { username, email, password } = req.body;

    const newUser = new User({
      username,
      email,
    });

    const registeredUser = await User.register(newUser, password);

    console.log(registeredUser);

    req.login(registeredUser, (err) => {

      if (err) {
        return next(err);
      }

      req.flash("success", "Welcome to StayHub!");

      res.redirect("/listings");

    });

  } catch (e) {

    req.flash("error", e.message);

    res.redirect("/signup");

  }
};


// ================= LOGIN FORM =================

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};


// ================= LOGIN =================

module.exports.login = async (req, res, next) => {

  req.flash("success", "Welcome back to StayHub!");

  let redirectUrl = res.locals.redirectUrl || "/listings";

  res.redirect(redirectUrl);

};


// ================= LOGOUT =================

module.exports.logout = (req, res, next) => {

  req.logout((err) => {

    if (err) {
      return next(err);
    }

    req.flash("success", "Goodbye! Come back soon!");

    res.redirect("/listings");

  });

};
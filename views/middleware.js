module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl; // Store the original URL
    req.flash("error", "You must be signed in to do that!");
    res.redirect("/login");
  }
  next();
};
module.exports.savedRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl; // Make the redirect URL available in views
    
  }
  next();
};
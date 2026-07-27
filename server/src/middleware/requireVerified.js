export const requireVerified = async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      message: 'Please verify your email to continue. Check your inbox for the verification link.',
    });
  }
  next();
};

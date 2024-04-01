export const jwtConstants = {
  secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
  JWT_expiresIn: process.env.JWT_VERIFICATION_TOKEN_EXPIRATION_TIME,
  refreshSecret: process.env.JWT_REFRESH_KEY,
  JWT_refresh_expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME, 
};
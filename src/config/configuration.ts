export default () => ({
  port: Number(process.env.PORT ?? 3000),
  jwt: {
    secret: process.env.JWT_SECRET ?? 'replace-me',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '48h',
  },
  imgur: {
    clientId: process.env.IMGUR_CLIENT_ID ?? '',
    clientSecret: process.env.IMGUR_CLIENT_SECRET ?? '',
    accessToken: process.env.IMGUR_ACCESS_TOKEN ?? '',
  },
});

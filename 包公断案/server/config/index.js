module.exports = {
  port: process.env.PORT || 3000,
  corsOrigins: ['http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:5500'],
  cacheTTL: 3600000
};
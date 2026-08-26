require('dotenv').config();

const express =require('express');

const authRoutes =require('./routes/authRoute.js');

const app =express();

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get(
  '/health',
  (req, res) => {
    res.json({
      message:
        'API is running',
    });
  }
);

app.use(
  '/api/auth/v1',
  authRoutes
);

module.exports = app;
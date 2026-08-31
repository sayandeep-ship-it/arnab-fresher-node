require('dotenv').config();
const path = require('path');

const express = require('express');

const authRoutes = require('./routes/authRoute.js');
const vendorAuthRoutes = require('./routes/vendorAuthRoutes.js');
const loyaltyRoutes = require('./routes/loyaltyRoutes.js');
const dashboardRoutes = require('./routes/dashboardRoute.js');
const vendorProfileRoutes = require('./routes/vendorProfileRoutes');

const meRoutes = require('./routes/meRoutes');

const app = express();

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

//multer configuration for file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.json({
    message: 'API is running',
  });
});

app.use('/api/auth', meRoutes);

//user routes
app.use('/api/user/auth/', authRoutes);
//vendor routes
app.use('/api/vendor/auth', vendorAuthRoutes);
app.use('/api/vendor/loyalty', loyaltyRoutes);
app.use('/api/vendor/dashboard', dashboardRoutes);
app.use('/api/vendor/profile', vendorProfileRoutes);

module.exports = app;

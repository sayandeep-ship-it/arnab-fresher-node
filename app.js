require('dotenv').config();
const path = require('path');

const express = require('express');

const authRoutes = require('./routes/authRoute.js');
const userRoutes = require('./routes/userRoute.js');
const vendorRoute = require('./routes/vendorRoute.js');
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


app.use('/api/auth/', authRoutes);
app.use('/api/user/', userRoutes);
app.use('/api/vendor/', vendorRoute);
module.exports = app;

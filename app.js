require('dotenv').config();

const express =require('express');

const authRoutes =require('./routes/authRoute.js');


const vendorAuthRoutes =require('./routes/vendorAuthRoutes');


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
//user routes
app.use('/api/user/auth/',authRoutes);


//vendor routes
app.use('/api/vendor/auth',vendorAuthRoutes);

module.exports = app;
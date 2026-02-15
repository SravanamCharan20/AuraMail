import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRouter from './routes/userAuth.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import googleAuthRouter from './routes/googleAuth.js';
import emailRouter from './routes/emailApis.js';
import userAuth from './middleware/auth.js';
import messageApiRouter from './routes/messagesApi.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7777;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.get('/cookie/me', userAuth, (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      name : req.user.username
    },
  });
});

// Routes
app.use('/', userRouter);
app.use('/googleAuth', googleAuthRouter);
app.use('/api', emailRouter);
app.use('/messages', messageApiRouter);





// DB Connection
connectDB()
  .then(() => {
    console.log('DB Connected Successfully...');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

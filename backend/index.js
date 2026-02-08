import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRouter from './routes/userAuth.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7777;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors())


// Routes
app.use('/', userRouter);

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

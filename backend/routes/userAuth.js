import express from 'express';
import User from '../models/User.js';
import userAuth from '../middleware/auth.js'

const userRouter = express.Router();

userRouter.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const newUser = new User({
      username,
      password,
    });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully!!!'});
  } catch (err) {
    res.send('Error : ' + err.message);
  }
});

userRouter.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isPasswordCorrect = await user.isValidPassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = await user.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,     // 🔥 must be false on localhost
      sameSite: "lax",   // 🔥 safest for dev
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: 'Login successful'});
  } catch (err) {
    res.send('Error : ' + err.message);
  }
});

userRouter.get('/profile',userAuth,async(req,res) => {
  try {
    const username = req.user.username;
    
    res.status(200).json({ message: 'Profile fetched successfully', username: username });
    } catch (err) {
      res.send('Error : ' + err.message);
    }
  },
);

export default userRouter;

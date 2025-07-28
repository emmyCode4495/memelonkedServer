const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const reelRoutes = require('./routes/reelRoutes');
const newsFeedRoute = require('./routes/newsFeedRoutes');
const userRoutes = require('./routes/userRoutes');
const giftRoutes = require('./routes/giftRoutes');
const memeRoutes = require('./routes/memeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 

app.use('/api/reels', reelRoutes); // Use the reelRoutes for handling reel-related requests
app.use('/api/users', authRoutes);
app.use('/api/newsfeed', newsFeedRoute);
app.use('/api/usersRoute', userRoutes);
app.use('/api/gifts', giftRoutes); 
app.use('/api/memes', memeRoutes); 


app.get('/', (req, res) => {
  res.send('Firebase Express API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const { OAuth2Client } = require('google-auth-library');
const User = require('../Model/User');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


exports.verifyGoogleToken = async (req, res) => {
    const { token } = req.body;
  
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      console.log('Google payload:', payload);
  
      // Check if user already exists
      let user = await User.findOne({ email: payload.email });
  
      if (user) {
        // Update last login time
        user.lastLogin = new Date();
        await user.save();
        console.log('Existing user logged in:', user.email);
      } else {
        // Create new user
        user = new User({
          name: payload.name,
          email: payload.email,
          picture: payload.picture,
          googleId: payload.sub
        });
        await user.save();
        console.log('New user created:', user.email);
      }
  
      // Return user data to client
      res.status(200).json({
        message: 'Token verified',
        user: {
          name: user.name,
          email: user.email,
          picture: user.picture
        },
      });
  
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  };

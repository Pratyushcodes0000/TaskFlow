const express = require('express');
const router = express.Router();
const UserController = require('../controller/UserController');
const auth = require('../middleware/auth');
const axios = require('axios');

// ... existing routes ...

// Proxy endpoint for Google profile pictures
router.get('/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'image/*'
      }
    });

    // Set appropriate headers
    res.set('Content-Type', response.headers['content-type']);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.set('Access-Control-Allow-Origin', '*');

    // Send the image data
    res.send(response.data);
  } catch (error) {
    console.error('Error proxying image:', error);
    res.status(500).json({ error: 'Failed to proxy image' });
  }
});

module.exports = router; 
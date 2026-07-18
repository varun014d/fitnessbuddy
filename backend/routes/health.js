const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Fitness Buddy',
    model: process.env.IBM_MODEL_ID || 'ibm/granite-13b-chat-v2',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

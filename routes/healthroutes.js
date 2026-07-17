const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'GoPass Backend is running successfully',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
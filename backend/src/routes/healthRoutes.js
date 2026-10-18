const express = require('express');
const router = express.Router();
const { getHealth } = require('../controllers/studentController');

router.get('/', getHealth);

module.exports = router;

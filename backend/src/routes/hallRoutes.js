const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');

router.get('/', hallController.getAllHalls);
router.get('/:id', hallController.getHallById);
// router.post('/', hallController.createHall); // Admin/Owner only

module.exports = router;

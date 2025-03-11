const express = require('express');
const meeting = require('./meeting');
const auth = require('../../middelwares/auth');

const router = express.Router();

router.get('/', auth, meeting.index)
router.post('/add', auth, meeting.add)
router.post('/view/:id', auth, meeting.index)
router.delete('/delete/:id', auth, meeting.deleteData)
router.post('/deleteMany', auth, meeting.deleteMany)

module.exports = router
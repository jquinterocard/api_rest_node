'use strict';

const express = require('express');
const commentController = require('../controllers/comment');

const router = express.Router();
const md_auth = require('../middlewares/authenticated');

router.post('/comment/topic/:topicId',md_auth.authenticated,commentController.add);
router.put('/comment/:commentId',md_auth.authenticated,commentController.update);
router.delete('/comment/:topicId/:commentId',md_auth.authenticated,commentController.delete);


module.exports = router;


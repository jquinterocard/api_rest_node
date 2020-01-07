'use strict';

const express = require('express');
const topicController = require('../controllers/topic');

const router = express.Router();
const md_auth = require('../middlewares/authenticated');

router.post('/topic',md_auth.authenticated,topicController.save);
//page es opcional si no llega sera page=1
router.get('/topics/:page?',topicController.getTopics);
router.get('/user-topics/:user',topicController.getTopicsByUser);
router.get('/topic/:id',topicController.getTopic)
router.put('/topic/:id',md_auth.authenticated,topicController.update);
router.delete('/topic/:id',md_auth.authenticated,topicController.delete);
router.get('/search/:search',topicController.search);
module.exports = router;



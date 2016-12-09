"use strict";
import express from 'express';
import path from 'path';

const router = express.Router();

// /file

router.use('/', express.static(path.join(__dirname, '/../public/files')));

module.exports = router;

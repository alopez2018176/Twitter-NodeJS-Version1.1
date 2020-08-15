'use strict'

const express = require('express')
const Controller = require('../controllers/managementController')

var api= express.Router();

api.post('/commands', Controller);

module.exports = api;
const express = require('express');
const router = express.Router();


router.use('/product',require('./productRoutes'));
router.use('/user',require('./userRoutes'));
router.use('/order',require('./orderRoutes'));


module.exports = router;
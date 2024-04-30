const express = require('express');
const orderController = require('../controllers/orderController');
const {isAuthenticatedUser,authorizeRole} = require('../middleware/auth');

const router = express.Router();

router.post('/create',isAuthenticatedUser,orderController.newOrder);
router.get('/get/:id',isAuthenticatedUser,orderController.getOrderDetails);
router.get('/myOrders',isAuthenticatedUser,orderController.myOrders);
router.get('/admin/allOrders',isAuthenticatedUser,authorizeRole('admin'),orderController.allOrders);
router.put('/admin/update/status/:id',isAuthenticatedUser,authorizeRole('admin'),orderController.updateOrder);
router.delete('/admin/delete/:id',isAuthenticatedUser,authorizeRole('admin'),orderController.deleteOrder);


module.exports = router;
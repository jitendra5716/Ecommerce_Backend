const express = require('express');
const router = express.Router();
const productController = require('../controllers/productsController');
const {isAuthenticatedUser,authorizeRole} = require('../middleware/auth');

router.get('/getAllProducts',productController.getAllProducts);
router.post('/admin/create',isAuthenticatedUser,authorizeRole('admin'),productController.createProduct);
router.get('/getProduct/:id',productController.getProductDetails);
router.put('/admin/update/:id',isAuthenticatedUser,authorizeRole('admin'),productController.updateProduct);
router.delete('/admin/delete/:id',isAuthenticatedUser,authorizeRole('admin'),productController.deleteProduct);

router.put('/reviews',isAuthenticatedUser,productController.createProductReview);
router.get('/reviews',isAuthenticatedUser,productController.getProductReviews);
router.delete('/review/delete',isAuthenticatedUser,productController.deleteReview);

module.exports = router;
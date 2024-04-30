const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {isAuthenticatedUser,authorizeRole} = require('../middleware/auth');

router.post('/register',userController.registerUser);
router.post('/login',userController.loginUser);
router.get('/logout',userController.logoutUser);

router.post('/password/forgot',userController.forgotPassword);
router.put('/password/reset/:token',userController.resetPassword);


router.get('/me',isAuthenticatedUser,userController.getUserProfile);
router.put('/password/update',isAuthenticatedUser,userController.updatePassword);
router.put('/profile/update',isAuthenticatedUser,userController.updateProfile);
router.get('/allUsers',isAuthenticatedUser,authorizeRole('admin'),userController.allUsers);
router.get('/getUserDetails/:id',isAuthenticatedUser,authorizeRole('admin'),userController.getUserDetails);
router.put('/updateUser/:id',isAuthenticatedUser,authorizeRole('admin'),userController.updateUser);
router.delete('/deleteUser/:id',isAuthenticatedUser,authorizeRole('admin'),userController.deleteUser);
router.put("/upload_avatar", isAuthenticatedUser,userController.uploadAvatar);

module.exports = router;
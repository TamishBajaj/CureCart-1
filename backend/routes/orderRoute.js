const express=require('express')

const router=express.Router()
const {isAuthenticatedUser,authorizedRoles} = require('../middleware/auth')
const { createOrder, getOrder, myOrders, getAllOrders, updateOrder, deleteOrder } = require('../controllers/orderController')

router.route("/order/new").post(isAuthenticatedUser,createOrder)

router.route("/order/:id").get(isAuthenticatedUser,getOrder)
router.route("/order/me").get(isAuthenticatedUser,myOrders)

router.route("/admin/orders").get(isAuthenticatedUser,authorizedRoles("admin"),getAllOrders)
router.route("/admin/order/:id").put(isAuthenticatedUser,authorizedRoles("admin"),updateOrder).delete(isAuthenticatedUser,authorizedRoles("admin"),deleteOrder)

module.exports=router
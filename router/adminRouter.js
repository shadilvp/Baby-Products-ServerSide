import express from "express"
import { addProduct } from "../controller/adminController/productController.js"
import { getAllProducts } from "../controller/adminController/productController.js" 
import { getAllUsers } from "../controller/adminController/userController.js"

const router = express.Router()

router.post('/addproduct',addProduct)//posting an product
router.get('/products',getAllProducts)
router.get('/users',getAllUsers)

export default router;
import Cart from "../../models/cartModel.js";
import {Product} from "../../models/productModel.js"
import {User} from "../../models/userModel.js";


export const addToCart = async (req,res) => {
    const {userId} = req.params;
    const {productId, quantity} = req.body;


        let user = await User.findById(userId)
        if(!user){
            return res.status(404).json({success:false,message:"user is not found"})
        }
        let product = await Product.findById(productId)
        if(!product){ //checking the product is true
            return res.status(404).json({success:false,message:"product is not found"})
        }

        let cart = await Cart.findOne({userId})
        if(!cart){ //checking that user have an cart if there is no cart then add an cart
            cart = new Cart({userId, items:[]})
        }

        const existingProduct = cart.items.find((item)=> item.productId._id.toString() == productId)
        if(existingProduct){
            return res.status(404).json({success:false, message:`product already in the cart`})
        }

        const existingProductIndex = cart.items.findIndex(item=>item.productId.toString()=== productId)

        if(existingProductIndex !== -1){ //if there is product then add it by quantity
            cart.items[existingProductIndex].quantity += quantity ;
        }else{ //else add new product
            cart.items.push({productId,quantity})
        }

        let grandTotal = 0;
        const updatedItems = await Promise.all(
            cart.items.map(async(item)=>{
                const productDetails = await Product.findById(item.productId)
                const totalPrice = item.quantity * productDetails.price;
                item.totalPrice = totalPrice;
                grandTotal += totalPrice;
                return item ;
            })
        )
        cart.items = updatedItems
        cart.totalAmount = grandTotal;
        await cart.save()


        user.cart = cart._id;
        await user.save();

        res.status(200).json({success : true , message: "item is succesfully added to the cart", cart})

}



//showing cart datas of current user ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const getCart = async (req,res) => {
    const {userId} = req.params

        const cart =  await Cart.findOne({userId}).populate("items.productId","name price image")
        if(!cart){
            return res.status(404).json({success:false, message:"cart is not found"})
        }

        //for adding total and grand total
        res.status(200).json({success: true, cart})

}


//Delete Products from the Cart---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const removeFromCart = async (req,res) => {
    const {productId} = req.body;
    const userId = req.user._id;

        const cart = await Cart.findOne({userId})
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== productId)
        let grandTotal = 0;
        cart.items.forEach(items => {
            grandTotal += items.totalPrice;
        })
        cart.totalAmount = grandTotal
        await cart.save()

        res.status(200).json({ success: true, cart });


}


//Increasing and Decreasing quantity from the Cart ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const udpateQuantity = async (req,res) => {

        
        const {productId, action} = req.body;
        const userId = req.user._id;
        console.log("user",userId)
        
        let cart = await Cart.findOne({userId});
        if (!cart) {
            return res.status(404).json({ success: false, message: "cart not found" });
        }
        console.log("cart",cart)
        let product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
    
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId)
        if(itemIndex > -1){
            if(action === "increase"){
                cart.items[itemIndex].quantity += 1
            }else if(action === "decrease"){
                cart.items[itemIndex].quantity -= 1
                if(cart.items[itemIndex].quantity <=0){
                    cart.items.splice(itemIndex,1)
                }
            }else{
                res.status(400).json({success : false, message : "invalid action"})
            }

            cart.items[itemIndex].totalPrice = cart.items[itemIndex].quantity * product.price ;
            let grandTotal = 0 ;
            cart.items.forEach(item => {
                grandTotal += item.totalPrice ;
            });

            cart.totalAmount = grandTotal ;

            await cart.save()

            res.status(200).json({success:true, message:cart})
        }else{
            res.status(404).json({success:false,message:"cart is not found"})
        } 


}
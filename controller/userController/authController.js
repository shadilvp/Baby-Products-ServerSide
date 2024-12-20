import User from "../../models/userModel.js";

//register a new User --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const userRegister = async (req, res) => {
    try {
        const { name, email, password, roll } = req.body;

        // Validate input fields
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all required fields" });
        }

        console.log('Received data:', { name, email, password });

        // Check if user already exists
        const currentUser = await User.findOne({ email });
        if (currentUser) {
            return res.status(404).json({ success: false, message: 'User already exists' });
        }

        const newUser = new User({
            name,
            email,
            password,
            roll
            
        })
        console.log(newUser);


        await newUser.save();

        return res.status(201).json({ success: true, message: 'User successfully registered', data: newUser });
    } catch (error) {
        console.error('Error:', error); // Log the error
        res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
}

//User Loign ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const loginUser = async (req,res) => {
    try {
        const {email,password} = req.body
        if(!email || !password){
            return res.status(404).json({success : false, message : "Please please all this required fields"})
        }

        const existingUser = await User.findOne({email})
        if(!existingUser){
           return  res.status(401).json({success : false,message:"No user is found"})
        }
        if(existingUser.roll === "admin"){
           return res.status(201).json({success : true, message: "Admin is logged succesfully ",data: existingUser})
        }else{
           return res.status(201).json({success : true, message: "User is logged succesfully ",data: existingUser})
        }

    } catch (error) {
        console.error('Error:',error)
       return res.status(500).json({success: false, message:`server error ${error.message}`})
    }
}

import userModel from '../models/userModel.js';

export const getUserData = async (req, res)=>{
    try {
        const userId = req.user?.id;

        const user = await userModel.findById(userId)

        if(!user){
            return res.json({seccess: false, message: 'User not found'})
        }
        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified
            }
        });

    } catch (error) {
        res.json({seccess: false, message: error.message})
    }
}

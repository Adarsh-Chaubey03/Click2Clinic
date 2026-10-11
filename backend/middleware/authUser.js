import jwt from 'jsonwebtoken'

// user authentication middleware

const authUser = async(req,res,next)=>{
    try {
        
        const { token } = req.headers
        if(!token){
            return res.status(401).json({success:false,message:"not authorized login again"})
        }
        const token_decode = jwt.verify(token,process.env.JWT_SECRET)
        req.userId = token_decode.id
        // Preserve the legacy controller contract while ensuring the JWT value
        // always overwrites any client-supplied identity.
        req.body = req.body || {}
        req.body.userId = req.userId
        next()

    } catch (error) {
        console.warn(`Authentication rejected: ${error.name || 'invalid token'}`)
        res.status(401).json({success:false,message:"not authorized login again"})
    }
}

export default authUser

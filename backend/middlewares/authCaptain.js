import jwt from "jsonwebtoken";

export const authCaptain = async (req, res, next) => {
    const { captainToken } = req.cookies;
    if (!captainToken) {
        return res.status(401).json({ message: "Unauthorized", success: false });
    }
    try {
        const decoded = jwt.verify(captainToken, process.env.JWT_SECRET);
        if (decoded.captainId) {
            req.captainId = decoded.captainId;
            return next();
        } else {
            return res.status(403).json({ message: "Forbidden", success: false });
        }
    } catch (error) {
        console.error("Error in authCaptain middleware:", error);
        return res.status(401).json({ message: "Invalid token", success: false });
    }
};

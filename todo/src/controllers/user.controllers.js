import { asyncHandler } from "../utility/asyncHandler.js"; // Correct the spelling of "asyncHandler"

const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "code with samir",
    });
});

export { registerUser };


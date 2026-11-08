
// Express package ko import kar rahe hain
const express = require("express");

// Express application create kar rahe hain
const app = express();

// Server kis port par chalega
const PORT = 3000;

// Middleware
app.use(express.json());

// Temporary array
const users = [];
let nextUserId = 1;

// ==========================
// Registration API (POST)
// ==========================
app.post("/register", (req, res) => {

    // Request body se data receive kar rahe hain
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Duplicate Email Check
    const existingUser = users.find(
        user => user.email === cleanEmail
    );

    if (existingUser) {
        return res.status(409).json({
            message: "Email already exists"
        });
    }

    // Naya user object create kar rahe hain
    const newUser = {
        id: nextUserId++,
        name: name.trim(),
        email: cleanEmail,
        password
    };

    // User ko array me save kar rahe hain
    users.push(newUser);

    // Success response
    res.status(201).json({
        message: "Registration Successful",
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }
    });
});

// ==========================
// Get All Users API (GET)
// ==========================
app.get("/users", (req, res) => {

    // Password hide kar rahe hain
    const allUsers = users.map(({ password, ...user }) => user);

    // Tamam users return kar rahe hain
    res.status(200).json({
        message: "All Users Fetched Successfully",
        users: allUsers
    });
});

// ==========================
// Get Single User By ID (GET)
// ==========================
app.get("/users/:id", (req, res) => {

    // URL se ID receive kar rahe hain
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid User ID"
        });
    }

    // User ko ID se find kar rahe hain
    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const { password, ...safeUser } = user;

    res.status(200).json({
        message: "User Found Successfully",
        user: safeUser
    });
});

// ==========================
// Update User API (PUT)
// ==========================
app.put("/users/:id", (req, res) => {

    const id = Number(req.params.id);
    const { name, email, password } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid User ID"
        });
    }

    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    // Name validation
    if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Invalid name"
            });
        }
    }

    // Email validation
    if (email !== undefined) {
        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                message: "Invalid email"
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        const existingUser = users.find(
            user => user.email === cleanEmail && user.id !== id
        );

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        user.email = cleanEmail;
    }

    // Update user information
    if (name !== undefined) {
        user.name = name.trim();
    }

    if (password !== undefined) {
        if (typeof password !== "string" || !password) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        user.password = password;
    }

    const { password: hiddenPassword, ...safeUser } = user;

    res.status(200).json({
        message: "User Updated Successfully",
        user: safeUser
    });
});

// ==========================
// Delete User API (DELETE)
// ==========================
app.delete("/users/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid User ID"
        });
    }

    const userIndex = users.findIndex(
        user => user.id === id
    );

    if (userIndex === -1) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    // Warning before deletion
    if (req.query.confirm !== "true") {
        return res.status(200).json({
            warning: "Are you sure you want to delete this user?",
            message: "Send request again with ?confirm=true to delete."
        });
    }

    // User ko delete kar rahe hain
    const deletedUser = users.splice(userIndex, 1)[0];

    res.status(200).json({
        message: "User Deleted Successfully",
        deletedUser: {
            id: deletedUser.id,
            name: deletedUser.name,
            email: deletedUser.email
        }
    });
});

// ==========================
// Start Server
// ==========================
app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
});

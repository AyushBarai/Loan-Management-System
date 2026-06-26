"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const models_1 = require("../models");
const jwt_1 = require("../utils/jwt");
// ─── POST /api/auth/register ──────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }
        // Check duplicate email
        const existing = await models_1.User.findOne({ email: email.toLowerCase() });
        if (existing) {
            res.status(409).json({ success: false, message: 'Email already registered' });
            return;
        }
        // Borrowers self-register; executives are created by seed script only
        const user = await models_1.User.create({ name, email, password, role: 'borrower' });
        const token = (0, jwt_1.signToken)({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        });
        res.status(201).json({
            success: true,
            data: {
                token,
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed';
        res.status(500).json({ success: false, message });
    }
};
exports.register = register;
// ─── POST /api/auth/login ─────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }
        // .select('+password') overrides the `select: false` on the schema
        const user = await models_1.User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            // LEARN: Return the SAME error for wrong email AND wrong password.
            // Different messages allow user enumeration attacks.
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const token = (0, jwt_1.signToken)({
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        });
        res.json({
            success: true,
            data: {
                token,
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
            },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        res.status(500).json({ success: false, message });
    }
};
exports.login = login;
// ─── GET /api/auth/me ─────────────────────────────────────────────────
const getMe = async (req, res) => {
    try {
        const user = await models_1.User.findById(req.user.userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({
            success: true,
            data: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch user';
        res.status(500).json({ success: false, message });
    }
};
exports.getMe = getMe;

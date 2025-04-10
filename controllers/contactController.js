const asynchandler = require("express-async-handler");
const Contact = require("../models/contactModel");

// @desc    Get all contacts for user
// @route   GET /api/contacts
// @access  Private
const getContacts = asynchandler(async (req, res) => {
    const contacts = await Contact.find({ user_id: req.user.id });
    res.status(200).json({
        success: true,
        count: contacts.length,
        data: contacts
    });
});

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
const createContact = asynchandler(async (req, res) => {
    const { name, email, phone } = req.body;

    // Validate input
    if (!name || !email || !phone) {
        res.status(400); // Changed from 404 to 400 (Bad Request)
        throw new Error("All fields are mandatory!");
    }

    const contact = await Contact.create({
        name,
        email,
        phone,
        user_id: req.user.id
    });

    res.status(201).json({
        success: true,
        data: contact
    });
});

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
const getContact = asynchandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        res.status(404);
        throw new Error("Contact not found!");
    }

    // Verify contact ownership
    if (contact.user_id.toString() !== req.user.id.toString()) {
        res.status(403); // 403 Forbidden is more appropriate
        throw new Error("Not authorized to access this contact!");
    }

    res.status(200).json({
        success: true,
        data: contact
    });
});

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = asynchandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
        res.status(404);
        throw new Error("Contact not found!");
    }

    // Verify contact ownership
    if (contact.user_id.toString() !== req.user.id.toString()) {
        res.status(403);
        throw new Error("Not authorized to update this contact!");
    }

    const updatedContact = await Contact.findByIdAndUpdate(
        req.params.id,
        req.body,
        { 
            new: true,
            runValidators: true 
        }
    );

    res.status(200).json({
        success: true,
        data: updatedContact
    });
});

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
const deleteContact = asynchandler(async (req, res) => {
    try {
        // 1. Verify the contact exists
        const contact = await Contact.findOne({
            _id: req.params.id,
            user_id: req.user.id // Ensures ownership in single query
        });

        if (!contact) {
            return res.status(404).json({
                success: false,
                error: "Contact not found or you don't have permission"
            });
        }

        // 2. Debug logging (temporary)
        console.log("Deleting contact:", {
            contactId: contact._id,
            ownerId: contact.user_id,
            requestingUserId: req.user.id
        });

        // 3. Perform deletion
        const result = await Contact.deleteOne({ _id: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(500).json({
                success: false,
                error: "Contact could not be deleted"
            });
        }

        // 4. Success response
        return res.status(200).json({
            success: true,
            data: {
                id: req.params.id,
                message: "Contact successfully deleted"
            }
        });

    } catch (error) {
        console.error("Delete error:", error);
        return res.status(500).json({
            success: false,
            error: "Server error during deletion",
            details: error.message
        });
    }
});
module.exports = {
    getContacts,
    createContact,
    getContact,
    updateContact,
    deleteContact
};
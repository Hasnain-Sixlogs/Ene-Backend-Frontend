const Notes = require("../models/note.model");

const createNote = async (req, res) => {
  try {
    const {
      bible_id,
      bible_name,
      book_version,
      filesetsid,
      bookname,
      bookid,
      chapter_number,
      start_verse,
      end_verse,
      highlighted_text,
      api_path,
      message,
      thought,
    } = req.body;
    const userId = req.user?._id;

    // Validation
    if (!bible_id || !chapter_number || !highlighted_text) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (bible_id, chapter_number, highlighted_text)",
      });
    }

    // Create note
    const note = new Notes({
      user_id: userId,
      bible_id,
      bible_name: bible_name || null,
      book_version: book_version || null,
      filesetsid: filesetsid || null,
      bookname: bookname || null,
      bookid: bookid || null,
      chapter_number,
      start_verse: start_verse || null,
      end_verse: end_verse || null,
      highlighted_text,
      api_path: api_path || null,
      message: message || null,
      thought: thought || null,
    });

    await note.save();

    // Populate user reference
    await note.populate("user_id", "name email mobile");

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: {
        note,
      },
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating note",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAllNotes = async (req, res) => {
  try {
    const userId = req.user?._id;
    const {
      bible_id,
      bookid,
      chapter_number,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object - only get notes belonging to the user
    const filter = {
      user_id: userId,
    };

    // Optional filters
    if (bible_id) {
      filter.bible_id = bible_id;
    }

    if (bookid) {
      filter.bookid = bookid;
    }

    if (chapter_number) {
      filter.chapter_number = parseInt(chapter_number);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Get notes
    const notes = await Notes.find(filter)
      .populate("user_id", "name email mobile")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Notes.countDocuments(filter);

    res.json({
      success: true,
      message: "Notes retrieved successfully",
      data: {
        notes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get all notes error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving notes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const note = await Notes.findById(id).populate("user_id", "name email mobile");

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Check if the note belongs to the user
    const noteUserId = note.user_id?._id?.toString() || note.user_id?.toString();
    if (noteUserId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this note",
      });
    }

    res.json({
      success: true,
      message: "Note retrieved successfully",
      data: {
        note,
      },
    });
  } catch (error) {
    console.error("Get note by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving note",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const {
      highlighted_text,
      message,
      thought,
      start_verse,
      end_verse,
    } = req.body;

    const note = await Notes.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Check if the note belongs to the user
    const noteUserId = note.user_id?.toString() || note.user_id?._id?.toString();
    if (noteUserId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this note",
      });
    }

    // Update fields
    if (highlighted_text !== undefined) note.highlighted_text = highlighted_text;
    if (message !== undefined) note.message = message;
    if (thought !== undefined) note.thought = thought;
    if (start_verse !== undefined) note.start_verse = start_verse;
    if (end_verse !== undefined) note.end_verse = end_verse;

    await note.save();

    // Populate user reference
    await note.populate("user_id", "name email mobile");

    res.json({
      success: true,
      message: "Note updated successfully",
      data: {
        note,
      },
    });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating note",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const note = await Notes.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    // Check if the note belongs to the user
    const noteUserId = note.user_id?.toString() || note.user_id?._id?.toString();
    if (noteUserId !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this note",
      });
    }

    await Notes.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting note",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
};


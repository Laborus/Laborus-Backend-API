// utils/upload.js
const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage(); // Adjust this as needed

const submittUpload = multer({
  storage: storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // Limite de 3MB
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|ppt|pptx/; // Tipos de arquivo permitidos
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Arquivo deve ser um documento ou apresentação"));
    }
  },
}).single("file");

module.exports = submittUpload; // Only export the upload middleware

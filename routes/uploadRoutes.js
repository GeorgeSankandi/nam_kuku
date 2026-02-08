import path from 'path';
import express from 'express';
import multer from 'multer';

const router = express.Router();

// Define the root directory
const __dirname = path.resolve();

// Configure storage for product images
const productStorage = multer.diskStorage({
  destination(req, file, cb) {
    // Corrected Path: Point to public/uploads/products
    cb(null, path.join(__dirname, 'public/uploads/products/'));
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Configure storage for hero images
const heroStorage = multer.diskStorage({
  destination(req, file, cb) {
    // Corrected Path: Point to public/uploads/heroes
    cb(null, path.join(__dirname, 'public/uploads/heroes/'));
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});


function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only! (jpg, jpeg, png)');
  }
}

const uploadProduct = multer({
  storage: productStorage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const uploadHero = multer({
  storage: heroStorage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Route for product images
router.post('/product', uploadProduct.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'Please upload a file' });
  }
  // Return the correct web-accessible path
  res.send({
    message: 'Image uploaded successfully',
    image: `/uploads/products/${req.file.filename}`,
  });
});

// Route for hero images
router.post('/hero', uploadHero.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'Please upload a file' });
  }
  // Return the correct web-accessible path
  res.send({
    message: 'Hero image uploaded successfully',
    image: `/uploads/heroes/${req.file.filename}`,
  });
});

export default router;
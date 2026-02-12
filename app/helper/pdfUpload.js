const multer = require('multer');
const path = require('path');
const fs = require('fs');


const FILE_TYPE_MAP = {
    'application/pdf': 'pdf'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid file type.Only pdf is allowed');
        if (isValid) {
            uploadError = null;
        }

        const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'resume');

        fs.mkdirSync(uploadPath, { recursive: true });

        cb(uploadError, uploadPath);

        //    cb(uploadError,'uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const newFileName = path.parse(fileName).name;
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${newFileName}-${Date.now()}.${extension}`);
    }
})

const pdfUpload = multer({ storage: storage });

module.exports = pdfUpload;
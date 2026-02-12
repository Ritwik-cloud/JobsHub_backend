const multer = require('multer');
const path = require('path');
const fs = require('fs');


const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

// const storage=multer.diskStorage({
//     destination:function(req,file,cb){
//        const isValid=FILE_TYPE_MAP[file.mimetype];
//        let uploadError=new Error('invalid image type');
//        if(isValid){
//            uploadError=null;
//        }
//        cb(uploadError,'uploads')
//     },
//     filename:function(req,file,cb){
//         const fileName=file.originalname.split(' ').join('-');
//         const newFileName = path.parse(fileName).name;
//         const extension=FILE_TYPE_MAP[file.mimetype];
//         cb(null,`${newFileName}-${Date.now()}.${extension}`);
//     }
// })

// const imageUpload = multer({ storage: storage });

function createImageUploader(folderName = '') {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const isValid = FILE_TYPE_MAP[file.mimetype];
            let uploadError = new Error('Invalid image type');
            if (isValid) {
                uploadError = null;
            }

            const uploadPath = path.join(__dirname, '..', '..', 'uploads', folderName);
          
            fs.mkdirSync(uploadPath, { recursive: true });

            cb(uploadError, uploadPath);
        },
        filename: function (req, file, cb) {
            const fileName = file.originalname.split(' ').join('-');
            const name = path.parse(fileName).name;
            const extension = FILE_TYPE_MAP[file.mimetype];
            cb(null, `${name}-${Date.now()}.${extension}`);
        }
    });

    return multer({ storage: storage });
}




module.exports = createImageUploader;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const hassPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
}

// const generatePassword = (length=6) => {
//     return crypto.randomBytes(length)
//         .toString('base64') // Convert to string
//         .replace(/[^a-zA-Z0-9]/g, '') // Remove non-alphanumeric
//         .slice(0, length); //
// }

module.exports = {
    hassPassword,
    comparePassword,
    // generatePassword
}
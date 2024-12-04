const fs = require('fs');
const path = require('path');

const ensureUploadsDirectory = () => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
};

module.exports = ensureUploadsDirectory;

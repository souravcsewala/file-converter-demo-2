const libre = require('libreoffice-convert');

function convertDocToPdf(inputBuffer) {
    return new Promise((resolve, reject) => {
        libre.convert(inputBuffer, '.pdf', undefined, (err, done) => {
            if (err) return reject(err);
            resolve(done);
        });
    });
}

module.exports = { convertDocToPdf };

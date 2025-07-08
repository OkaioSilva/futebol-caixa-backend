const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
    keyFilename: './config/firebase-key.json',
});
const bucket = storage.bucket('seu-bucket-firebase');

module.exports = bucket;
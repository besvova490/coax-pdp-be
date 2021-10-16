const { bucket } = require("../services/storage");

const uploadImage = async (originalname = "image.jpeg", buffer) => new Promise((resolve, reject) => {
  const uniqName = `${Date.now()}-${originalname.replace(/ /g, "_")}`;

  const blob = bucket.file(uniqName);
  const blobStream = blob.createWriteStream({ resumable: false });

  blobStream.on('finish', () => {
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    resolve({
      name: uniqName,
      url: publicUrl,
    })
  })
  .on('error', () => {
    reject(`Unable to upload image, something went wrong`)
  })
  .end(buffer);
});

module.exports = uploadImage;

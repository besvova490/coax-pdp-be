const { Storage } = require("@google-cloud/storage");
const path = require("path");

const storage = new Storage({ keyFilename: "google-cloud-key.json" });
const bucket = storage.bucket("coax_pdp_storage");

module.exports = { storage, bucket };

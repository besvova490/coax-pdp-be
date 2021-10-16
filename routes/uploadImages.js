const { Router } = require("express");
const FileType = require("file-type");

//helpers
const uploadImage = require("../utils/uploadImage");

const filesRouter = Router();


filesRouter.post("/", async (req, res) => {
  try {
    const fileType = await FileType.fromBuffer(req.body);
    const result = await uploadImage(`image.${fileType.ext || "jpeg"}`, req.body);

    res.status(200).json({ result: result });
  } catch (e) {
    console.log(e);
    res.status(500).json({ msg: e });
  }
});

module.exports = filesRouter;

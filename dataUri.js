const DataUriParser = require("datauri/parser");
const path = require("path");

const getUri = (image) => {
  const parser = new DataUriParser();
  const extName = path.extname(image.originalname).toString();
  return parser.format(extName, image.buffer);
};

module.exports = getUri;

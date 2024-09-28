const zod = require("zod");

const userValidation = zod.object({
  rollno: zod.coerce.number(),
  name: zod.string(),
  marks: zod.coerce.number(),
});

module.exports = userValidation;

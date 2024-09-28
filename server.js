const express = require("express");
const db = require("./db");
const cors = require("cors");
const userValidation = require("./InputValidation");
const dataUri = require("./dataUri");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// FETCH ALL DATA Funtion

const fetchAllStudents = (res, successMsg = null) => {
  const query = "SELECT * from students";

  db.query(query, (err, data) => {
    if (err) {
      return res.status(500).json({
        msg: "Some Error Occurred while Fetching Data",
        err,
      });
    }
    return res.status(200).json({
      msg: successMsg || "Data Fetched Successfully",
      data: data,
    });
  });
};

// POST LOGIC

app.post("/api/addStudent", upload.single("image"), async (req, res) => {
  const {rollno, name, marks} = req.body;
  const image = req.file;

  // const checkValidation = userValidation.safeParse(req.body);
  // if (!checkValidation.success) {
  //   return res.status(400).json({ msg: "Validation Error" });
  // }

  if (!rollno || !name || !marks || !image) {
    return res.status(400).json({
      msg: `Please Enter all Credentials`,
    });
  }

  const querysearch = `SELECT * FROM students WHERE rollno = ? `;

  db.query(querysearch, [rollno], async (err, data) => {
    if (err) {
      return res.status(500).json({
        msg: "Some Problem Occyred in Database",
      });
    }

    // if (data.length > 0) {
    //   return res.status(400).json({
    //     msg: `The Roll No ${rollno} Already Exists`,
    //   });
    // }

    const imageUrl = dataUri(image);

    try {
      const myCloud = await cloudinary.uploader.upload(imageUrl.content);
      const {public_id, url} = myCloud;

      const query =
        "INSERT INTO students (rollno, name, marks, image_url, public_id) VALUES (?, ?, ?, ?, ?)";
      db.query(query, [rollno, name, marks, url, public_id], (err) => {
        if (err) {
          return res.status(500).json({
            msg: "Roll No Already Exists",
            err,
          });
        }
        return res.status(201).json({
          msg: "Data Saved",
        });
      });
    } catch (err) {
      return res.status(500).json({
        msg: "Some Error Occured while Uploading the Image on Cloudinary",
        err: err,
      });
    }
  });
});

// GET LOGIC

app.get("/api/getStudents", (req, res) => {
  fetchAllStudents(res);
});

// DELETE LOGIC

app.delete("/deleteStudent/:rollno", (req, res) => {
  const {rollno} = req.params;

  const querysearch = `SELECT * FROM students WHERE rollno = ?`;

  db.query(querysearch, [rollno], (err, results) => {
    if (err) {
      return res.status(500).json({
        msg: "Some Error Occurred from the Database..",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        msg: `Roll No ${rollno} Doesn't Exist Please Provide Correct Rollno`,
      });
    }

    const querydelete = `DELETE FROM students WHERE rollno = ?`;

    db.query(querydelete, [rollno], (err) => {
      if (err) {
        return res.status(500).json({
          msg: "Some Error occurred while Deleting the Data",
        });
      }

      fetchAllStudents(
        res,
        `Student with Roll No ${rollno} Deleted Successfully`
      );
    });
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is Running on PORT ${process.env.PORT}`);
});

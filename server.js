const express = require("express");
const cors = require("cors");
const hbs = require("hbs");
const path = require("path");
const ExcelJS = require("exceljs");

require("dotenv").config();

//database connection & modelSchema
require("./Connection/conn");
const userModel = require("./Model/userModel");
const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./views"));
app.use(express.static(path.join(__dirname, "./public")));
// mongodb date formate funtion
hbs.registerHelper("formatDate", function (date) {
  if (!date) return "";

  // Return an empty string if the date is undefined or null
  const dateObj = new Date(date);
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = String(dateObj.getFullYear()).slice(-2);
  return `${year}/${month}/${day}`;
});

// date formate function for createdAt
hbs.registerHelper("formatDateCreate", function (date) {
  if (!date) {
    return "";
  }

  const dateObj = new Date(date);
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = String(dateObj.getFullYear()).slice(-2);

  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const seconds = String(dateObj.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
});
// index formate function
hbs.registerHelper("incrementIndex", function (index) {
  return index + 1;
});
// class change function
hbs.registerHelper("getClassForFollow", function (follow) {
  if (follow === "busy") {
    return "bg-danger";
  } else if (follow === "call back") {
    return "bg-info";
  } else if (follow === "not-interested") {
    return "bg-warning";
  } else if (follow === "interested") {
    return "bg-primary";
  } else if (follow === "not-reachable") {
    return "bg-success";
  }
  return "";
});
let data = "";

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/dashboad", async (req, res) => {
  res.render("index");
});

//direct enter this page
app.get("/login", (req, res) => {
  res.render("index");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const clientData = await userModel.find();
  if (username === "admin" && password === "password") {
    res.render("dashboad.hbs", { data: clientData });
  } else {
    res.send("username & password wrong");
  }
});

// all parameter searching route
app.post("/dashboad", async (req, res, next) => {
  const All = req.body.all;
  const selectedStatus = req.body.status;
  const startDate = req.body.fromDate;
  const endDate = req.body.toDate;
  const selectedOption = parseInt(req.body.selectedOption, 10);

  try {
    let clientData;

    if (selectedStatus) {
      clientData = await userModel
        .find({
          $or: [
            { name: selectedStatus },
            { follow: selectedStatus },
            { email: selectedStatus },
            { mobile: selectedStatus },
          ],
        })
        .limit(selectedOption);
    } else if (startDate) {
      const startDate = req.body.fromDate;
      const endDate = req.body.toDate;

      clientData = await userModel
        .find({ $or: [{ followdate: { $gte: startDate, $lte: endDate } }] })
        .sort({ followdate: 1 });
      res.render("dashboad.hbs", { data: clientData });
    } else {
      clientData = await userModel.find().limit(selectedOption);
    }

    res.render("dashboad", { data: clientData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal my error Server Error" + error });
  }
});

// data create route
app.post("/api", async (req, res) => {
  const formData = req.body;
  const currentDate = new Date();
  const user = await new userModel({
    name: formData.user_name,
    mobile: formData.user_mobile,
    email: formData.user_email,
    service: formData.user_service,
    status: "",
    updated: "",
    follow: "",
    followdate: "",
    createdAt: currentDate,
  });
  const createuser = await user.save();
  // console.log(createuser);
  res.status(201).send({ message: "success" });
});

// updated data route
app.post("/update/:id", (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;

  // Update the document in MongoDB
  userModel
    .findByIdAndUpdate(userId, updatedData, { new: true })
    .then((updatedUser) => {
      res.json({ message: "User updated successfully" });
    })
    .catch((error) => {
      console.error("Failed to update user", error);
      res.status(500).json({ error: "Failed to update user" });
    });
});

//excel sheet download route
app.get("/download-excel", async (req, res) => {
  try {
    // Fetch the data from the userModel or any other source
    const clientData = await userModel.find();

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    // Set the column headers
    worksheet.getRow(1).values = [
      "Name",
      "Mobile",
      "Email",
      "Service",
      "Status",
      "Remark",
      "Follow Up",
      "Follow Date",
    ];
    worksheet.getRow(1).font = {
      bold: true,
    };

    // Populate the data rows
    clientData.forEach((data, index) => {
      const row = worksheet.addRow([
        data.name,
        data.mobile,
        data.email,
        data.service,
        data.status,
        data.updated,
        data.follow,
        data.followdate,
      ]);
    });

    // Set response headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="data.xlsx"');

    // Send the Excel file as the response
    workbook.xlsx
      .write(res)
      .then(() => {
        res.end();
      })
      .catch((err) => {
        console.error("Error generating Excel file:", err);
        res.status(500).send("Error generating Excel file");
      });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data");
  }
});

app.listen(PORT, () => {
  console.log(`Server is started at PORT no ${PORT}`);
});

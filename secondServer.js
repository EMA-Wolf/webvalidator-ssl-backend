const express = require("express")
const app = express()
const cors = require("cors")
const bodyParser = require("body-parser")
const path = require("path");
const connectDB = require("./config/db")
const siteRoutes = require("./routes/siteRoutes")
const authRoutes = require("./routes/authRoutes")
const sslRoutes = require("./routes/sslRoutes")
const scanRoutes = require("./routes/scanRoutes")
const scheduleRoutes = require("./routes/scheduleRoutes")


require("dotenv").config() 

//Connect to Database
connectDB()

//MiddleWare
app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));


//Routes
app.use("/api/sites",siteRoutes)
app.use("/api/auth",authRoutes)
app.use("/api/ssl",sslRoutes)
app.use("/api/scan",scanRoutes)
app.use("/api/schedule",scheduleRoutes)

app.get("/api",(req,res)=>{
    res.json("success")
})

// app.get("/reset-password/:token", (req, res) => {
//     res.render('resetPassword', { token: req.params.token });
// });

// app.get("/resetSuccess", (req, res) =>{
//     res.render('resetSuccesFull')
// })

const PORT = process.env.PORT||3002
app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`)
})

const express = require("express")
const app = express()
const cors = require("cors")
const bodyParser = require("body-parser")
const connectDB = require("./config/db")
const siteRoutes = require("./routes/siteRoutes")
const authRoutes = require("./routes/authRoutes")
const sslRoutes = require("./routes/sslRoutes")
const scanRoutes = require("./routes/scanRoutes")


require("dotenv").config() 

//Connect to Database
connectDB()

//MiddleWare
app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

// Serve static files
// const path = require('path');
// app.use('/.well-known', express.static(path.join(__dirname, 'public/.well-known')));


//Routes
app.use("/api/sites",siteRoutes)
app.use("/api/auth",authRoutes)
app.use("/api/ssl",sslRoutes)
app.use("/api/scan",scanRoutes)

app.get("/api",(req,res)=>{
    res.json("success")
})

const PORT = process.env.PORT||3002
app.listen(PORT,()=>{
    console.log(`Server running at http://localhost:${PORT}`)
})

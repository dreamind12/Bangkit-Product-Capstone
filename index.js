const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv").config();
const PORT = 8000;
const bodyParser = require('body-parser');
const partnerRouter = require('./routes/partnerRoute');
const roomRouter = require('./routes/roomRoute');
const guideRouter = require('./routes/guideRoute');
const attractRouter = require('./routes/attractRoute');
const userRoute = require('./routes/userRoute');
const placeRouter = require('./routes/placeRoute');

const app = express();
app.use(cors());
app.use(fileUpload());
app.use(cookieParser());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/partner', partnerRouter);
app.use('/room', roomRouter);
app.use('/guide', guideRouter);
app.use('/attract', attractRouter);
app.use('/user', userRoute);
// app.use('/place', placeRouter);

app.listen(PORT, ()=>{
    console.log(`Server Listening on ${PORT}`);
})
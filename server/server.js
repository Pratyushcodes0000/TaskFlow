const express = require('express');
const connectDB = require('./config/db');
const http = require('http');
const cors = require('cors');
//ALL ROUTES
const loginrouter = require('./Router/LoginRoutes');
const AddProjectRoute = require('./Router/AddProjectRoute');
const TaskRoute = require('./Router/TaskRoute');


const app = express();
connectDB();

//Global middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Routes
app.use('/api', loginrouter);
app.use('/api', AddProjectRoute);
app.use('/api',TaskRoute);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

//create http server
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

// Dependencies
require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001; // Default PORT if not set in .env
const { checkRequiredHeaders } = require('./middlewares/checkRequiredHeaders');

// Middleware for parsing JSON data
app.use(bodyParser.json({ limit: '300mb' }));
app.use(bodyParser.urlencoded({ limit: '300mb', extended: true }));

// Setting up socket.io configuration
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Apply global middleware
app.use(checkRequiredHeaders);

// Auth middleware
const { isValidRequestFromClient: tokenValidation } = require('./middlewares/clientRequestValidation');
const { ServerAuthorization: serverValidation } = require('./middlewares/serverAuthorization');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const mysqlRoutes = [
    { path: '/api/user', route: require('./modules/user/route/route.js') }  
];



// Register MongoDB and MySQL routes
mysqlRoutes.forEach(({ path, route }) => app.use(path, tokenValidation, serverValidation, route));


// Default route
app.get('/', (req, res) => res.send('Server is running successfully'));

// Health check route
app.get('/health', (req, res) => res.status(200).json({ message: 'All is Well!' }));

// Error handling for missing routes
app.use('*', (req, res) => res.status(404).json({ error: 'Route Not Found' }));

// Global error handling middleware
// app.use((err, req, res, next) => res.status(500).json({ error: 'Internal Server Error' }));

// Socket.io connection handling
io.on('connection', (socket) => {
    socket.on('comment', (msg) => {
        io.emit("new-comment", msg);
    });
});

exports.io = io;

// Start server and establish MongoDB connection
server.listen(PORT, async () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

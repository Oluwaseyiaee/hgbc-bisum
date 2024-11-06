const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err);
    console.error(err.name, err.message);
    process.exit(1); // 1 stands for uncaught exception
});

const app = require("./app");
const conn = process.env.NODE_ENV==='development' ? process.env.LOCAL_CONN : process.env.GLOBAL_CONN;
mongoose.connect(conn)
    .then(() => {
        console.log("DB connected successfully");
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit if unable to connect to MongoDB
    });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(err);
    console.error(err.name, err.message);
    console.log('UNHANDLED REJECTION! Shutting down...');
    server.close(() => {
        process.exit(1); // 1 stands for uncaught exception
    });
});

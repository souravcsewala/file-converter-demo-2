const mongoose = require("mongoose");

async function connectDB(uri) {
    const mongoUri = uri || process.env.MONGODB_URI;
    const connection = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    
    console.log("Connected to MongoDB host:", connection.connection.host);
    console.log("Connected to MongoDB database:", connection.connection.name);

    return connection;
}

module.exports = { connectDB };

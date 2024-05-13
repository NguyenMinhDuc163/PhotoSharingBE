require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./db/userModel.js');
const Photo = require('./db/photoModel.js');
const SchemaInfo = require('./db/schemaInfo.js');

async function testQueries() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Successfully connected to MongoDB Atlas!");

        // // Query all users
        // const users = await User.find({});
        // console.log('All users:', users);

        // Query all photos
        const photos = await Photo.find({});
        console.log('All photos:', photos);
        //
        // Query SchemaInfo
        // const schemaInfo = await SchemaInfo.find({});
        // console.log('SchemaInfo:', schemaInfo);

    } catch (error) {
        console.log("Error connecting to MongoDB Atlas or querying the database:", error);
    } finally {
        mongoose.disconnect();
    }
}

testQueries().then(r => console.log('Done'));
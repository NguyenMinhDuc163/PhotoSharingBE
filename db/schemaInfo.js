const mongoose = require("mongoose");

/**
 * Create a Mongoose Schema.
 */
const schemaInfo = new mongoose.Schema({
  version: String,
  load_date_time: { type: Date, default: Date.now },
});

/**
 * Create a Mongoose Model.
 */
const SchemaInfo = mongoose.model("SchemaInfo", schemaInfo);

/**
 * Make this available to our application.
 */
module.exports = SchemaInfo;

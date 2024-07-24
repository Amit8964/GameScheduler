// to save the data once update.
const saveData = async (model, data) => {
  try {
    const result = await new model(data).save();
    return result;
  } catch (err) {
    throw err;
  }
};

// getting the multiple records from database
const getData = async (model, query, projection, options) => {
  try {
    const data = await model.find(query, projection, options).exec();
    return data;
  } catch (err) {
    throw err;
  }
};

// show single record
const findOne = async (model, query, projection, options) => {
  try {
    return await model.findOne(query, projection, options).exec();
  } catch (err) {
    throw err;
  }
};

// show reffrenced record
const findOneAndPopulate = async (
  model,
  query,
  projection,
  options,
  collectionOptions
) => {
  try {
    return await model
      .findOne(query, projection, options)
      .populate(collectionOptions)
      .exec();
  } catch (err) {
    throw err;
  }
};

// Update multiple records
const findAndUpdate = async (model, conditions, update, options) => {
  try {
    return await model.findOneAndUpdate(conditions, update, options).exec();
  } catch (err) {
    throw err;
  }
};

const findByIdAndUpdate = async (model, conditions, update, options) => {
  try {
    return await model.findByIdAndUpdate(conditions, update, options).exec();
  } catch (err) {
    throw err;
  }
};

const findByIdAndDelete = async (model, condition) => {
  try {
    return await model.findByIdAndDelete(condition);
  } catch (err) {
    throw err;
  }
};

//update multiple records and return data with reffrenced records
const findAndUpdateWithPopulate = async (
  model,
  conditions,
  update,
  options,
  collectionOptions
) => {
  try {
    return await model
      .findOneAndUpdate(conditions, update, options)
      .populate(collectionOptions)
      .exec();
  } catch (err) {
    throw err;
  }
};

const update = async (model, conditions, update, options) => {
  try {
    return await model.updateMany(conditions, update, options).exec();
  } catch (err) {
    throw err;
  }
};

const remove = async (model, condition) => {
  try {
    return await model.deleteMany(condition).exec();
  } catch (err) {
    throw err;
  }
};

// return reffrenced records
const populateData = async (
  model,
  query,
  projection,
  options,
  collectionOptions
) => {
  try {
    return await model
      .find(query, projection, options)
      .populate(collectionOptions)
      .exec();
  } catch (err) {
    throw err;
  }
};

// return single record with reffrenced documents
const findOnePopulateData = async (
  model,
  query,
  projection,
  options,
  collectionOptions
) => {
  try {
    return await model
      .findOne(query, projection, options)
      .populate(collectionOptions)
      .exec();
  } catch (err) {
    throw err;
  }
};

const count = async (model, condition) => {
  try {
    return await model.countDocuments(condition).exec();
  } catch (err) {
    throw err;
  }
};

// insert single document
const insert = async (model, data, options) => {
  try {
    return await model.collection.insertOne(data, options);
  } catch (err) {
    throw err;
  }
};

// to insert many records
const insertMany = async (model, data, options) => {
  try {
    return await model.collection.insertMany(data, options);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  findOne,
  saveData,
  getData,
  findOneAndPopulate,
  findAndUpdate,
  findAndUpdateWithPopulate,
  update,
  remove,
  populateData,
  findOnePopulateData,
  count,
  insert,
  insertMany,
  findByIdAndUpdate,
  findByIdAndDelete,
};

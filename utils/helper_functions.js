const lodash = require("lodash");

const getUpdatedKey = (oldData, newData) => {
  const data = lodash.uniq([...Object.keys(oldData), ...Object.keys(newData)]);

  for(const key of data){
    if(!lodash.isEqual(oldData[key], newData[key])){
      return key;
    }
  }

  return null;
}

const removeKeys = (obj) => {
  delete obj._id
  delete obj.user
  delete obj.__v
  return obj
}

module.exports = {
  getUpdatedKey,
  removeKeys
}
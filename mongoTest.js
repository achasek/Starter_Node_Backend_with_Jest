// to run the test, run this in the CLI with the actual password
// node mongo.js <password>
// go to MongoDB Atlas and browse collections under the current project

const config = require('./utils/config');
const logger = require('./utils/logger');

const mongoose = require('mongoose');

if (process.argv.length<3) {
  console.log('give password as argument');
  process.exit(1);
}

// .argv is an array of CLI args separated by space, the el with idx[2]
// is the password in the above mentioned CLI to run this test module
// eslint-disable-next-line no-unused-vars
const password = process.argv[2];



mongoose.set('strictQuery',false);
// make sure its test url since we will never test production with this file
mongoose.connect(config.DB_TEST_URL);

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
});

const Blog = mongoose.model('Blog', blogSchema);

// static test of database
// const person = new Person({
//   id: 5,
//   name: 'chuz',
//   number: 9895761375,
// })

// person.save().then(result => {
//   console.log(`person saved! ${person.name} to phonebook`)
//   mongoose.connection.close()
// })

// dynamic testing allows for the addition of new entires via the CLI like
// node mongoTest.js <password> 'test title' 'test author' 'test url' 10
const length = process.argv.length;
if(length > 3) {
  const blog = new Blog({
    title: process.argv[3],
    author: process.argv[4],
    url: process.argv[5],
    likes: process.argv[6]
  });

  // eslint-disable-next-line no-unused-vars
  blog.save().then(result => {
    logger.info(`${blog.title} added`);
    mongoose.connection.close();
  });
} else {
  // result is an array of all documents here
  Blog.find({}).then(result => {
    result.forEach(blog => {
      logger.info(blog);
    });
    mongoose.connection.close();
  });
}
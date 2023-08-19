// this is only for e2e testing with Cypress. We create these API endpoints to give Cypress access to our actual database
const testingRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');

testingRouter.post('/reset', async (request, response) => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  response.status(204).end();
});

module.exports = testingRouter;
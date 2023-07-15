// we began rewriting code in the api_test since most tests required
// inital blogs, populating the db with the blogs, etc
// so this is just to extract that code here in these helper functions

const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'test title 1',
    author: 'test author 1',
    url: 'test.com',
    likes: 10
  },
  {
    title: 'test title 2',
    author: 'test author 2',
    url: 'test2.com',
    likes: 7
  }
]

// creates a mongodb _id that does NOT belong to any document in the db collection
const nonExistingId = async () => {
  const blog = new Blog({
    title: 'willremovethissoon',
    url: 'willremovethissoon'
  })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

// checks the blogs in the db one by one with map function
const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}
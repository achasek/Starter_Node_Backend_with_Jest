const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

// .then version
// blogsRouter.get('/', (request, response) => {
//   Blog
//     .find({})
//     .then(blogs => {
//       response.json(blogs)
//     })
// })

// async await version
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

// .then version
// blogsRouter.post('/', (request, response, next) => {
//   const blog = new Blog(request.body)

//   blog
//     .save()
//     .then(result => {
//       response.status(201).json(result)
//     })
//     .catch(error => {
//       next(error)
//     })
// })

// async await version
// the id of user who created the blog is saved in blog.user
// the id of the new blog created is saved in an array user.blogs
blogsRouter.post('/', middleware.getUserFrom, async (request, response, next) => {
  const body = request.body

  const user = request.user
  if (!user) {
    return response.status(401).json({
      error: 'no user found to post this blog: blog needs user to post'
    })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user.id
  })

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    console.log( 'user after post --->', user)
    response.status(201).json(savedBlog)
  }
  catch(error) {
    next(error)
  }
  // }
})

// .then version
// blogsRouter.get('/:id', (request, response, next) => {
//   Blog
//     .findById(request.params.id)
//     .then(blog => {
//       response.json(blog)
//     })
//     .catch(error => {
//       next(error)
//     })
// })

// async await version
blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if(blog) {
      response.json(blog)
    }
    else {
      response.status(404).send({ error: `blog with id of ${request.params.id} could not be found` })
    }
  }
  catch(error) {
    next(error)
  }
})

// .then version
// blogsRouter.delete('/:id', (request, response, next) => {
//   Blog
//     .findByIdAndRemove(request.params.id)
//     // eslint-disable-next-line no-unused-vars
//     .then(blog => {
//       response.status(204).end()
//     })
//     .catch(error => {
//       next(error)
//     })
// })

// async await version
blogsRouter.delete('/:id', middleware.getUserFrom, async (request, response, next) => {
  const user = request.user

  const blog = await Blog.findById(request.params.id)

  if (!user || !blog) {
    return response.status(401).json({
      error: 'could not find blog or user with that id'
    })
  }

  if ( !blog.user ) {
    return response.status(401).json({
      error: 'could not delete: blog does not have an associated user'
    })
  }
  // remember blog.user is object; not string, because mongoose populate
  if ( blog.user.toString() !== user.id ) {
    return response.status(401).send({ error: 'invalid request: only creator of blog can delete' })
  } else {
    try {
      // since no data is returned by a delete req, you do not need to assign the await keyword
      // to a variable like in other async await functions
      await Blog.findByIdAndRemove(request.params.id)

      response.status(204).end()
    }
    catch(error) {
      next(error)
    }
  }
  // }
})

blogsRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
    .catch(error => {
      next(error)
    })
})

module.exports = blogsRouter
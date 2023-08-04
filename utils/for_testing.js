const reverse = (string) => {
  return string
    .split('')
    .reverse()
    .join('');
};

const average = (array) => {
  const reducer = (sum, item) => {
    return sum + item;
  };

  return array.length === 0
    ? 0
    : array.reduce(reducer, 0) / array.length;
};

const dummyTester = (blogs) => {
  blogs = 1;
  return blogs;
};

const totalLikes = (blogs) => {
  const likes = blogs.map(blog => blog.likes);
  const reducer = (sum, item) => {
    return sum + item;
  };

  return likes.length === 0
    ? 0
    : likes.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
  const likes = blogs.map(blog => blog.likes);

  const findHighestLikes = (bloglikes) => {
    return Math.max(...bloglikes);
  };

  const isHighest =(blog) => {
    return blog.likes === findHighestLikes(likes);
  };

  const highestLikes = blogs.find(isHighest);

  const resultArr = [];

  resultArr.push(highestLikes);

  return likes.length === 0
    ? 'No likes on any blogs yet'
    : resultArr;
};

const mostBlogs = (blogs) => {
  if(blogs.length !== 0) {
    let obj = {};
    // [1,2,3]
    const blogCount = blogs.map(blog => blog.blogs);
    // nothing yet since it isnt invoked
    const findHighestBlogCount = (blogQty) => {
      return Math.max(...blogQty);
    };
    // nothing yet === 3
    const isHighest = (blog) => {
      return blog.blogs === findHighestBlogCount(blogCount);
    };
    // find blog obj whose blogs === 3 => whole object returned
    const highestBlogCount = blogs.find(isHighest);

    obj.author = highestBlogCount.author;
    obj.blogs = highestBlogCount.blogs;

    return obj;
  }
  return "No author has any blogs yet";
};

module.exports = {
  reverse,
  average,
  dummyTester,
  totalLikes,
  favoriteBlog,
  mostBlogs
};
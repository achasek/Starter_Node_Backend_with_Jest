const dummyTester = require('../utils/for_testing').dummyTester;

describe('dummyTester returns', () => {
  test('one', () => {
    const blogs = [];

    const result = dummyTester(blogs);
    expect(result).toBe(1);
  });
});
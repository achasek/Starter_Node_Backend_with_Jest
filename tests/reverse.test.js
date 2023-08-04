const reverse = require('../utils/for_testing').reverse;

describe('reverse of', () => {
  test('a', () => {
    // more code version of this test by assigning output of function being tested to a variable
    const result = reverse('a');

    expect(result).toBe('a');
  });

  test('react', () => {
    const result = reverse('react');

    expect(result).toBe('tcaer');
  });

  test('releveler', () => {
    const result = reverse('releveler');

    expect(result).toBe('releveler');
  });
});
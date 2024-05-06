const {
  buildPixabayBaseUrl,
  contentTypeValid,
  pageNumberValid,
  pixabayIdValid,
  fetchContentById
} = require('../pixabay');
const { IMAGE_TYPE, VIDEO_TYPE } = require('../constants');

describe('buildPixabayBaseUrl', () => {
  test('buildes image base correctly', () =>
    expect(buildPixabayBaseUrl(IMAGE_TYPE)).toBe('https://pixabay.com/api/'));

  test('buildes videos base correctly', () =>
    expect(buildPixabayBaseUrl(VIDEO_TYPE)).toBe(
      'https://pixabay.com/api/videos/'
    ));
});

describe('contentTypeValid', () => {
  test('returns true if content type matches IMAGE_TYPE', () =>
    expect(contentTypeValid(IMAGE_TYPE)).toBe(true));

  test('returns true if content type matches VIDEO_TYPE', () =>
    expect(contentTypeValid(VIDEO_TYPE)).toBe(true));

  test('returns false if content type is not an image or video', () =>
    expect(contentTypeValid('unknown')).toBe(false));
});

describe('pageNumberValid', () => {
  test('returns true if id is an integer', () => {
    // can be either a String or Number type
    expect(pageNumberValid(2342)).toBe(true);
    expect(pageNumberValid('123')).toBe(true);
  });

  // the case where page is not included in the query parameter
  test('returns true if id is undefined', () =>
    expect(pageNumberValid(undefined)).toBe(true));

  test('returns false if id is not an integer', () => {
    expect(pageNumberValid(123.4)).toBe(false);
    expect(pageNumberValid(null)).toBe(false);
  });
});

describe('pixabayIdValid', () => {
  test('returns true if id is an integer', () =>
    expect(pixabayIdValid(2342)).toBe(true));
  expect(pixabayIdValid('123')).toBe(true);

  test('returns false if id is not an integer', () => {
    expect(pixabayIdValid(123.4)).toBe(false);
    expect(pixabayIdValid(null)).toBe(false);
    expect(pixabayIdValid(undefined)).toBe(false);
  });
});

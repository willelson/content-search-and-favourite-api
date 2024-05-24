const Minio = require('minio');
const { Readable } = require('stream');
const { Buffer } = require('buffer');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_HOST,
  port: Number(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD
});

/**
 * Converts browser ReadableStream from fetch response body to stream.Readable.
 * Not optimal as it requires entire file to be loaded into memory...
 *
 * @param {ReadableStream} responseBody - body of the response from fetch request
 * @returns stream.Readable
 */
async function bodyToReadableStream(responseBody) {
  const chunks = [];
  for await (const chunk of responseBody) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  // Create a Readable stream from the buffer
  const readableStream = new Readable();
  // _read is required but can be a no-op
  readableStream._read = () => {};
  readableStream.push(buffer);
  readableStream.push(null);
  return readableStream;
}

/**
 * Downloads content into local memory then uploads it to the minIO CDN bucket.
 *
 * @param {string} contentUrl - url of the content to be stored
 * @param {string} objectName - name of the object inside the bucket
 * @returns {string} - content URL in MinIo CDN
 */
const fetchAndUploadContentToCDN = async (contentUrl, objectName) => {
  const bucketName = process.env.CONTENT_BUCKET_NAME || 'cdn';
  try {
    // Download the image
    const response = await fetch(contentUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch image from ${contentUrl}: ${response.statusText}`
      );
    }
    const contentType = response.headers.get('content-type');
    const contentLength = Number(response.headers.get('content-length'));

    // Convert response body to readable stream
    const readableStream = await bodyToReadableStream(response.body);

    // Upload the image to MinIO
    await minioClient.putObject(
      bucketName,
      objectName,
      readableStream,
      contentLength,
      { 'Content-Type': contentType }
    );
  } catch (err) {
    console.error(`Error: ${err.message}`);
    throw err;
  }
};

/**
 * Builds an object name for an image to be uploaded to the cdn, then downloads that content
 * from pixabay and uploads it to the MinIO bucket. Used to store images and preview images
 * for video content.
 *
 * @param {number} contentId - pixabay id for the content
 * @param {string} contentUrl - pixabay url for the content
 * @returns {string} - url to access content from MinIO bucket
 */
const addToCDN = (contentId, contentType, contentUrl) => {
  const host = process.env.MINIO_CDN_HOST;
  const port = process.env.MINIO_PORT;
  const bucketName = process.env.CONTENT_BUCKET_NAME;
  const objectName = `pixabay-${contentType}-${contentId}.jpg`;

  fetchAndUploadContentToCDN(contentUrl, objectName);

  // URL to access content
  return `http://${host}:${port}/${bucketName}/${objectName}`;
};

/**
 * Makes a bucket publicly accesible so content can be served. Uses a sample AWS policy.
 * https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies.html
 */
const makeBucketPublic = () => {
  const bucketName = process.env.CONTENT_BUCKET_NAME;
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`]
      }
    ]
  };

  minioClient.setBucketPolicy(bucketName, JSON.stringify(policy), (err) => {
    if (err) {
      console.error('Error setting bucket policy:', err);
      throw err;
    }
  });
};

/**
 * Checks if the content bucket exists on the CDN then creates it if not. Also sets the policy so
 * that bucket objects are publicly available. TODO: move this set up to the Dockerfile
 */
const setupCDN = async () => {
  const bucketName = process.env.CONTENT_BUCKET_NAME;
  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName);
    makeBucketPublic(bucketName);
  }
};

module.exports = { addToCDN, setupCDN };

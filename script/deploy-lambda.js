#!/usr/bin/env babel-node

import awsSdk from 'aws-sdk';

const lambda = new awsSdk.Lambda({apiVersion: '2015-03-31', region: process.env.AWS_REGION});

const params = {
  FunctionName: process.env.LAMBDA_FUNCTION_NAME, /* required */
  S3Bucket: process.env.S3_BUCKET,
  S3Key: `lambda_versions/${process.env.CIRCLE_BUILD_NUM}.zip`,
};

lambda.updateFunctionCode(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

/**
 * AWS Lambda Handler für Hono Backend
 * Optimiert für AWS Lambda mit API Gateway
 */

import { handle } from 'hono/aws-lambda';
import app from './backend/hono.js';

// Lambda Handler Export
export const handler = handle(app);

// Health Check für Lambda
export const healthCheck = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      requestId: context.awsRequestId,
      environment: process.env.NODE_ENV || 'production'
    })
  };
};
import awsLambdaFastify from '@fastify/aws-lambda'
import { buildApp } from './src/app.js'

const app = buildApp()
export const handler = awsLambdaFastify(app)

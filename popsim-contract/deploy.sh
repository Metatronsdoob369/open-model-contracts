#!/bin/bash

# Configuration
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="popsim-contract-bridge"
REGION="us-central1"

echo "🚀 Starting deployment of @popsim/contract Bridge Server..."
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"

# Build the container image using Cloud Build
echo "📦 Building container image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# Deploy to Cloud Run
echo "☁️  Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --set-env-vars="NODE_ENV=production"

echo "✅ Deployment complete!"
gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format='value(status.url)'

#!/bin/bash

# Get a list of all AWS regions
regions=$(aws ec2 describe-regions --query 'Regions[*].RegionName' --output text)

# Loop through each region
for region in $regions; do
  echo "Deleting API Gateways in $region..."
  
  # List all API Gateways in the region
  api_gateway_ids=$(aws apigateway get-rest-apis --region $region --query 'items[*].id' --output text)

  # Loop through each API Gateway and delete it with a delay
  for api_gateway_id in $api_gateway_ids; do
    echo "Deleting API Gateway: $api_gateway_id"
    aws apigateway delete-rest-api --region $region --rest-api-id $api_gateway_id
    
    # Introduce a delay of 5 seconds (adjust as needed)
    sleep 1
  done

  echo "Finished deleting API Gateways in $region"
done

echo "All API Gateways deleted in all regions."

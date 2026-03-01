#!/usr/bin/env bash
set -euo pipefail

# Usage:
# ./scripts/create-cloudfront-and-set-backend.sh <ALB_DNS> <ECS_CLUSTER> <ECS_SERVICE> [REGION]
# Example:
# ./scripts/create-cloudfront-and-set-backend.sh farmer-assist-alb-ap-1508245096.ap-south-1.elb.amazonaws.com farmer-assist-cluster-ap farmer-assist-service ap-south-1

ALB_DNS=${1:-}
CLUSTER=${2:-}
SERVICE=${3:-}
REGION=${4:-ap-south-1}

if [ -z "$ALB_DNS" ] || [ -z "$CLUSTER" ] || [ -z "$SERVICE" ]; then
  echo "Usage: $0 <ALB_DNS> <ECS_CLUSTER> <ECS_SERVICE> [REGION]"
  exit 2
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "This script requires jq. Install it and re-run."
  exit 2
fi

echo "Creating CloudFront distribution pointing to ALB: $ALB_DNS"

CF_CFG=$(mktemp /tmp/cf-config.XXXX.json)
cat > "$CF_CFG" <<EOF
{
  "CallerReference": "farmer-assist-$(date +%s)",
  "Comment": "CloudFront for Farmer Assist backend",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "alb-origin",
        "DomainName": "$ALB_DNS",
        "OriginPath": "",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only",
          "OriginSslProtocols": {
            "Quantity": 3,
            "Items": ["TLSv1","TLSv1.1","TLSv1.2"]
          }
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "alb-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": { "Quantity": 2, "Items": ["GET","HEAD"] },
    "ForwardedValues": { "QueryString": false, "Cookies": { "Forward": "none" } },
    "TrustedSigners": { "Enabled": false, "Quantity": 0 }
  },
  "PriceClass": "PriceClass_All",
  "IsIPV6Enabled": true
}
EOF

# Create distribution
resp=$(aws cloudfront create-distribution --distribution-config file://"$CF_CFG")
rm -f "$CF_CFG"

CF_DOMAIN=$(echo "$resp" | jq -r '.Distribution.DomainName')
if [ -z "$CF_DOMAIN" ] || [ "$CF_DOMAIN" = "null" ]; then
  echo "Failed to create CloudFront distribution. Response:"
  echo "$resp"
  exit 1
fi

echo "CloudFront domain created: $CF_DOMAIN"

# Now update ECS task definition to set BACKEND_URL to https://$CF_DOMAIN
echo "Updating ECS task definition in $REGION for cluster $CLUSTER and service $SERVICE"

def_arn=$(aws ecs describe-services --cluster "$CLUSTER" --services "$SERVICE" --region "$REGION" --query 'services[0].taskDefinition' --output text)
if [ -z "$def_arn" ] || [ "$def_arn" = "None" ]; then
  echo "Unable to find current task definition for $SERVICE in cluster $CLUSTER"
  exit 1
fi

echo "Current task definition: $def_arn"

def_json=$(aws ecs describe-task-definition --task-definition "$def_arn" --region "$REGION" --query 'taskDefinition' --output json)

# Remove fields not allowed when registering (status, revision, etc.)
new_def=$(echo "$def_json" | jq 'del(.status,.revision,.taskDefinitionArn,.requiresAttributes,.compatibilities,.registeredAt,.registeredBy)')

# Ensure environment var BACKEND_URL is present/updated for the first container
new_def=$(echo "$new_def" | jq '(.containerDefinitions[0].environment) |= (map(select(.name != "BACKEND_URL")) + [{"name":"BACKEND_URL","value":"https://'"$CF_DOMAIN"'"}])')

# Register new task definition
tmp=$(mktemp /tmp/new-taskdef.XXXX.json)
echo "$new_def" > "$tmp"
register_resp=$(aws ecs register-task-definition --cli-input-json file://"$tmp" --region "$REGION")
rm -f "$tmp"

new_td_arn=$(echo "$register_resp" | jq -r '.taskDefinition.taskDefinitionArn')
if [ -z "$new_td_arn" ] || [ "$new_td_arn" = "null" ]; then
  echo "Failed to register new task definition. Response:"
  echo "$register_resp"
  exit 1
fi

echo "Registered new task definition: $new_td_arn"

# Update service to use new task definition
aws ecs update-service --cluster "$CLUSTER" --service "$SERVICE" --task-definition "$new_td_arn" --force-new-deployment --region "$REGION"

echo "Service update initiated. Service will redeploy with BACKEND_URL=https://$CF_DOMAIN"

echo "$CF_DOMAIN"

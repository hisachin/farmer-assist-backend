# Farmer Assist Backend — Rebuild & Deploy

This README documents how to rebuild the Docker image for the backend and deploy it to AWS (ECR + ECS Fargate with ALB).

Prerequisites
- Docker (with Buildx enabled)
- AWS CLI configured with appropriate credentials and default region
- jq (optional, for parsing JSON in shell)

Important environment variables
- `ACCOUNT_ID` — your AWS account id (e.g. 388531210419)
- `REGION` — target AWS region (e.g. ap-south-1)
- `REPO` — ECR repository name (default: `farmer-assist-backend`)
- `IMAGE_TAG` — image tag to push (default: `latest`)
- `BACKEND_URL` — (production) the ALB DNS to use as backend base URL. Set this in your ECS task definition environment for production.

Quick local build (multi-arch for Fargate)
```bash
# from repo root
docker buildx build --platform linux/amd64 -t farmer-assist-backend:latest .

# optionally test locally
docker run -p 3000:3000 farmer-assist-backend:latest
curl http://localhost:3000/health
```

Push image to ECR (ap-south-1 example)
```bash
export ACCOUNT_ID=388531210419
export REGION=ap-south-1
export REPO=farmer-assist-backend
export IMAGE_TAG=latest

# create repo (if not exists)
aws ecr create-repository --repository-name $REPO --region $REGION || true

# login, tag, push
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
docker tag farmer-assist-backend:$IMAGE_TAG $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:$IMAGE_TAG
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:$IMAGE_TAG
```

Deploy to ECS (summary steps)
- Ensure you have a task definition JSON that references the image URI and includes an environment variable `BACKEND_URL` set to your ALB DNS (e.g. `http://your-alb-dns.ap-south-1.elb.amazonaws.com`).
- Create (or reuse) an ECS cluster and CloudWatch Log Group `/ecs/farmer-assist-backend`.
- Create an ALB + Target Group and a security group allowing port 80 to the ALB and allowing the ALB SG to reach the task container port (3000).
- Register the ECS task definition and create/update the ECS service attached to the target group.

Example: register task definition and update service
```bash
# variables
export CLUSTER=farmer-assist-cluster-ap
export SERVICE=farmer-assist-service
export TASK_DEF_FILE=./ecs-task-def.json
export IMAGE_URI=$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:$IMAGE_TAG

# prepare task definition (set container image and env BACKEND_URL in the JSON)
# register
aws ecs register-task-definition --cli-input-json file://$TASK_DEF_FILE --region $REGION

# update service to use new task definition (or create service if first time)
aws ecs update-service --cluster $CLUSTER --service $SERVICE --force-new-deployment --region $REGION || \
aws ecs create-service --cluster $CLUSTER --service-name $SERVICE --task-definition farmer-assist-task --desired-count 1 --launch-type FARGATE --network-configuration "awsvpcConfiguration={subnets=[<subnet-ids>],securityGroups=[<ecs-sg-id>],assignPublicIp=ENABLED}" --load-balancers "targetGroupArn=<tg-arn>,containerName=farmer-assist-backend,containerPort=3000" --region $REGION
```

Notes about `BACKEND_URL`
- The code reads `BACKEND_URL` via `config.server.BASE_URL` when `process.env.BACKEND_URL` is set.
- In production, set `BACKEND_URL` in the ECS task definition `containerDefinitions[].environment` to the ALB DNS (prefixed with `http://` or `https://` depending on TLS setup).

Use CloudFront for HTTPS (optional)
---------------------------------
- You can front the ALB with CloudFront to get HTTPS (viewer) without needing a custom domain certificate.
- I added a helper script `scripts/create-cloudfront-and-set-backend.sh` that:
	- Creates a CloudFront distribution with your ALB as the origin.
	- Registers a new ECS task definition with `BACKEND_URL` set to `https://<cloudfront-domain>` and forces a service redeploy.

Usage example:
```bash
# create CF distribution and set BACKEND_URL on ECS service
./scripts/create-cloudfront-and-set-backend.sh <ALB_DNS> <ECS_CLUSTER> <ECS_SERVICE> [REGION]

# Example
./scripts/create-cloudfront-and-set-backend.sh \
	farmer-assist-alb-ap-1508245096.ap-south-1.elb.amazonaws.com \
	farmer-assist-cluster-ap farmer-assist-service ap-south-1
```

Notes:
- The script requires `jq` and the AWS CLI configured with permissions to create CloudFront distributions and manage ECS task definitions/services.
- CloudFront distributions can take several minutes to deploy — the script will return the CloudFront domain and start the ECS service redeploy immediately.
- If you want to use a custom domain with ACM, request a certificate in `us-east-1` and update the CloudFront distribution accordingly (the script does not automate the ACM/custom-domain steps).

Troubleshooting
- If ECS tasks stop immediately, check CloudWatch Logs (`/ecs/farmer-assist-backend`) for errors.
- If ALB health checks fail, ensure `/health` responds 200 and security groups allow traffic between ALB and tasks.
- On Apple Silicon (M1/M2), always build for `linux/amd64` for Fargate: `--platform linux/amd64`.

Contact
- For further automation I can add a GitHub Actions workflow to build/push and optionally update ECS automatically.

Resource	URL
CloudFront (HTTPS)	https://d193g30q9y2nj2.cloudfront.net
ALB (HTTP)	http://farmer-assist-alb-ap-1508245096.ap-south-1.elb.amazonaws.com
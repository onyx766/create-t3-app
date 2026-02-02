# Create T3 App AWS CDK Starter Kit

A production-ready AWS CDK infrastructure starter kit for deploying [create.t3.app](https://create.t3.gg/) (T3 Stack) applications to AWS. Deploy your full-stack app with a single command: `npx cdk deploy`.

**GitHub:** https://github.com/lifeike/create-t3-aws-cdk

**Maintained by:** [Feeco](https://github.com/lifeike)

## What Does This Project Do?

This project provides Infrastructure as Code (IaC) using AWS CDK to deploy your T3 Stack application with:

- **Containerized Deployment**: Runs your Next.js app on ECS Fargate with auto-scaling
- **Managed Database**: PostgreSQL on RDS with automated backups and encryption
- **CI/CD Pipeline**: Automated deployments via CodePipeline when you push to your repository
- **HTTPS & DNS**: SSL certificates and Route53 DNS configuration
- **Cost Optimized**: Uses ARM-based instances (t4g family) and right-sized resources for development/small production workloads

## Prerequisites

Before using this project, ensure you have:

### Tools
- [Node.js](https://nodejs.org/) (v18 or later)
- [AWS CLI](https://aws.amazon.com/cli/) (v2)
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/latest/guide/cli.html) (`npm install -g aws-cdk`)
- [Docker](https://www.docker.com/) (for building container images)

### AWS Setup
- An AWS account with appropriate permissions
- AWS CLI configured with credentials (`aws configure`)
- A Route53 hosted zone for your domain (if using custom domain)
- CDK bootstrapped in your account (`cdk bootstrap aws://ACCOUNT-ID/REGION`)

### Your T3 App
- A T3 Stack application created with `create-t3-app`
- A `Dockerfile` in your app's root directory

## How to Use This Project

### 1. Clone and Install

Clone this project into the root of your T3 app directory (the CDK builds Docker from the parent folder):

```bash
cd your-t3-app
git clone https://github.com/lifeike/create-t3-aws-cdk.git cdk
cd cdk
npm install
```

Your directory structure should look like:

```
your-t3-app/
├── src/
├── public/
├── Dockerfile
├── package.json
└── cdk/              <-- this project
    ├── bin/
    ├── lib/
    └── package.json
```

### 2. Configure Your Settings

Update the following files with your configuration:

**`lib/stacks/service-stack.ts`**
- Update `domainName` to your domain
- Update the Route53 hosted zone lookup to your domain

**`lib/constructs/compute.ts`**
- Replace placeholder secrets with your actual values or move to AWS Secrets Manager:
  - `AUTH_SECRET`: Generate with `openssl rand -base64 32`
  - `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`: From GitHub OAuth App settings
  - `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET`: From Discord Developer Portal
- Update `AUTH_URL` to your domain

**`bin/cdk.ts`**
- Update `codecommitRepoName` to your repository name

### 3. Deploy

```bash
# Synthesize CloudFormation template (optional, for review)
npx cdk synth

# Deploy the infrastructure
npx cdk deploy
```

### 4. Set Up CI/CD (Optional)

Push your T3 app to AWS CodeCommit to enable automated deployments:

```bash
git remote add codecommit https://git-codecommit.us-east-1.amazonaws.com/v1/repos/your-repo
git push codecommit main
```

## Resources Created

This CDK stack creates the following AWS resources:

| Resource | Service | Description |
|----------|---------|-------------|
| VPC | Amazon VPC | 2 AZs with public, private, and isolated subnets |
| NAT Instance | EC2 (t4g.nano) | Cost-effective NAT for private subnet egress |
| ECS Cluster | Amazon ECS | Container orchestration cluster |
| Fargate Service | ECS Fargate | Serverless container runtime (256 CPU, 512MB RAM) |
| Load Balancer | ALB | Application Load Balancer with HTTPS |
| Database | RDS PostgreSQL | PostgreSQL 16.3 on t4g.micro (20-100GB GP3) |
| SSL Certificate | ACM | Managed SSL/TLS certificate |
| DNS Record | Route53 | A record pointing to the load balancer |
| CI/CD Pipeline | CodePipeline | Automated build and deployment pipeline |
| Build Project | CodeBuild | Docker image builds with layer caching |
| Logs | CloudWatch | Application logs with 7-day retention |

### Estimated Monthly Cost

For a minimal deployment (1 Fargate task, t4g.micro RDS):
- ~$15-30/month (varies by region and usage)

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run watch` | Watch for changes and compile |
| `npm run test` | Run Jest unit tests |
| `npx cdk synth` | Generate CloudFormation template |
| `npx cdk diff` | Compare deployed stack with current state |
| `npx cdk deploy` | Deploy stack to AWS |
| `npx cdk destroy` | Remove all resources |

## Contributing

Contributions are welcome! Feel free to:

- Fork this repository
- Create a feature branch (`git checkout -b feature/amazing-feature`)
- Commit your changes (`git commit -m 'Add amazing feature'`)
- Push to the branch (`git push origin feature/amazing-feature`)
- Open a Pull Request

### Ideas for Contributions

- Add support for other databases (MySQL, Aurora)
- Add Redis/ElastiCache for caching
- Add CloudFront CDN configuration
- Add monitoring and alerting (CloudWatch Alarms, SNS)
- Add staging/production environment separation
- Improve documentation

## License

MIT

## Acknowledgments

- [create.t3.gg](https://create.t3.gg/) - The T3 Stack
- [AWS CDK](https://aws.amazon.com/cdk/) - Infrastructure as Code

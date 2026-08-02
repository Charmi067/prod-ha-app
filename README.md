# Production-Ready Highly Available Web Infrastructure with Automated DR

A production-style AWS infrastructure project featuring a multi-tier VPC, auto-scaling web tier behind a load balancer, a managed PostgreSQL database, automated CI/CD deployment, and disaster recovery via automated backups.

![Architecture Diagram](screenshots/architecture-diagram.png)

## Overview

This project deploys a highly available Node.js/Express web application on AWS using a secure, multi-AZ network design. It demonstrates core DevOps/Cloud engineering practices: network isolation, least-privilege security, auto scaling, managed databases, CI/CD automation, and backup/recovery planning.

**Live demo flow:** ALB DNS → Auto Scaling Group (2 AZs) → Express app → RDS PostgreSQL

## Architecture

- **Network:** Custom VPC (`10.0.0.0/24`) with 6 subnets across 2 Availability Zones — public (ALB, NAT Gateway), app-private (EC2/ASG), and DB-private (RDS)
- **Security:** Chained least-privilege security groups — `Internet → ALB → App → RDS`, with SSH access scoped to a Bastion SG
- **Compute:** Auto Scaling Group (2–4 instances) behind an Application Load Balancer, target-tracking scaling on CPU utilization
- **Access:** AWS Systems Manager Session Manager (no bastion host, no exposed SSH, no SSH key management)
- **Database:** RDS PostgreSQL, automated backups with 7-day retention
- **CI/CD:** GitHub Actions triggers on push to `main`, deploys to all running instances via AWS SSM `send-command`
- **Disaster Recovery:** AWS Backup plan for EC2, automated RDS backups, tested restore workflow

## Tech Stack

| Category | Tools |
|---|---|
| Cloud | AWS (VPC, EC2, ALB, ASG, RDS, IAM, SSM, AWS Backup) |
| App | Node.js, Express |
| Database | PostgreSQL (Amazon RDS) |
| CI/CD | GitHub Actions |
| IaC/Scripting | AWS CLI, EC2 user-data |

## Key Design Decisions

- **Multi-tier subnet isolation** — public, app, and DB tiers sit in separate subnets so the database is never directly reachable from the internet, even indirectly.
- **Chained security groups** — each tier only accepts traffic from the tier directly above it, not from broad IP ranges. This is enforced at the security group level, not just documentation.
- **Session Manager over a Bastion Host** — avoids maintaining an extra EC2 instance, distributing SSH keys, or exposing port 22 to the internet. Access is controlled entirely through IAM.
- **Single-AZ RDS** — Multi-AZ was not available under the AWS Free Tier template used for this project; in a production deployment this would be enabled for automatic database failover.
- **CI/CD via SSM instead of a full deployment tool** — keeps the pipeline lightweight: GitHub Actions calls AWS SSM to run a `git pull` + restart on every instance in the Auto Scaling Group on every push to `main`.

## Deployment Summary

1. Provision VPC, subnets, IGW, NAT Gateway, and route tables
2. Create chained security groups (Bastion, ALB, App, RDS)
3. Create IAM role with SSM permissions, attach via Launch Template
4. Create Launch Template, Target Group, Application Load Balancer, Auto Scaling Group
5. Provision RDS PostgreSQL in a dedicated DB subnet group
6. Connect the app to RDS via environment variables
7. Set up GitHub Actions + AWS SSM for automated deployment on push
8. Configure AWS Backup plan for EC2 + verify RDS automated backups

## Screenshots

See the [`screenshots/`](./screenshots) folder for supporting evidence of the working system.

## Future Improvements

- Move DB credentials to AWS Secrets Manager instead of user-data environment variables
- Enable Multi-AZ RDS for automatic database failover
- Add HTTPS via ACM certificate on the ALB
- Add centralized logging (CloudWatch Logs) for the application tier

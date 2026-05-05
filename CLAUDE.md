# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpsPulse is a cloud-based observability platform for real-time monitoring of server and web service health. The system consists of three main components:

- **Backend** (Go): Continuously scans servers and exposes performance analytics and system management via a web panel
- **Frontend**: Web dashboard for detailed performance analytics
- **Mobile**: Sends push notifications when system errors occur, enabling remote intervention from mobile devices
- **Infrastructure**: Terraform, Kubernetes, Docker
- **CI/CD**: GitHub Actions

> Note: This repository is in its early stages. Only a README.md exists currently. Commands below are intended conventions as code is added.

## Expected Commands

As the codebase is built out, follow these conventions:

### Backend (Go)
```bash
go mod tidy           # Install dependencies
go build ./...        # Build all packages
go test ./...         # Run all tests
go test ./... -run TestName  # Run a single test
go vet ./...          # Static analysis
golangci-lint run     # Linting (if configured)
```

### Infrastructure
```bash
terraform init        # Initialize Terraform
terraform plan        # Preview infrastructure changes
terraform apply       # Apply infrastructure changes
```

### Docker / Kubernetes
```bash
docker compose up -d  # Run services locally
kubectl apply -f k8s/ # Deploy to Kubernetes
```

## Architecture

### Backend (Go)
The Go backend is the core monitoring engine. It is expected to:
- Poll/ping registered servers and web service endpoints on a schedule
- Store health metrics and historical data
- Serve a REST or gRPC API consumed by the web dashboard and mobile app
- Trigger alerts (push notifications) when services go down or breach thresholds

### Frontend (Web Dashboard)
Consumes the backend API to display:
- Real-time server health status
- Performance analytics and historical charts
- System management controls

### Mobile App
Receives push notifications from the backend alert system when errors are detected, enabling engineers to take remote action.

### Infrastructure
- **Docker**: Containerizes backend and supporting services
- **Kubernetes**: Orchestrates container deployment
- **Terraform**: Provisions cloud infrastructure
- **GitHub Actions**: CI/CD pipeline for automated builds, tests, and deployments

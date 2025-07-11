# Kubernetes Setup

Use the provided Helm chart to deploy all components:

- FastAPI backend
- PostgreSQL
- Redis

Install with:

```bash
helm install luma helm/luma
```

Expose the service using port-forward or ingress. The chart is suitable for local Minikube clusters.

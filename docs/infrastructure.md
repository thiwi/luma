# Kubernetes Setup

Use the provided Helm chart to deploy all components:

- FastAPI backend
- React frontend served by Nginx
- PostgreSQL
- Redis

Install with:

```bash
helm install luma helm/luma
```

Expose the service using port-forward or ingress. For local development run:

```bash
kubectl port-forward svc/luma-frontend 8080:80
```

The chart is suitable for local Minikube clusters.

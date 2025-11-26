# Troubleshooting Guide

Common issues and solutions for the Quote App deployment.

---

## Table of Contents

- [Application Issues](#application-issues)
- [Docker Issues](#docker-issues)
- [Kubernetes Issues](#kubernetes-issues)
- [Monitoring Issues](#monitoring-issues)
- [Networking Issues](#networking-issues)
- [Performance Issues](#performance-issues)
- [CI/CD Issues](#cicd-issues)

---

## Application Issues

### Issue: Application Won't Start

**Symptoms:**
- Process crashes immediately
- Error: "Cannot find module"

**Solutions:**

1. **Check Node.js version:**
```bash
   node --version
   # Should be v18.x.x or higher
```

2. **Reinstall dependencies:**
```bash
   rm -rf node_modules package-lock.json
   npm install
```

3. **Check environment variables:**
```bash
   cat .env
   # Ensure PORT and NODE_ENV are set
```

4. **Check for port conflicts:**
```bash
   sudo lsof -i :3000
   # Kill conflicting process
   sudo kill -9 <PID>
```

---

### Issue: Tests Failing

**Symptoms:**
- `npm test` returns errors
- Coverage below threshold

**Solutions:**

1. **Run tests in verbose mode:**
```bash
   npm test -- --verbose
```

2. **Check test dependencies:**
```bash
   npm install --save-dev jest supertest
```

3. **Clear Jest cache:**
```bash
   npm test -- --clearCache
```

4. **Check if app.js exports correctly:**
```javascript
   // At end of src/app.js
   module.exports = app;
```

---

### Issue: Metrics Not Showing

**Symptoms:**
- `/metrics` endpoint returns 404
- Prometheus can't scrape metrics

**Solutions:**

1. **Check prom-client is installed:**
```bash
   npm list prom-client
```

2. **Verify metrics endpoint:**
```bash
   curl http://localhost:3000/metrics
```

3. **Check app.js has metrics code:**
```javascript
   const promClient = require('prom-client');
   // ... metrics setup
   app.get('/metrics', async (req, res) => {
     res.send(await register.metrics());
   });
```

---

## Docker Issues

### Issue: Image Build Fails

**Symptoms:**
- `docker build` exits with error
- "npm install" fails during build

**Solutions:**

1. **Clear Docker cache:**
```bash
   docker builder prune
   docker build --no-cache -t quote-app .
```

2. **Check Dockerfile syntax:**
```bash
   docker build -t quote-app . 2>&1 | grep -i error
```

3. **Verify .dockerignore:**
```bash
   cat .dockerignore
   # Should exclude node_modules, .git, etc.
```

4. **Check disk space:**
```bash
   df -h
   docker system df
```

---

### Issue: Container Exits Immediately

**Symptoms:**
- Container starts then stops
- `docker ps` doesn't show container

**Solutions:**

1. **Check container logs:**
```bash
   docker logs quote-app
```

2. **Run interactively to debug:**
```bash
   docker run -it quote-app sh
   # Then manually run: node src/app.js
```

3. **Check health check:**
```bash
   docker inspect quote-app | grep -A 10 Health
```

4. **Verify port is exposed:**
```bash
   docker inspect quote-app | grep -i exposedports
```

---

### Issue: Can't Access Container from Host

**Symptoms:**
- `curl http://localhost:3000` fails
- Connection refused

**Solutions:**

1. **Check port mapping:**
```bash
   docker ps
   # Look for 0.0.0.0:3000->3000/tcp
```

2. **Check container is running:**
```bash
   docker ps | grep quote-app
```

3. **Test from inside container:**
```bash
   docker exec -it quote-app sh
   wget -qO- http://localhost:3000/health
```

4. **Check firewall:**
```bash
   sudo ufw status
   # Allow port if needed:
   sudo ufw allow 3000/tcp
```

---

## Kubernetes Issues

### Issue: Pods Not Starting

**Symptoms:**
- Pod status: Pending, CrashLoopBackOff, or ImagePullBackOff
- `kubectl get pods` shows not ready

**Solutions:**

1. **Check pod status:**
```bash
   kubectl describe pod -n quote-app <pod-name>
   # Look at Events section
```

2. **ImagePullBackOff - Image not found:**
```bash
   # Verify image exists
   docker pull adityajareda/quote-app:latest
   
   # Check deployment image name
   kubectl get deployment quote-app-deployment -n quote-app -o yaml | grep image:
```

3. **CrashLoopBackOff - Application crashing:**
```bash
   # Check logs
   kubectl logs -n quote-app <pod-name>
   
   # Check previous logs
   kubectl logs -n quote-app <pod-name> --previous
```

4. **Pending - Resource constraints:**
```bash
   # Check node resources
   kubectl describe nodes
   
   # Check resource requests
   kubectl describe deployment quote-app-deployment -n quote-app
```

---

### Issue: Service Not Accessible

**Symptoms:**
- `minikube service` command fails
- Can't curl service URL

**Solutions:**

1. **Check service exists:**
```bash
   kubectl get svc -n quote-app
```

2. **Check endpoints:**
```bash
   kubectl get endpoints -n quote-app
   # Should show pod IPs
```

3. **Check service selector matches pods:**
```bash
   # Service selector
   kubectl get svc quote-app-service -n quote-app -o yaml | grep -A 2 selector
   
   # Pod labels
   kubectl get pods -n quote-app --show-labels
```

4. **Test from inside cluster:**
```bash
   kubectl run test-pod --rm -it --image=busybox -n quote-app -- sh
   wget -qO- http://quote-app-service/health
```

---

### Issue: HPA Not Scaling

**Symptoms:**
- Pods don't scale under load
- HPA shows `<unknown>` for metrics

**Solutions:**

1. **Check metrics-server:**
```bash
   kubectl get pods -n kube-system | grep metrics-server
   
   # If not running:
   minikube addons enable metrics-server
```

2. **Verify resource requests are set:**
```bash
   kubectl describe deployment quote-app-deployment -n quote-app | grep -A 5 "Requests:"
   # Must have cpu and memory requests
```

3. **Check HPA status:**
```bash
   kubectl describe hpa quote-app-hpa -n quote-app
   # Look for error messages
```

4. **Wait for metrics to populate:**
```bash
   # Metrics take 60-90 seconds to appear
   kubectl top pods -n quote-app
```

---

### Issue: Rolling Update Fails

**Symptoms:**
- New pods don't start
- Old pods don't terminate

**Solutions:**

1. **Check rollout status:**
```bash
   kubectl rollout status deployment/quote-app-deployment -n quote-app
```

2. **View rollout history:**
```bash
   kubectl rollout history deployment/quote-app-deployment -n quote-app
```

3. **Rollback if needed:**
```bash
   kubectl rollout undo deployment/quote-app-deployment -n quote-app
```

4. **Check new pod logs:**
```bash
   kubectl logs -n quote-app <new-pod-name>
```

---

## Monitoring Issues

### Issue: Prometheus Not Scraping Metrics

**Symptoms:**
- Targets show "Down" in Prometheus
- No metrics in Grafana

**Solutions:**

1. **Check Prometheus targets:**
```bash
   kubectl port-forward -n monitoring svc/prometheus-server 9090:80
   # Visit: http://localhost:9090/targets
```

2. **Verify scrape config:**
```bash
   kubectl get configmap -n monitoring prometheus-server -o yaml | grep -A 20 scrape_configs
```

3. **Check pod labels:**
```bash
   kubectl get pods -n quote-app --show-labels
   # Should have app=quote-app label
```

4. **Test metrics endpoint:**
```bash
   kubectl port-forward -n quote-app svc/quote-app-service 8080:80
   curl http://localhost:8080/metrics
```

---

### Issue: Grafana Dashboard Shows No Data

**Symptoms:**
- Panels show "No data"
- Queries return empty results

**Solutions:**

1. **Check Prometheus datasource:**
```bash
   # In Grafana: Configuration → Data Sources → Prometheus
   # Click "Save & Test"
```

2. **Verify Prometheus URL:**
```
   http://prometheus-server.monitoring.svc.cluster.local
```

3. **Test query in Prometheus first:**
```bash
   # In Prometheus: http://localhost:9090
   # Try query: up{job="quote-app"}
```

4. **Generate metrics:**
```bash
   # Create some traffic
   for i in {1..100}; do
     curl $(minikube service quote-app-service -n quote-app --url)/api/quotes/random
   done
```

---

### Issue: Grafana Pod CrashLoopBackOff

**Symptoms:**
- Grafana pod won't start
- Init container fails

**Solutions:**

1. **Check pod logs:**
```bash
   kubectl logs -n monitoring <grafana-pod> --all-containers
```

2. **Disable persistence:**
```bash
   # Edit grafana-values.yaml
   persistence:
     enabled: false
   
   # Reinstall
   helm uninstall grafana -n monitoring
   helm install grafana grafana/grafana -n monitoring --values monitoring/grafana-values-simple.yaml
```

3. **Check PVC status:**
```bash
   kubectl get pvc -n monitoring
   # If Pending, storage provisioner may be missing
```

---

## Networking Issues

### Issue: Can't Access from Windows Browser

**Symptoms:**
- Port forwarding doesn't work from Windows
- VM IP not accessible

**Solutions:**

1. **Use --address 0.0.0.0:**
```bash
   kubectl port-forward --address 0.0.0.0 -n quote-app svc/quote-app-service 8080:80
```

2. **Check VM IP:**
```bash
   ip addr show | grep inet
```

3. **Check firewall:**
```bash
   sudo ufw status
   sudo ufw allow 8080/tcp
```

4. **Use Minikube tunnel:**
```bash
   sudo minikube tunnel
   # Keep this running in a separate terminal
```

---

### Issue: Minikube IP Not Accessible

**Symptoms:**
- `minikube ip` returns IP but not reachable
- NodePort services don't work

**Solutions:**

1. **Check Minikube status:**
```bash
   minikube status
```

2. **Restart Minikube:**
```bash
   minikube stop
   minikube start
```

3. **Use port-forward instead:**
```bash
   kubectl port-forward -n quote-app svc/quote-app-service 8080:80
```

---

## Performance Issues

### Issue: High Memory Usage

**Symptoms:**
- Pods being OOMKilled
- Memory limit reached

**Solutions:**

1. **Check current memory usage:**
```bash
   kubectl top pods -n quote-app
```

2. **Increase memory limits:**
```yaml
   # In k8s/deployment.yaml
   resources:
     limits:
       memory: "512Mi"  # Increase from 256Mi
```

3. **Check for memory leaks:**
```bash
   kubectl logs -n quote-app <pod-name> | grep -i "out of memory"
```

---

### Issue: Slow Response Times

**Symptoms:**
- API responses take > 1 second
- High latency in metrics

**Solutions:**

1. **Check CPU usage:**
```bash
   kubectl top pods -n quote-app
```

2. **Scale up replicas:**
```bash
   kubectl scale deployment quote-app-deployment -n quote-app --replicas=5
```

3. **Check network latency:**
```bash
   kubectl exec -it -n quote-app <pod-name> -- sh
   time wget -qO- http://quote-app-service/health
```

---

## CI/CD Issues

### Issue: GitHub Actions Build Fails

**Symptoms:**
- Workflow shows red X
- Tests fail in CI

**Solutions:**

1. **Check workflow logs:**
```
   Go to: GitHub → Actions → Click failed workflow
```

2. **Run tests locally:**
```bash
   npm test
   # Should pass locally before pushing
```

3. **Check secrets:**
```
   GitHub → Settings → Secrets and variables → Actions
   # Ensure DOCKERHUB_USERNAME and DOCKERHUB_TOKEN exist
```

---

### Issue: Docker Push Fails

**Symptoms:**
- "unauthorized" or "denied" errors
- Image not appearing on Docker Hub

**Solutions:**

1. **Check Docker Hub credentials:**
```bash
   # In GitHub repository secrets
   # Verify DOCKERHUB_TOKEN is valid
```

2. **Regenerate Docker Hub token:**
```
   Docker Hub → Account Settings → Security → New Access Token
   # Update GitHub secret
```

3. **Check repository permissions:**
```
   # Verify token has Read, Write, Delete permissions
```

---

## General Debugging Commands

### Application
```bash
# Check application logs
npm start 2>&1 | tee app.log

# Debug mode
NODE_ENV=development DEBUG=* npm start
```

### Docker
```bash
# Inspect container
docker inspect quote-app

# Execute shell in container
docker exec -it quote-app sh

# Check container processes
docker top quote-app
```

### Kubernetes
```bash
# Describe resource
kubectl describe <resource> <name> -n quote-app

# Get events
kubectl get events -n quote-app --sort-by='.lastTimestamp'

# Check resource usage
kubectl top nodes
kubectl top pods -n quote-app

# Port forward for debugging
kubectl port-forward -n quote-app <pod-name> 8080:3000
```

---

## Getting Help

If you're still experiencing issues:

1. **Check logs thoroughly**
2. **Search GitHub issues**: https://github.com/AdityaJareda/quote-app-devops/issues
3. **Create a new issue** with:
   - Clear description of the problem
   - Steps to reproduce
   - Relevant logs and error messages
   - Environment details (OS, versions)
4. **Contact via LinkedIn**: https://www.linkedin.com/in/adityajareda

---

## Useful Commands Reference
```bash
# Quick health check
curl http://localhost:3000/health && echo "OK" || echo "FAILED"

# View all resources
kubectl get all --all-namespaces | grep quote

# Restart everything
kubectl rollout restart deployment --all -n quote-app

# Clean slate
kubectl delete namespace quote-app
kubectl apply -f k8s/
```

---

For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

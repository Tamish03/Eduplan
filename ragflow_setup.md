# RAGFlow Configuration

## Environment Variables
- [ ] `RAGFLOW_IMAGE`: infiniflow/ragflow:v0.16.0
- [ ] `POSTGRES_PASSWORD`: infiniflow
- [ ] `MINIO_PASSWORD`: infiniflow
- [ ] `SVR_HTTP_PORT`: 9380

## Docker Compose
- [ ] Ensure `vm.max_map_count` is set for Elasticsearch (WSL2 requirement)
- [ ] Check port conflicts (80, 443, 9380)

## Next Steps
- [ ] Wait for Docker Desktop to be ready
- [ ] Run `docker compose up -d`
- [ ] Verify access at `http://localhost:9380`

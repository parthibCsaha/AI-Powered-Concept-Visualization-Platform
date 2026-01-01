# Securing Credentials - Setup Guide

## Problem Fixed ✅
Your hardcoded credentials (database password, JWT secret, Google OAuth2 credentials) have been removed from version control.

## What Changed

### 1. **application.properties** 
- Replaced all hardcoded secrets with environment variable placeholders
- Format: `${VARIABLE_NAME:default_value}`
- Example: `spring.datasource.password=${DB_PASSWORD}`

### 2. **application-example.properties** (NEW)
- Template showing the structure of all required properties
- Safe to commit to GitHub
- Share with team as documentation of what environment variables are needed

### 3. **.env.example** (NEW)
- Template for local `.env` file
- Shows all required environment variables
- Safe to commit to GitHub
- Developers copy this to `.env` and fill in their actual values

### 4. **.gitignore** (UPDATED)
- Added `.env` - prevents accidental commits of local secrets
- Added `application.properties` - prevents accidental commits
- Added `application-*.properties` with exception for `-example.properties`

## How to Use Locally

### Setup Development Environment

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your actual values:**
   ```bash
   nano .env
   # or use your editor of choice
   ```
   
   ```
   DB_PASSWORD=your_actual_password
   JWT_SECRET=your_secret_key
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

3. **Load environment variables before running:**
   ```bash
   # Load .env file and run
   export $(cat .env | xargs)
   mvn spring-boot:run
   ```
   
   Or use a Spring Boot profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
   ```

## How to Use in Docker

### Option 1: Using Docker Environment Variables
```bash
docker run \
  -e DB_URL="jdbc:postgresql://db:5432/conceptviz" \
  -e DB_USERNAME="postgres" \
  -e DB_PASSWORD="your_password" \
  -e JWT_SECRET="your_secret" \
  -e GOOGLE_CLIENT_ID="your_client_id" \
  -e GOOGLE_CLIENT_SECRET="your_client_secret" \
  your-image:latest
```

### Option 2: Using Docker Compose (Recommended)
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    environment:
      - DB_URL=jdbc:postgresql://postgres:5432/conceptviz
      - DB_USERNAME=postgres
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - OLLAMA_BASE_URL=http://ollama:11434
    ports:
      - "8080:8080"
    depends_on:
      - postgres
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: conceptviz
    volumes:
      - postgres_data:/var/lib/postgresql/data
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
volumes:
  postgres_data:
```

Create `.env` from `.env.example`:
```bash
cp .env.example .env
# Edit .env with your actual values
```

Run:
```bash
docker-compose up
```

## How to Use in CI/CD (GitHub Actions, GitLab CI, etc.)

### GitHub Actions Example
```yaml
name: Build and Push Docker Image

on: [push]

env:
  REGISTRY: ghcr.io

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and Push Docker Image
        run: |
          docker build -t ${{ env.REGISTRY }}/my-app:latest .
          docker push ${{ env.REGISTRY }}/my-app:latest
      
      - name: Deploy
        run: |
          docker run \
            -e DB_PASSWORD=${{ secrets.DB_PASSWORD }} \
            -e JWT_SECRET=${{ secrets.JWT_SECRET }} \
            -e GOOGLE_CLIENT_ID=${{ secrets.GOOGLE_CLIENT_ID }} \
            -e GOOGLE_CLIENT_SECRET=${{ secrets.GOOGLE_CLIENT_SECRET }} \
            ${{ env.REGISTRY }}/my-app:latest
```

**Store secrets in GitHub:**
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret (DB_PASSWORD, JWT_SECRET, etc.)

## Environment Variable Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DB_URL` | PostgreSQL connection | `jdbc:postgresql://localhost:5432/conceptviz` |
| `DB_USERNAME` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `your_secure_password` |
| `JWT_SECRET` | JWT token signing key | Generate: `openssl rand -base64 32` |
| `JWT_EXPIRATION` | Token expiry in ms | `86400000` (24 hours) |
| `GOOGLE_CLIENT_ID` | OAuth2 client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth2 secret | From Google Cloud Console |
| `OLLAMA_BASE_URL` | Ollama API endpoint | `http://localhost:11434` |
| `OLLAMA_MODEL` | Model to use | `qwen2.5-coder:7b` |
| `CORS_ALLOWED_ORIGINS` | Frontend URL | `http://localhost:5173` |

## Security Best Practices

✅ **DO:**
- Keep `.env` and `application.properties` in `.gitignore`
- Use strong, randomly generated secrets
- Rotate secrets regularly
- Store secrets in your CI/CD platform's secret manager
- Use different secrets for dev, staging, and production
- Use environment variables for all sensitive data

❌ **DON'T:**
- Commit `.env` files to GitHub
- Share `.env` files via email or Slack
- Use weak or predictable secrets
- Hardcode credentials in code
- Use the same secret across environments
- Commit secrets even if you remove them later (git history)

## If You Already Committed Secrets

⚠️ **Important:** If secrets were already pushed to GitHub, they're compromised:

1. **Rotate all credentials immediately**
2. **Clean git history** (optional but recommended):
   ```bash
   git filter-branch --tree-filter 'rm -f application.properties' HEAD
   git push --force
   ```
   Or use `git-filter-repo`:
   ```bash
   git filter-repo --path application.properties
   ```
3. Update all credentials in dependent systems

## File Structure After Setup

```
ConceptVizBackend/
├── .env.example                    (Safe - commit this)
├── .env                            (Unsafe - gitignored)
├── .gitignore                      (Updated)
├── src/main/resources/
│   ├── application.properties      (Unsafe - gitignored)
│   ├── application-example.properties  (Safe - commit this)
│   └── ...
└── ...
```

## Testing Locally

Run your application with environment variables:
```bash
export $(cat .env | xargs) && mvn spring-boot:run
```

Or using IDE:
1. Edit → Run Configurations
2. Add VM options or environment variables
3. Set each variable from your `.env` file

---

**Summary:** Your repository is now safe to push to GitHub! Only share `.env.example` and `application-example.properties` as templates. Each developer creates their own `.env` with actual values.


# Docker Compose Configuration - Analysis & Issues

## 📋 Summary

**Status:** ⚠️ **ISSUES FOUND** - This docker-compose.yml file has several critical issues that need fixing.

---

## 🔍 Issues Found

### 1. ❌ **CRITICAL: Incorrect Backend Context Path**
**Line 34:** `context: ./backend`

**Problem:** The backend source code is in the current directory (ConceptVizBackend), not a `./backend` subdirectory.

**Current Structure:**
```
ConceptVizBackend/
├── src/
├── pom.xml
├── Dockerfile
└── docker-compose.yml
```

**Fix:** Change to `.` (current directory)
```yaml
backend:
  build:
    context: .
    dockerfile: Dockerfile
```

---

### 2. ❌ **CRITICAL: Frontend Context Path Missing**
**Line 87:** `context: ./frontend`

**Problem:** There is no frontend directory in ConceptVizBackend. The frontend should be in a separate folder at the parent level.

**Expected Structure:**
```
AI-Powered-Concept-Visualization-Platform/
├── ConceptVizBackend/
└── frontend/  (should be here, not in backend)
```

**Fix Options:**

**Option A:** Point to parent directory
```yaml
frontend:
  build:
    context: ../frontend
    dockerfile: Dockerfile
```

**Option B:** Remove frontend service from backend docker-compose (recommended)
- Keep docker-compose only for backend/database/ollama
- Create separate docker-compose in frontend folder

---

### 3. ⚠️ **Missing Ollama Service**
**Problem:** The docker-compose includes frontend but NO Ollama service, yet backend depends on it.

**Currently Missing:**
```yaml
ollama:
  image: ollama/ollama:latest
  container_name: conceptviz-ollama
  ports:
    - "11434:11434"
  volumes:
    - ollama_data:/root/.ollama
```

---

### 4. ⚠️ **Environment Variable Issues**
The file uses `.env` variables but no `.env` file exists in this context. Requires:

**Required Variables:**
```
POSTGRES_PASSWORD=<your_password>
JWT_SECRET=<your_secret>
CORS_ORIGINS=<your_origins>
GOOGLE_CLIENT_ID=<optional>
GOOGLE_CLIENT_SECRET=<optional>
```

---

### 5. ⚠️ **Health Check Issues**
**Line 89:** `http://localhost/health` - Frontend doesn't have a `/health` endpoint

**Better Health Check:**
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/"]
  interval: 30s
  timeout: 10s
  retries: 3
```

---

### 6. ⚠️ **Database User Inconsistency**
The docker-compose uses `conceptviz_user` but your `.env` file uses `postgres`.

**Current .env:**
```
DB_USERNAME=postgres
```

**Docker-compose expects:**
```
POSTGRES_USER=conceptviz_user
```

---

## ✅ Recommended Fixes

### **For Backend Only (Recommended):**

Replace your docker-compose.yml with a simpler version focused on backend:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: conceptviz-postgres
    environment:
      POSTGRES_DB: ${DB_NAME:-conceptviz}
      POSTGRES_USER: ${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - conceptviz-network

  # Ollama Service
  ollama:
    image: ollama/ollama:latest
    container_name: conceptviz-ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - conceptviz-network

  # Spring Boot Backend
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: conceptviz-backend
    ports:
      - "8080:8080"
    environment:
      # Database
      DB_URL: jdbc:postgresql://postgres:5432/${DB_NAME:-conceptviz}
      DB_USERNAME: ${DB_USERNAME:-postgres}
      DB_PASSWORD: ${DB_PASSWORD}
      
      # Ollama
      OLLAMA_BASE_URL: http://ollama:11434
      OLLAMA_MODEL: ${OLLAMA_MODEL:-qwen2.5-coder:7b}
      
      # JWT
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: ${JWT_EXPIRATION:-86400000}
      
      # OAuth2
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      
      # CORS
      CORS_ALLOWED_ORIGINS: ${CORS_ALLOWED_ORIGINS:-http://localhost:5173}
    
    depends_on:
      postgres:
        condition: service_healthy
      ollama:
        condition: service_started
    
    networks:
      - conceptviz-network
    
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

networks:
  conceptviz-network:
    driver: bridge

volumes:
  postgres_data:
  ollama_data:
```

---

### **For Full Stack (Backend + Frontend):**

You need **two separate docker-compose files**:

**1. ConceptVizBackend/docker-compose.yml** - Backend services only (use fix above)

**2. Frontend/docker-compose.yml** - Frontend only

**3. Root docker-compose.yml** - For orchestrating both (optional)

---

## 📋 Checklist - What to Do

- [ ] **Fix backend context:** Change `./backend` to `.`
- [ ] **Remove or fix frontend service:** Either remove it or point to correct path
- [ ] **Add Ollama service:** Include ollama image
- [ ] **Update environment variables:** Match your `.env` file
- [ ] **Fix health checks:** Ensure they match your actual endpoints
- [ ] **Create .env from .env.example:** Ensure required variables are set
- [ ] **Test the configuration:** Run `docker-compose config` to validate

---

## 🚀 Quick Fix - Copy This

I'll provide the corrected version in the next response. Would you like me to:

1. **Fix the current docker-compose.yml** (backend + db + ollama only)
2. **Keep current structure** (for full stack with frontend)
3. **Something else**

---

## 📚 Key Differences

| Aspect | Current | Recommended |
|--------|---------|-------------|
| Backend context | `./backend` ❌ | `.` ✅ |
| Frontend included | Yes ❌ (wrong path) | Separate file ✅ |
| Ollama service | Missing ❌ | Included ✅ |
| DB username | Mixed ⚠️ | Consistent ✅ |
| Health checks | Frontend broken ❌ | All working ✅ |

---

**Need me to apply these fixes? Let me know!** 🔧


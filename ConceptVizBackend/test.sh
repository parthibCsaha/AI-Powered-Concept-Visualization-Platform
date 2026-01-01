#!/bin/bash

# ConceptViz Backend Test Script
# This script tests the backend application setup

echo "======================================"
echo "ConceptViz Backend Test Suite"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC} - $2"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC} - $2"
        ((FAIL++))
    fi
}

echo "1. Testing Project Structure..."
echo "-----------------------------------"

# Test 1: Check if pom.xml exists
if [ -f "pom.xml" ]; then
    print_result 0 "pom.xml exists"
else
    print_result 1 "pom.xml not found"
fi

# Test 2: Check if src directory exists
if [ -d "src/main/java" ]; then
    print_result 0 "Source code directory exists"
else
    print_result 1 "Source code directory not found"
fi

# Test 3: Check if Dockerfile exists
if [ -f "Dockerfile" ]; then
    print_result 0 "Dockerfile exists"
else
    print_result 1 "Dockerfile not found"
fi

# Test 4: Check if docker-compose.yml exists
if [ -f "docker-compose.yml" ]; then
    print_result 0 "docker-compose.yml exists"
else
    print_result 1 "docker-compose.yml not found"
fi

echo ""
echo "2. Testing Security Configuration..."
echo "-----------------------------------"

# Test 5: Check if .env file exists
if [ -f ".env" ]; then
    print_result 0 ".env file exists (credentials secured)"
else
    print_result 1 ".env file not found"
fi

# Test 6: Check if .env.example exists
if [ -f ".env.example" ]; then
    print_result 0 ".env.example exists (shareable template)"
else
    print_result 1 ".env.example not found"
fi

# Test 7: Check if .gitignore contains .env
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    print_result 0 ".env is in .gitignore"
else
    print_result 1 ".env not properly gitignored"
fi

# Test 8: Check if application.properties uses environment variables
if grep -q '\${' src/main/resources/application.properties 2>/dev/null; then
    print_result 0 "application.properties uses environment variables"
else
    print_result 1 "application.properties doesn't use environment variables"
fi

echo ""
echo "3. Testing Build Configuration..."
echo "-----------------------------------"

# Test 9: Check Java version
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -ge 17 ]; then
        print_result 0 "Java 17+ installed (version: $(java -version 2>&1 | head -n 1))"
    else
        print_result 1 "Java 17+ required (found: $JAVA_VERSION)"
    fi
else
    print_result 1 "Java not found"
fi

# Test 10: Check Maven
if command -v mvn &> /dev/null; then
    print_result 0 "Maven installed ($(mvn -version | head -n 1))"
else
    if [ -f "mvnw" ]; then
        print_result 0 "Maven wrapper (mvnw) available"
    else
        print_result 1 "Maven not found"
    fi
fi

echo ""
echo "4. Testing Docker Configuration..."
echo "-----------------------------------"

# Test 11: Check Docker
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        print_result 0 "Docker installed and running"
    else
        print_result 1 "Docker installed but not running"
    fi
else
    print_result 1 "Docker not installed"
fi

# Test 12: Check docker-compose
if command -v docker-compose &> /dev/null; then
    print_result 0 "docker-compose installed"
elif docker compose version &> /dev/null 2>&1; then
    print_result 0 "docker compose (v2) installed"
else
    print_result 1 "docker-compose not installed"
fi

# Test 13: Validate docker-compose.yml syntax
if command -v docker-compose &> /dev/null; then
    if docker-compose config &> /dev/null; then
        print_result 0 "docker-compose.yml syntax valid"
    else
        print_result 1 "docker-compose.yml has syntax errors"
    fi
elif docker compose version &> /dev/null 2>&1; then
    if docker compose config &> /dev/null; then
        print_result 0 "docker-compose.yml syntax valid"
    else
        print_result 1 "docker-compose.yml has syntax errors"
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - docker-compose.yml validation (docker-compose not available)"
fi

echo ""
echo "5. Testing Environment Variables..."
echo "-----------------------------------"

# Test 14: Check required environment variables in .env
if [ -f ".env" ]; then
    REQUIRED_VARS=("DB_PASSWORD" "JWT_SECRET" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET")
    for VAR in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${VAR}=" .env; then
            print_result 0 "$VAR is set in .env"
        else
            print_result 1 "$VAR missing in .env"
        fi
    done
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - Environment variable checks (.env not found)"
fi

echo ""
echo "6. Testing Documentation..."
echo "-----------------------------------"

# Test 15-19: Check documentation files
DOCS=("SECURITY_SETUP.md" "TESTING_GUIDE.md" "QUICK_START.md" "DOCKER_FIXES.md" "PROJECT_STATUS.md")
for DOC in "${DOCS[@]}"; do
    if [ -f "$DOC" ]; then
        print_result 0 "$DOC exists"
    else
        print_result 1 "$DOC not found"
    fi
done

echo ""
echo "7. Testing Build (Maven)..."
echo "-----------------------------------"

# Test 20: Try to compile the project
if command -v mvn &> /dev/null || [ -f "mvnw" ]; then
    echo "Attempting to build project..."

    # Use Maven wrapper if available, otherwise use system Maven
    if [ -f "mvnw" ]; then
        BUILD_CMD="./mvnw"
    else
        BUILD_CMD="mvn"
    fi

    # Try to build
    if $BUILD_CMD clean compile -DskipTests -q &> /dev/null; then
        print_result 0 "Project compiles successfully"

        # Check if JAR can be packaged
        if [ -f "target/conceptviz-backend-1.0.0.jar" ] || $BUILD_CMD package -DskipTests -q &> /dev/null; then
            print_result 0 "JAR file created successfully"
            if [ -f "target/conceptviz-backend-1.0.0.jar" ]; then
                JAR_SIZE=$(ls -lh target/conceptviz-backend-1.0.0.jar | awk '{print $5}')
                echo "   ℹ️  JAR size: $JAR_SIZE"
            fi
        else
            print_result 1 "JAR packaging failed"
        fi
    else
        print_result 1 "Project compilation failed"
        echo "   Run 'mvn clean compile' to see detailed errors"
    fi
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - Maven build (Maven not available)"
fi

echo ""
echo "======================================"
echo "Test Summary"
echo "======================================"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
TOTAL=$((PASS + FAIL))
echo "Total:  $TOTAL"

if [ $FAIL -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Your project is ready!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Start services: docker-compose up -d"
    echo "  2. Check health:   curl http://localhost:8080/actuator/health"
    echo "  3. Push to GitHub: git add . && git commit -m 'Initial setup' && git push"
    exit 0
else
    echo ""
    echo -e "${YELLOW}⚠️  Some tests failed. Please review the issues above.${NC}"
    exit 1
fi


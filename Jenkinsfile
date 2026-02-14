pipeline {
    agent {
        docker {
            image 'node:18'
            args '-u root --network host -v /var/run/docker.sock:/var/run/docker.sock'
        }
    }

    environment {
        // ❌ VULNERABILITY: Hardcoded credentials in pipeline
        DOCKER_REGISTRY = 'registry.company.com'
        DOCKER_USER = 'admin'
        DOCKER_PASSWORD = 'docker@pass123'
        DB_PASSWORD = 'supersecret123'
        API_KEY = 'sk-live-1234567890abcdefghijklmnop'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running tests with coverage...'
                sh 'npm test || true'
            }
        }

     //   stage('SonarQube Analysis') {
     //       steps {
     //           withSonarQubeEnv('sonarqube') {
     //               sh '''
     //                   echo "Running SonarQube analysis..."
     //                   rm -rf sonar-scanner-*
     //                   curl -sSLo sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
     //                   apt-get update && apt-get install -y unzip
     //                   unzip -o -q sonar-scanner.zip
     //                   chmod +x sonar-scanner-*/bin/sonar-scanner

     //                   sonar-scanner-*/bin/sonar-scanner \
     //                     -Dsonar.projectKey=node-app \
     //                     -Dsonar.sources=. \
     //                     -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
     //               '''
     //           }
     //       }
     //   }
   
        stage('Quality Gate') {
            steps {
                script {
                    echo "⚠️ Quality gate check disabled - allowing vulnerable code"
                    // Commented out to allow vulnerable code to pass
                    /*
                    timeout(time: 5, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                    */
                }
            }
        }

        stage('Security Scan - Dependencies') {
            steps {
                echo 'Running npm audit...'
                sh 'npm audit --json > npm-audit.json || true'
                sh 'npm audit || true'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: node-app:${BUILD_NUMBER}"
                    
                    // ✅ PRIMARY BUILD COMMAND (as required)
                    sh "docker build -t node-app:${BUILD_NUMBER} ."
                    
                    // Tag as latest
                    sh "docker tag node-app:${BUILD_NUMBER} node-app:latest"
                    
                    echo "✅ Docker image built successfully: node-app:${BUILD_NUMBER}"
                }
            }
        }

        stage('Security Scan - Docker Image') {
            steps {
                script {
                    echo 'Scanning Docker image with Trivy...'
                    sh """
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
                        aquasec/trivy image --severity HIGH,CRITICAL \\
                        node-app:${BUILD_NUMBER} || true
                    """
                }
            }
        }

        stage('Test Docker Container') {
            steps {
                script {
                    echo 'Testing Docker container...'
                    
                    // Start container
                    sh """
                        docker run -d --name node-app-test-${BUILD_NUMBER} \\
                        -p 3000:3000 \\
                        node-app:${BUILD_NUMBER}
                    """
                    
                    // Wait for app to start
                    sh 'sleep 5'
                    
                    // Test health endpoint
                    sh 'curl -f http://localhost:3000/health || exit 1'
                    
                    // Cleanup
                    sh """
                        docker stop node-app-test-${BUILD_NUMBER}
                        docker rm node-app-test-${BUILD_NUMBER}
                    """
                }
            }
        }

        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo 'Pushing to Docker registry...'
                    
                    // ❌ VULNERABILITY: Using plain text credentials
                    sh """
                        echo ${DOCKER_PASSWORD} | docker login ${DOCKER_REGISTRY} \\
                        --username ${DOCKER_USER} --password-stdin || true
                        
                        docker tag node-app:${BUILD_NUMBER} ${DOCKER_REGISTRY}/node-app:${BUILD_NUMBER}
                        docker push ${DOCKER_REGISTRY}/node-app:${BUILD_NUMBER} || true
                    """
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo 'Deploying to production...'
                    sh """
                        docker stop node-app-prod || true
                        docker rm node-app-prod || true
                        
                        docker run -d --name node-app-prod \\
                        -p 80:3000 \\
                        --restart unless-stopped \\
                        node-app:${BUILD_NUMBER}
                    """
                    
                    // ❌ VULNERABILITY: Logging secrets
                    echo "Deployed with API_KEY: ${API_KEY}"
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            sh 'docker system prune -

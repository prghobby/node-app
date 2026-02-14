pipeline {
    agent {
        docker {
            image 'node:18'
            args '-u root --network host'
        }
    }

    environment {
        // Optional: use Jenkins credentials if needed later
        // SONAR_TOKEN = credentials('sonar-token')
    }

    stages {

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh '''
                        rm -rf sonar-scanner-*
                        curl -sSLo sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
                        apt-get update && apt-get install -y unzip
                        unzip -o -q sonar-scanner.zip
                        chmod +x sonar-scanner-*/bin/sonar-scanner

                        sonar-scanner-*/bin/sonar-scanner \
                          -Dsonar.projectKey=node-app \
                          -Dsonar.sources=. \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    '''
                }
            }
        }

        /*
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        */

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image node-app:${BUILD_NUMBER}"
                    dockerImage = docker.build("node-app:${BUILD_NUMBER}")
                }
            }
        }
    }
}


pipeline {
    agent {
        docker {
            image 'node:18'
            args '-u root'  // Run as root to allow apt-get
        }
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
                        # Clean up any existing scanner directory
                        rm -rf sonar-scanner-*
                        curl -sSLo sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
                        apt-get update && apt-get install -y unzip
                        unzip -o -q sonar-scanner.zip  # -o flag forces overwrite
                        chmod +x sonar-scanner-*/bin/sonar-scanner
                        sonar-scanner-*/bin/sonar-scanner \
                          -Dsonar.projectKey=node-app \
                          -Dsonar.sources=. \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    '''
                }
            }
        }
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
}

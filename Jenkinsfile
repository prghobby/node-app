pipeline {
    agent {
        docker {
            image 'node:18'
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
    agent {
        docker {
            image 'sonarsource/sonar-scanner-cli:latest'
            args '-u root'
        }
    }
    steps {
        withSonarQubeEnv('sonarqube') {
            sh '''
            sonar-scanner \
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


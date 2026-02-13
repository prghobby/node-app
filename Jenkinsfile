pipeline {
    agent {
        docker {
            image 'node:18'
        }
    }

    environment {
        SONARQUBE = credentials('sqp_a739f9cc11320b5f2ce94cfc3b03a457ff0187fa')
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
            npm install sonar-scanner --save-dev
            npx sonar-scanner \
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


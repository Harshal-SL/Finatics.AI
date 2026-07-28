pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "harshalsl0209/finatics-frontend"
        BACKEND_IMAGE  = "harshalsl0209/finatics-backend"
    }

    stages {

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    bat 'docker build -t %FRONTEND_IMAGE% .'
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    bat 'docker build -t %BACKEND_IMAGE% .'
                }
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
                    bat 'docker push %FRONTEND_IMAGE%'
                    bat 'docker push %BACKEND_IMAGE%'
                }
            }
        }

        stage('Create Environment Files') {
            steps {
                withCredentials([
                    // ── Banking DB ─────────────────────────────────────────
                    string(credentialsId: 'BANKING_DB_URL',       variable: 'BANKING_DB_URL'),
                    string(credentialsId: 'BANKING_DB_ANON_KEY',  variable: 'BANKING_DB_ANON_KEY'),
                    // ── Application DB ─────────────────────────────────────
                    string(credentialsId: 'APP_DB_URL',           variable: 'APP_DB_URL'),
                    string(credentialsId: 'APP_DB_ANON_KEY',      variable: 'APP_DB_ANON_KEY'),
                    // ── Gemini AI ──────────────────────────────────────────
                    string(credentialsId: 'GEMINI_API_KEY',       variable: 'GEMINI_API_KEY'),
                    // ── Frontend ───────────────────────────────────────────
                    string(credentialsId: 'VITE_SUPABASE_URL',    variable: 'VITE_SUPABASE_URL'),
                    string(credentialsId: 'VITE_SUPABASE_ANON_KEY', variable: 'VITE_SUPABASE_ANON_KEY'),
                    string(credentialsId: 'VITE_PAYPAL_CLIENT_ID', variable: 'VITE_PAYPAL_CLIENT_ID')
                ]) {
                    writeFile file: 'backend/.env', text: """BANKING_DB_URL=${BANKING_DB_URL}
BANKING_DB_ANON_KEY=${BANKING_DB_ANON_KEY}
APP_DB_URL=${APP_DB_URL}
APP_DB_ANON_KEY=${APP_DB_ANON_KEY}
GEMINI_API_KEY=${GEMINI_API_KEY}
GEMINI_CHATBOT_API_KEY=${GEMINI_API_KEY}
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://localhost:4173
"""
                    writeFile file: 'frontend/.env', text: """VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
VITE_API_URL=http://localhost:3000/api
VITE_PAYPAL_CLIENT_ID=${VITE_PAYPAL_CLIENT_ID}
"""
                }
            }
        }

        stage('Deploy Containers') {
            steps {
                bat 'docker compose down'
                bat 'docker compose up -d --build'
            }
        }
    }

    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}

pipeline {
  agent any

  environment {
    TOKEN = credentials('POS_TOKEN')
    EMAIL = "darek+ci@near-me.com"
  }

  options {
    disableConcurrentBuilds()
    timeout(time: 3, unit: 'MINUTES')
    buildDiscarder(logRotator(daysToKeepStr: '365', artifactDaysToKeepStr: '30'))
  }

  stages {
    stage('Staging') {
      environment {
        MP_URL = "https://nearme-example.staging-oregon.near-me.com"
        GI_SUITE_ID = "588f27fcc8a68278cfc2a501"
      }

      when {
        branch 'master'
      }

      steps {
        script {
          commitInfo = sh(returnStdout: true, script: 'git log --no-merges --format="[%h] %an - %B" -1')
        }

        slackSend (channel: "#notifications-example", message: "STARTED: Deploying to <${MP_URL}|staging environment> (<${env.BUILD_URL}|Build #${env.BUILD_NUMBER}>) \n ${commitInfo}")

        sh 'bash -l ./scripts/deploy.sh'
      }

      post {
        success {
          slackSend (channel: "#notifications-example", color: '#00FF00', message: "SUCCESS: Deployed new code to staging (<${MP_URL}|Preview staging>)")
        }

        failure {
          slackSend (channel: "#notifications-example", color: '#FF0000', message: "FAILED: Build failed (<${env.BUILD_URL}|Open build details>)")
        }
      }
    }
  }
}
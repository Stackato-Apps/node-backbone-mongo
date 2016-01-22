#!/usr/bin/groovy

// lets allow the VERSION_PREFIX to be specified as a parameter to the build
// but if not lets just default to 1.0
def versionPrefix = ""
try {
  versionPrefix = VERSION_PREFIX
} catch (Throwable e) {
  versionPrefix = "1.0"
}

def canaryVersion = "${versionPrefix}.${env.BUILD_NUMBER}"

def organisation = ""
try {
  organisation = ORGANISATION
} catch (Throwable e) {
  organisation = "fabric8io"
}

def envStage = "${env.JOB_NAME}-staging"
def envProd = "${env.JOB_NAME}-production"

node ('kubernetes'){

  git 'https://github.com/jmlambert78/node-backbone-mongo'

  kubernetes.pod('buildpod').withImage('fabric8/builder-openshift-client')
      .withPrivileged(true)
      .withHostPathMount('/var/run/docker.sock','/var/run/docker.sock')
      .withEnvVar('DOCKER_CONFIG','/home/jenkins/.docker/')
      .withSecret('jenkins-docker-cfg','/home/jenkins/.docker')
      .withServiceAccount('jenkins')
      .inside {

        def clusterImageName = "${env.FABRIC8_DOCKER_REGISTRY_SERVICE_HOST}:${env.FABRIC8_DOCKER_REGISTRY_SERVICE_PORT}/${organisation}/${env.JOB_NAME}:${versionPrefix}"
        def dockerhubImageName = "docker.io/${organisation}/${env.JOB_NAME}:${versionPrefix}"

        stage 'canary release'

          if (!fileExists ('Dockerfile')) {
            writeFile file: 'Dockerfile', text: 'FROM node:5.3-onbuild'
          }
          sh "docker build --rm -t ${clusterImageName} ."
          //sh "docker push ${clusterImageName}"

          def rc = getKubernetesJson {
            port = 8080
            label = 'node'
            icon = 'https://cdn.rawgit.com/fabric8io/fabric8/dc05040/website/src/images/logos/nodejs.svg'
            version = versionPrefix
            imageName = clusterImageName
          }

          sh 'echo "commit:" `git rev-parse HEAD` >> git.yml && echo "branch:" `git rev-parse --abbrev-ref HEAD` >> git.yml'

        stage 'Rolling upgrade Staging'
          kubernetesApply(file: rc, environment: envStage)

        approve{
          room = null
          version = canaryVersion
          console = fabric8Console
          environment = envStage
        }

        // stage 'promote'
        //   sh "docker tag -f ${clusterImageName} ${dockerhubImageName}"
        //   sh "docker push -f ${dockerhubImageName}"

        stage 'Rolling upgrade Production'
          kubernetesApply(file: rc, environment: envProd)

  }
}

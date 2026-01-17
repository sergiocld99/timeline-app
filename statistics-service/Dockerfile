# ETAPA 1: Compilación (Build)
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Directorio de trabajo
WORKDIR /usr/src/app

# Copiamos el pom primero para aprovechar el caché de Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Ahora copiamos el resto del código y compilamos
COPY src ./src
RUN mvn package -DskipTests

# ETAPA 2: Ejecución (Runtime usando la imagen de Red Hat)
FROM registry.access.redhat.com/ubi9/openjdk-21:1.23

ENV LANGUAGE='en_US:en'
EXPOSE 8081
USER 185

# Copiamos los artefactos generados en la etapa de build
COPY --from=build --chown=185 /usr/src/app/target/quarkus-app/lib/ /deployments/lib/
COPY --from=build --chown=185 /usr/src/app/target/quarkus-app/*.jar /deployments/
COPY --from=build --chown=185 /usr/src/app/target/quarkus-app/app/ /deployments/app/
COPY --from=build --chown=185 /usr/src/app/target/quarkus-app/quarkus/ /deployments/quarkus/

# Configuramos variables para que Quarkus escuche en el puerto correcto y use el Manager de Logs
ENV JAVA_OPTS_APPEND="-Dquarkus.http.port=8081 -Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"

ENTRYPOINT [ "/opt/jboss/container/java/run/run-java.sh" ]
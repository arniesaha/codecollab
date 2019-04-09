FROM maven:3.5.2-jdk-8-alpine as maven-build
WORKDIR /app
COPY . .
RUN mvn verify

FROM openjdk:8-jre-alpine
RUN adduser \
 -h /var/codecollab \
 -D -u 1000 \
 ghsum ghsum

USER ghsum
WORKDIR /var/codecollab

ENV TOKENS=""
ENTRYPOINT ["java", "-Dapi-tokens=${TOKENS}", "-jar", "codecollab.jar"]
EXPOSE 7070

COPY --from=maven-build \
 --chown=ghsum:ghsum \
 /app/target/codecollab-jar-with-dependencies.jar codecollab.jar

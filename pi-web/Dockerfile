FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g @agegr/pi-web@latest

EXPOSE 30141
ENTRYPOINT ["pi-web"]
CMD ["--hostname", "0.0.0.0", "--port", "30141", "--no-open"]

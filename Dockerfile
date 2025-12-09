FROM public.ecr.aws/amazonlinux/amazonlinux:2023.9.20251208.0@sha256:dc1dacae45ec346969d430237ddd1a282170ec9f322d4b3cf28ac8f1975070a1
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

EXPOSE 8080

WORKDIR /usr/src/app

COPY package*.json .

# hadolint ignore=DL3041,DL3016
RUN curl -fsSL https://rpm.nodesource.com/setup_23.x | bash -; \
    dnf install nodejs -y; \
    npm install -g npm; \
    npm install; \
    dnf upgrade -y; \
    dnf clean all

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]

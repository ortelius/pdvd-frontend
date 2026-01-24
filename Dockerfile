FROM public.ecr.aws/amazonlinux/amazonlinux:2023.10.20260120.4@sha256:50a58a006d3381e38160fc5bb4bbefa68b74fcd70dde798f68667aac24312f20
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
EXPOSE 8080

WORKDIR /usr/src/app

COPY . .

# hadolint ignore=DL3041,DL3016
RUN rm -f package-lock.json; \
    curl -fsSL https://rpm.nodesource.com/setup_23.x | bash -; \
    dnf install nodejs -y; \
    npm install -g npm; \
    npm install; \
    dnf upgrade -y; \
    dnf clean all

RUN npm run build

CMD ["npm", "run", "start"]

FROM public.ecr.aws/amazonlinux/amazonlinux:2023.10.20260105.0@sha256:e27a70c006c68f0d194cc9b9624714d6ed8d979a94f60f7d31392f4c8294155b

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

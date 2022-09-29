FROM node:16.13.2

EXPOSE 3000

COPY package.json /usr/src/app/package.json
COPY yarn.lock /usr/src/app/yarn.lock
COPY ./server/ /usr/src/app/server

WORKDIR /usr/src/app

RUN apt update && apt-get install -y libudev-dev && apt-get install libusb-1.0-0
RUN yarn --no-progress --non-interactive --frozen-lockfile

ARG COMMIT_SHA
ARG API_HOST
ARG NOTIFICATIONS_HOST
ARG NOTIFICATIONS_HOST_GOERLI
ARG APP_FULL_DOMAIN
ARG MIXPANEL_ENV
ARG MIXPANEL_KEY
ARG ADROLL_ADV_ID
ARG ADROLL_PIX_ID
ARG MAINNET_CACHE_URL
ARG SHOW_BUILD_INFO
ARG ETHERSCAN_API_KEY
ARG BLOCKNATIVE_API_KEY
ARG INFURA_PROJECT_ID
ARG NODE_ENV
ARG NEXT_PUBLIC_SENTRY_ENV
ARG SENTRY_AUTH_TOKEN

ENV COMMIT_SHA=$COMMIT_SHA \
    API_HOST=$API_HOST \
    NOTIFICATIONS_HOST=$NOTIFICATIONS_HOST \
    NOTIFICATIONS_HOST_GOERLI=$NOTIFICATIONS_HOST_GOERLI \
    APP_FULL_DOMAIN=$APP_FULL_DOMAIN \
    MIXPANEL_ENV=$MIXPANEL_ENV \
    MIXPANEL_KEY=$MIXPANEL_KEY \
    ADROLL_ADV_ID=$ADROLL_ADV_ID \
    ADROLL_PIX_ID=$ADROLL_PIX_ID \
    MAINNET_CACHE_URL=$MAINNET_CACHE_URL \
    ETHERSCAN_API_KEY=$ETHERSCAN_API_KEY \
    BLOCKNATIVE_API_KEY=$BLOCKNATIVE_API_KEY \
    INFURA_PROJECT_ID=$INFURA_PROJECT_ID \
    USE_TERMS_OF_SERVICE=1 \
    USE_TRM_API=1 \
    SHOW_BUILD_INFO=$SHOW_BUILD_INFO \
    NODE_ENV=$NODE_ENV \
    SENTRY_RELEASE=$COMMIT_SHA \
    NEXT_PUBLIC_SENTRY_ENV=$NEXT_PUBLIC_SENTRY_ENV \
    SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN \
    NODE_OPTIONS=--max-old-space-size=4096

COPY . .

RUN chmod +x ./scripts/wait-for-it.sh \
    && npm run build

CMD [ "npm", "run", "start:prod" ]

FROM node:18-alpine as build
WORKDIR /app
COPY frontend/package.json ./
RUN npm install
COPY frontend .

# The API endpoint can be customized during the image build
# so that the frontend works in different environments.
ARG API_URL=/api
ENV VITE_API_URL=$API_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf


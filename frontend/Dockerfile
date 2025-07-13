FROM node:18-alpine as build
WORKDIR /app
COPY frontend/package.json ./
RUN npm install
COPY frontend .
ENV VITE_API_URL=http://backend:8000
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf


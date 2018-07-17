FROM node:alpine
COPY ./dist /var/web/ 
WORKDIR /var/web/
RUN npm i -g http-server
ENTRYPOINT http-server -p 5000
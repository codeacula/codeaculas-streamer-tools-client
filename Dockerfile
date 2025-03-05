FROM node:lts-alpine
WORKDIR /app
EXPOSE 3000
RUN npm install
CMD ["npm", "run", "dev"]
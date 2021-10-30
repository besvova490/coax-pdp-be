FROM node:14
WORKDIR /out/app-be
ADD package.json package.json
RUN npm install
ADD . .
RUN npm prune --production
CMD ["npm", "start"]
EXPOSE 8080
# Stage 1: Build the Vite application
FROM node:20-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built application from the build-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy your custom nginx configuration (optional, but good practice)
# If you need specific Nginx configurations, create an nginx.conf file
# in your project root and uncomment the line below.
#COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
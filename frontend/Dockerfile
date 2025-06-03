# ---- Stage 1: Build the React application ----
FROM node:18-alpine AS builder
# 'builder' is a name we give to this stage

WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
# Use npm ci for cleaner, faster, and more reliable builds in CI/CD environments
RUN npm ci

# Copy the rest of your application code
COPY . .

# Build the React application for production
RUN npm run build
# This will create a 'build' folder in /app/build with your static assets

# ---- Stage 2: Serve the application with Nginx ----
FROM nginx:1.25-alpine
# 'nginx:1.25-alpine' is a lightweight Nginx image

# Copy the static assets from the 'builder' stage (from /app/build)
# to Nginx's default HTML directory
COPY --from=builder /app/build /usr/share/nginx/html

# If you created a custom nginx.conf, copy it into the Nginx configuration directory
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (which Nginx listens on by default, or as configured in nginx.conf)
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
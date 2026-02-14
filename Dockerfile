# ❌ Intentionally outdated and vulnerable base image
FROM node:14

# ❌ Hardcoded secret (SonarQube will flag this)
ENV DB_PASSWORD="supersecret123"

WORKDIR /app

# Copy package files
COPY package*.json ./

# ❌ Install outdated dependencies (SonarQube + npm audit will flag)
RUN npm install express@4.17.1 mysql@2.18.1

# Copy source code
COPY . .

# ❌ Expose port directly (fine, but SonarQube may warn)
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]


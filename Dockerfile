FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Supabase 公开配置（anon key 本来就会分发到每个浏览器，可放心内置）
ENV VITE_SUPABASE_URL=https://ixtgapdbboqlpndyogcq.supabase.co
ENV VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dGdhcGRiYm9xbHBuZHlvZ2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NTUzNzksImV4cCI6MjEwMTEzMTM3OX0.lOZqumY19sywODZ5_sV9Sb7yzdon34WEp4Kpl8nTIGs
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

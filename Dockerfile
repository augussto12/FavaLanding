# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Las variables de Vite se hornean en el bundle: tienen que estar presentes
# ANTES de npm run build. No sirve pasarlas en runtime, el JS ya salio.
ARG VITE_SCRIPT_URL=""
ARG VITE_TURNSTILE_SITE_KEY=""
ARG VITE_FORM_TOKEN=""
ENV VITE_SCRIPT_URL=$VITE_SCRIPT_URL \
    VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY \
    VITE_FORM_TOKEN=$VITE_FORM_TOKEN

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- servicio ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

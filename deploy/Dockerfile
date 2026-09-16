# =============================================================================
# AURIX — ảnh Docker
#
#   docker build -f deploy/Dockerfile -t aurix .
#   docker run -d --name aurix -p 4477:4477 \
#     --env-file .env -v aurix-data:/app/server/data aurix
#
# Ảnh không cần cài gói nào: máy chủ chạy bằng thư viện chuẩn của Node.
# =============================================================================
FROM node:22-alpine

# curl dùng cho HEALTHCHECK bên dưới
RUN apk add --no-cache curl

WORKDIR /app

# Chép mã nguồn. HTML tĩnh trong public/ đã được dựng sẵn và đưa lên kho mã,
# nên ảnh không cần bước build — thời gian dựng tính bằng giây.
COPY package.json ./
COPY server ./server
COPY site ./site
COPY scripts ./scripts
COPY public ./public

# Chạy dưới tài khoản thường, không phải root
RUN mkdir -p server/data && chown -R node:node /app
USER node

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4477 \
    AURIX_DB=/app/server/data/aurix.db \
    AURIX_LOG_JSON=true

EXPOSE 4477
VOLUME ["/app/server/data"]

HEALTHCHECK --interval=30s --timeout=4s --start-period=10s --retries=3 \
  CMD curl -fsS http://127.0.0.1:4477/api/health || exit 1

# Node nhận SIGTERM trực tiếp nên tắt máy vẫn êm, không cần init phụ
CMD ["node", "server/server.js"]

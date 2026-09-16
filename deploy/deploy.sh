#!/usr/bin/env bash
# =============================================================================
# AURIX — triển khai một lệnh.
#
#   ssh aurix@may-chu 'cd /var/www/aurix && ./deploy/deploy.sh'
#
# Các bước, theo đúng thứ tự an toàn:
#   sao lưu → lấy mã mới → dựng HTML tĩnh → kiểm định → migration → khởi động
#   lại → kiểm tra sức khoẻ. Bất kỳ bước nào hỏng là dừng ngay, không khởi động
#   lại dịch vụ đang chạy tốt bằng một bản dựng hỏng.
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/aurix}"
SERVICE="${SERVICE:-aurix}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:4477/api/health}"

cd "$APP_DIR"

gold() { printf '\033[38;5;179m%s\033[0m\n' "$1"; }
step() { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }
die()  { printf '\033[31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

gold "AURIX — triển khai"

step "1/7  Sao lưu cơ sở dữ liệu"
node server/cli.js backup --keep=14

step "2/7  Lấy mã mới"
if [ -d .git ]; then
  git fetch --all --quiet
  git reset --hard "origin/$(git rev-parse --abbrev-ref HEAD)" --quiet
  gold "  $(git log -1 --pretty='%h %s')"
else
  echo "  (không phải kho git — bỏ qua)"
fi

step "3/7  Dựng HTML tĩnh"
node scripts/build.js

step "4/7  Kiểm định chất lượng"
node scripts/audit.js || die "Kiểm định thất bại — KHÔNG triển khai."

step "5/7  Migration cơ sở dữ liệu"
node server/cli.js migrate

step "6/7  Khởi động lại dịch vụ"
if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl restart "$SERVICE"
else
  die "Không tìm thấy systemctl — hãy khởi động lại tiến trình bằng tay."
fi

step "7/7  Kiểm tra sức khoẻ"
for i in $(seq 1 15); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    gold "  Máy chủ đã phản hồi sau ${i}s"
    curl -fsS "$HEALTH_URL"; echo
    node server/cli.js doctor
    gold "
Triển khai xong."
    exit 0
  fi
  sleep 1
done

die "Máy chủ không phản hồi sau 15 giây. Xem nhật ký: journalctl -u $SERVICE -n 80"

#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."

# Permit this codespace's preview hostname without disabling host checks.
if [[ -n "${CODESPACE_NAME:-}" ]]; then
  export __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS="${CODESPACE_NAME}-4200.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
fi

# The lock prevents duplicate servers if the startup command is run again.
nohup flock --nonblock /tmp/signal-demo.lock \
  ./node_modules/.bin/ng serve --host 0.0.0.0 --port 4200 \
  >> /tmp/signal-demo.log 2>&1 < /dev/null &

for ((attempt = 0; attempt < 60; attempt++)); do
  if curl --silent --fail --max-time 2 http://127.0.0.1:4200/ > /dev/null; then
    printf 'Signal is ready. Open port 4200 from the Ports panel.\n'
    exit 0
  fi
  sleep 1
done

printf 'Signal did not start. Check /tmp/signal-demo.log for details.\n' >&2
exit 1

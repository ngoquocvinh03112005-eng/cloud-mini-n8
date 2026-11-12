#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

test -f "$DIR/realm-52300085.json"
test -f "$DIR/flask-app.json"

docker cp "$DIR/realm-52300085.json" \
  authentication-identity-server:/tmp/minicloud-realm.json

docker cp "$DIR/flask-app.json" \
  authentication-identity-server:/tmp/minicloud-client.json

docker exec authentication-identity-server sh -lc '
set -eu

/opt/keycloak/bin/kcadm.sh config credentials \
  --server http://127.0.0.1:8080 \
  --realm master \
  --user "$KC_BOOTSTRAP_ADMIN_USERNAME" \
  --password "$KC_BOOTSTRAP_ADMIN_PASSWORD" >/dev/null

if ! /opt/keycloak/bin/kcadm.sh get realms/52300085 >/dev/null 2>&1; then
  /opt/keycloak/bin/kcadm.sh create realms \
    -f /tmp/minicloud-realm.json
  echo "Realm created."
else
  echo "Realm already exists; skipped."
fi

if ! /opt/keycloak/bin/kcadm.sh get clients \
  -r 52300085 -q clientId=flask-app | grep -q "\"clientId\""; then
  /opt/keycloak/bin/kcadm.sh create clients \
    -r 52300085 -f /tmp/minicloud-client.json
  echo "flask-app client created."
else
  echo "flask-app client already exists; skipped."
fi
'

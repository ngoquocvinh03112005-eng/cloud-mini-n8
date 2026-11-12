#!/usr/bin/env bash
set -euo pipefail

docker exec object-storage-server sh -lc '
set -eu

mcli alias set local http://127.0.0.1:9000 \
  "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"

mcli mb --ignore-existing local/profile-pics
mcli mb --ignore-existing local/documents

mcli anonymous set download local/profile-pics

echo "Buckets initialized."
'

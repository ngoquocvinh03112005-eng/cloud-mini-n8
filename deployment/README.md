# MiniCloud deployment notes

## Database
MariaDB initializes from:
- relational-database-server/init/001_init.sql
- relational-database-server/init/002_studentdb.sql

## Keycloak
After starting the stack, import the exported realm and client:

```bash
bash deployment/keycloak/import-realm.sh
```

The bootstrap administrator credentials come from the local .env file.
Create or reset demo-user passwords separately; user passwords are not exported.

## Object storage
After starting the stack:

```bash
bash deployment/object-storage/init-buckets.sh
```

This creates:
- profile-pics
- documents

The bucket initializer does not copy objects from another deployment.

## Grafana
The Prometheus datasource and dashboard are provisioned from:
- grafana-provisioning/datasources/
- grafana-provisioning/dashboards/

## Independent deployments
Each member must use their own .env and persistent data.
Do not copy another member's runtime directories or credentials.

# MiniCloud - Cloud Computing Project

Hệ thống MiniCloud được triển khai bằng Docker Compose.
Mỗi thành viên có thể chạy độc lập trên máy cá nhân hoặc EC2 riêng.

## 1. Requirements

- Git
- Docker Engine hoặc Docker Desktop
- Docker Compose v2
- RAM khuyến nghị: 8 GB trở lên
- Dung lượng trống khuyến nghị: 10 GB trở lên

## 2. Clone project

```bash
git clone https://github.com/ngoquocvinh03112005-eng/cloud-mini-n8.git
cd cloud-mini-n8
```

## 3. Configure environment

Linux / macOS:

```bash
cp .env.example .env
nano .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
notepad .env
```

Thay tất cả giá trị CHANGE_ME bằng mật khẩu riêng.

PUBLIC_BASE_URL:
- Chạy trên máy cá nhân: http://localhost:8081
- Chạy trên EC2: http://YOUR_EC2_PUBLIC_IP:8081

Không sử dụng file .env của thành viên khác.

## 4. Start the system

```bash
docker compose config -q
docker compose up -d --build
docker compose ps
```

## 5. Access services

| Service | URL |
|---|---|
| Main website / Gateway | http://localhost |
| Frontend 1 | http://localhost:8080 |
| Frontend 2 | http://localhost:8082 |
| Backend API | http://localhost:8085 |
| Keycloak | http://localhost:8081 |
| Silo Object Storage | http://localhost:9000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |

## 6. Useful commands

View status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

View a specific service:

```bash
docker compose logs -f application-backend-server
```

Stop containers without deleting persistent data:

```bash
docker compose stop
```

Start again:

```bash
docker compose start
```

Rebuild:

```bash
docker compose up -d --build
```

## 7. Data persistence

Database and application data are stored in local Docker volumes or bind-mounted directories.

Each member has their own data. Do not copy another member's runtime folders unless intentionally restoring a backup.

## 8. Security

- Never commit `.env`.
- Never commit passwords, private keys, access tokens or production data.
- Use unique credentials for each deployment.
- Restrict database, Keycloak administration, Grafana and object-storage ports when deploying to a public EC2 instance.

## 9. Important note

The repository contains application source and deployment configuration.
Initial Keycloak realm, sample users and object-storage sample files must be provisioned or imported separately if they are not included in the repository.

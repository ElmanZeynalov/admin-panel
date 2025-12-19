# Telegram Admin Panel & Bot

Bu layihə Telegram botu və onu idarə etmək üçün Admin Paneldən ibarətdir.

## Tələblər
- Node.js 18+
- Docker (Lokal baza üçün)

## İşə Salmaq (Lokal)

### 1. Bazanı qaldırın (PostgreSQL)
```bash
docker-compose up -d
```

### 2. .env faylını hazırlayın
Layihənin kökündə `.env` faylı yaradın və `DATABASE_URL`-i daxil edin:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bot_db?schema=public"
BOT_TOKEN="sizin_bot_token"
```

### 3. Miqrasiya edin
```bash
npx prisma migrate dev
```

### 4. Admin Paneli başladın
```bash
npm run dev
```
Sayt: [http://localhost:3000](http://localhost:3000)

### 5. Botu başladın
Yeni bir terminal açın və:
```bash
npm run bot
```

## Cloud (Railway.app)
Layihəni deploy etmək üçün [DEPLOY.md](./DEPLOY.md) faylını oxuyun.

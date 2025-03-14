# Levicamp Admin

Levicamp Admin is the internal administrative panel for managing reservations, tents, categories, and settings for Levicamp.

[![wakatime](https://wakatime.com/badge/user/27d5225c-9070-4e66-bf63-1eb7ba5e2293/project/99eaf0a0-e819-43c6-a73e-f9a07196e949.svg)](https://wakatime.com/badge/user/27d5225c-9070-4e66-bf63-1eb7ba5e2293/project/99eaf0a0-e819-43c6-a73e-f9a07196e949)

## 🚀 Features
- **Overview** – Dashboard with key metrics and insights
- **Booking Management** – Oversee and manage all reservations
- **Admin Management** – Manage admin roles and permissions
- **Tent Category** – Organize and define tent classifications
- **Tents** – Monitor and manage available tent spaces
- **Settings** – Customize platform preferences

## 🛠 Tech Stack
- **Frontend**: Next.js
- **Backend**: Go (Golang) with Express API
- **Database**: PostgreSQL
- **Runtime**: Bun
- **Containerization**: Docker
- **Hosting**: VPS (Hostinger)

## 📦 Installation
```sh
# Clone the repository (internal project)
git clone git@github.com:heulaulab-dev/levicamp-admin.git

# Navigate into the directory
cd levicamp-admin

# Install dependencies
bun install

# Copy environment variables template
cp .env.local.example .env.local
```

## 🏗 Running the Project
```sh
# Start the development server
bun run dev

# Build for production
bun run build
```

## 🚀 Deployment
Ensure that the necessary environment variables are set in `.env.production`, then build and deploy:
```sh
bun run build && bun run start
```

## 🔒 Internal Use Only
This project is strictly for internal use within Levicamp. Unauthorized access or distribution is prohibited.

## 🤝 Contribution
Team members can submit issues or pull requests to improve Levicamp Admin.

## 📜 License
MIT License

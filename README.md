# NORI SUSHI

NORI SUSHI is a full-stack sushi delivery mobile application built with React Native, Expo, NestJS, Prisma, and PostgreSQL.

The project includes a mobile client, authentication, product catalog, favorites, delivery addresses, map integration, and order management.

## Demo

Android demo APKs are available in GitHub Releases.

- Universal APK — compatible with more Android devices
- ARM64 APK — smaller build for modern ARM64 Android devices

> This is a portfolio/demo project and is not published on Google Play.

## Features

- Product catalog with categories
- Russian and English localization
- Dynamic product names and descriptions
- Google authentication
- Telegram authentication
- User profile
- Favorites
- Cart
- Delivery and pickup
- Address management
- Mapbox map integration
- Order creation
- Order history
- Order details
- Order cancellation
- Repeat order
- Guest orders
- Persistent authentication
- Responsive Android UI

## Tech Stack

### Mobile

- React Native
- Expo
- TypeScript
- React Navigation
- Zustand
- i18next
- Mapbox
- Expo Location
- Google Sign-In
- Expo Secure Store

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Neon
- JWT authentication
- Google Auth Library
- Telegram Bot API

### Deployment

- Backend: Render
- Database: Neon PostgreSQL
- Android builds: Expo EAS Build

## Project Structure

```text
nori-sushi/
├── sushi-delivery/   # React Native / Expo mobile app
├── sushi-backend/    # NestJS backend
└── README.md
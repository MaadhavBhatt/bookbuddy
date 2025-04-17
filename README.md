# BookBuddy

A matchmaking site connecting book donors and seekers.

## Overview

BookBuddy helps schools create their own book exchange platform where students can donate books they no longer need and find books they want to read.

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

## Firebase Setup for Your School

BookBuddy uses Firebase for data storage and authentication. Follow these steps to set up your own Firebase instance:

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Name your project (e.g., "YourSchool-BookBuddy")
4. Choose whether to enable Google Analytics (recommended)
5. Accept the terms and click "Create project"

### 2. Set Up Firestore Database

1. In the Firebase Console, click "Firestore Database" in the left menu
2. Click "Create database"
3. Choose "Start in test mode" for development (you can set up rules later)
4. Select a location close to your school
5. Click "Enable"

### 3. Register Your Web App

1. In the Firebase Console, click the gear icon (⚙️) and select "Project settings"
2. Scroll down to "Your apps" and click the web icon (</>)
3. Register your app with a nickname (e.g., "yourschool-bookbuddy")
4. Click "Register app"
5. Copy the Firebase configuration object (you'll need this in the next step)

### 4. Configure Your BookBuddy Instance

1. In your BookBuddy project, create a `.env` file in the root directory
2. Copy the contents of `.env.example` into your `.env` file
3. Replace the placeholder values with your Firebase configuration values:

```
VUE_APP_FIREBASE_API_KEY=your-api-key-here
VUE_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VUE_APP_FIREBASE_PROJECT_ID=your-project-id
VUE_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VUE_APP_FIREBASE_APP_ID=your-app-id
```

### 5. Initialize the Database (Optional)

To populate your database with sample books:

1. Go to the Firestore Database in your Firebase Console
2. Create a collection called "books"
3. Add documents with the following fields:
   - title (string): Book title
   - author (string): Book author
   - category (string): Book category
   - description (string): Book description
   - status (string): "available", or "donated"
   - condition (string): Book condition
   - addedDate (timestamp): When the book was added
   - donorId (string): ID of the donor (if using authentication)

## Running Without Firebase (Development Mode)

BookBuddy includes a local storage fallback for development without Firebase. To use this mode:

1. Don't create a `.env` file (or rename it temporarily)
2. The app will automatically use the fallback local storage database

## Customizing for Your School

You may want to customize:

- School name and logo in `src/assets/`
- Color scheme in `src/App.vue`
- Contact information in the footer

## Deploying Your BookBuddy Instance

1. Build your project: `npm run build`
2. Deploy to Firebase Hosting:
   ```
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Logo Credits

Shoutout to Yaashica! 🥳

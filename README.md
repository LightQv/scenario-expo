# 🎬 SCENARIO EXPO

**React Native mobile app for Scenario**  
Track your movie & TV show viewing history, manage watchlists, and discover new content with a beautiful iOS experience powered by Expo and React Native.

## 📊 Badges

<p align="left">
  <a href="https://github.com/LightQv/scenario-mobile-app/stargazers">
    <img src="https://img.shields.io/github/stars/LightQv/scenario-expo?style=for-the-badge&logo=github" alt="GitHub stars"/>
  </a>
  <a href="https://github.com/LightQv/scenario-mobile-app/issues">
    <img src="https://img.shields.io/github/issues/LightQv/scenario-expo?style=for-the-badge&logo=github" alt="GitHub issues"/>
  </a>
  <a href="https://github.com/LightQv/scenario-mobile-app/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/LightQv/scenario-expo?style=for-the-badge" alt="License"/>
  </a>
</p>

## 🛠️ Technologies

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![iOS](https://img.shields.io/badge/iOS-000000?style=for-the-badge&logo=ios&logoColor=white)

## ✨ Features

### 🔐 Authentication
- ✅ User registration with email & password
- 🔑 Secure login with JWT tokens
- 🔄 Password reset via email
- 👤 Account management and profile settings

### 🎬 Content Discovery
- 🔍 Search movies, TV shows, and actors
- 🌟 Browse trending content and top-rated titles
- 🎭 Explore by genre and filter results
- 📅 View release dates, runtime, and ratings
- 🎥 Watch trailers directly in-app
- 📊 Access detailed information about cast, crew, and seasons

### 📝 Watchlists
- ➕ Create multiple custom watchlists
- 📂 Add movies and TV shows to any list
- 🔄 Move content between watchlists
- 🗑️ Delete items from lists
- 📊 Sort by title, date, or rating
- 🔍 Filter by media type (movies/TV shows)

### 👁️ Viewing History
- ✅ Mark content as watched
- 📊 Track viewing statistics
- 🎬 View watched movies and episodes
- 📈 Analyze viewing habits by genre and year

### 🎨 User Experience
- 🌓 Automatic dark/light mode support
- 🎨 Native iOS design with platform colors
- ⚡ Smooth animations with Reanimated
- 🖼️ Beautiful image loading with blur hash
- 🌐 Multi-language support (EN/FR)
- 📱 Optimized for iOS devices

## 🏗️ Project Structure

```
app/
├── (modal)/           # Modal screens (login, register, settings)
├── (tabs)/            # Tab navigation screens
│   ├── discover/      # Content discovery
│   ├── search/        # Search functionality
│   ├── top/           # Top-rated content
│   └── watchlist/     # Watchlist management
├── details/           # Content detail screens
├── profile/           # User profile
└── season/            # TV show season details

components/
├── actions/           # Action buttons (view, watchlist)
├── details/           # Detail screen components
├── discover/          # Discovery components
├── profile/           # Profile components
├── search/            # Search components
├── toasts/            # Toast notifications
├── ui/                # Reusable UI components
├── views/             # Viewing history components
└── watchlist/         # Watchlist components

contexts/
├── GenreContext.tsx   # Genre data management
├── ThemeContext.tsx   # Theme configuration
├── UserContext.tsx    # Authentication state
└── ViewContext.tsx    # Viewing history state

services/
├── config.ts          # App configuration
├── i18n.ts            # Internationalization
├── instances.ts       # API clients (TMDB, Backend)
├── searchHistory.ts   # Search history persistence
├── utils.ts           # Helper functions
└── validators.ts      # Form validation schemas
```

## ⚙️ Installation

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Xcode (for iOS development)
- Expo CLI (`npm install -g expo-cli`)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/LightQv/scenario-mobile-app.git
cd scenario-mobile-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.sample .env
# Edit .env with your configuration:
# - EXPO_ENV (DEV_OR_PROD)
# - EXPO_BACKEND_URL_* (API endpoints)
# - EXPO_TMDB_API_KEY and EXPO_TMDB_API_TOKEN
# - EXPO_WEB_CLIENT_URL
```

4. **Start the development server**
```bash
npm run dev
```

5. **Run on iOS**
```bash
npm run ios
```

## 🐳 Development Scripts

```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run with development client
npm run dev

# Rebuild iOS (clean build)
npm run rebuild:ios

# Clean all dependencies and rebuild
npm run clean:all

# Upgrade Expo SDK
npm run upgrade
```

## 🔧 Configuration

### Environment Variables

- `EXPO_ENV`: Set to `DEV` or `PROD`
- `EXPO_BACKEND_URL_*`: API endpoints for different platforms
- `EXPO_TMDB_API_KEY`: TMDB API key
- `EXPO_TMDB_API_TOKEN`: TMDB API token
- `EXPO_WEB_CLIENT_URL`: Web client URL for deep linking

### API Integration

The app connects to two APIs:
- **Backend API**: User authentication, watchlists, viewing history
- **TMDB API**: Movie and TV show data

## 📱 Key Features Implementation

### Authentication Flow
- Secure token storage with `expo-secure-store`
- HTTPOnly cookies for API requests
- Session expiration handling
- Automatic logout on token expiry

### Data Management
- Context-based state management (User, Views, Genres, Theme)
- Optimistic UI updates for better UX
- Local caching of frequently accessed data
- Efficient API calls with pagination

### UI/UX
- Native iOS components with `@expo/ui/swift-ui`
- Smooth animations with `react-native-reanimated`
- Adaptive theming based on system preferences
- Platform-specific styling with `PlatformColor`
- Image optimization with `expo-image` and blur hash

## 🌐 Internationalization

Supported languages:
- 🇬🇧 English (en)
- 🇫🇷 French (fr)

Translation files located in `public/locales/`

## 🔍 Key Dependencies

- **Expo SDK 54**: Core framework
- **React Native 0.81**: Mobile framework
- **Expo Router**: File-based navigation
- **Reanimated**: Smooth animations
- **Formik + Yup**: Form handling and validation
- **@expo/ui**: Native iOS components
- **i18n-js**: Internationalization

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

## 🔗 Related Projects

- [Scenario API](https://github.com/LightQv/scenario-api) - Backend API
- [Scenario Web](https://github.com/LightQv/scenario-web-client) - Web application

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

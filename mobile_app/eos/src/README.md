# Splash + Onboarding

## Files
- `screens/SplashScreen.tsx` — logo fade/scale in, gold underline sweep, hold, fade out (~5s), then `navigation.replace('Onboarding')`
- `screens/OnboardingScreen.tsx` — 3 swipeable slides, Skip (top right, any slide) → Login, dots, Next on slides 1-2, and on slide 3 two buttons: **Log In** / **Sign Up**
- `assets/logo.png` — your logo.svg rasterized to a transparent PNG (SVG isn't wired up in this project yet, so this avoids needing `react-native-svg-transformer`)

## Wire it in
Drop the two screens into your `screens/` folder and `logo.png` into `assets/`, then in `AppNavigator.tsx`:

```tsx
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// RootStackParamList
Splash: undefined;
Onboarding: undefined;

// Stack.Navigator
<Stack.Screen name="Splash" component={SplashScreen} />
<Stack.Screen name="Onboarding" component={OnboardingScreen} />
```

Set `initialRouteName="Splash"` (or wherever your auth-check logic currently starts) so the app opens on the splash first.

No LandingScreen used or referenced, per your note.

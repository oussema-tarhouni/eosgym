# Core scaffolding (AuthContext, AppNavigator, api, theme)

This fills the gap causing the bundling error — your screens already existed,
but `App.tsx` imported files that were never created.

## Where things go (all paths relative to your project root)
```
App.tsx                        ← replace/add
assets/logo.png                ← add (rasterized from your logo.svg)
src/theme/colors.ts             ← add
src/context/AuthContext.tsx     ← add
src/api/client.ts                ← add
src/api/auth.ts                  ← add
src/api/admin.ts                 ← add
src/navigation/AppNavigator.tsx  ← add
src/screens/SplashScreen.tsx     ← add
src/screens/OnboardingScreen.tsx ← add (this is the file you had as
                                    "DashboardScreen.tsx" — its function was
                                    already named OnboardingScreen internally,
                                    it was just misnamed on disk)
src/screens/HomeScreen.tsx       ← add — new, minimal placeholder for the
                                    'Dashboard' route (nothing you uploaded
                                    actually built this screen yet)
```

Move your existing uploaded screens (LoginScreen, SignupScreen, OtpScreen,
ForgotPasswordScreen, TermsScreen, PrivacyScreen, CategoryScreen, PlanScreen,
PendingScreen, AdminGateScreen, AdminScreen) into `src/screens/` if they
aren't already there — `AppNavigator.tsx` imports all of them from that path.

## Required npm packages
```bash
npx expo install @react-native-async-storage/async-storage
npm install axios @react-native-picker/picker
npx expo install expo-image-picker
```
(`@react-native-picker/picker` and `expo-image-picker` are only used by
`AdminScreen.tsx`.)

## Backend URL
Set your API base URL as an env var (create a `.env` at project root):
```
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000/api
```
Use your machine's LAN IP, not `localhost` — a physical device/simulator
can't reach your laptop's `localhost`.

## Notes / things you'll want to adjust
- **Landing screen removed on purpose** (per your last request). `AdminScreen.tsx`
  currently has `navigation.replace('Landing')` as a fallback when there's no
  admin token — that route no longer exists. Point it at `'AdminGate'` instead.
- `adminApi.list/create/update/remove/stats` are generic REST calls to
  `/admin/<resource>` — match these to your real backend routes.
- `AuthContext.register()` only creates the account; it does not log the user
  in (matches your `SignupScreen` → OTP → `Login` flow).
- `AppNavigator` picks the stack's `initialRouteName` (`Splash` → `Onboarding`/
  `Pending`/`Dashboard`) based on `accessToken` + `user.status`, and remounts
  when that changes — this is what the comment in `LoginScreen.tsx` referred
  to as "AppNavigator switches stacks automatically."

# Supabase Auth Setup for e-mahata

The application uses the official `@supabase/supabase-js` browser client in `client/src/lib/supabase.ts`. It reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the project environment. The anonymous/publishable key is appropriate for browser use; a Supabase service-role key must never be exposed through a `VITE_*` variable.

| Supabase Dashboard Area | Required Setting | Value for This App |
| --- | --- | --- |
| **Project Settings → API** | Project URL | The value configured as `VITE_SUPABASE_URL`. |
| **Project Settings → API** | Publishable/anonymous key | The value configured as `VITE_SUPABASE_ANON_KEY`. |
| **Authentication → Providers → Email** | Email provider | Enabled. |
| **Authentication → URL Configuration** | Site URL | The live e-mahata origin, such as `https://your-domain.example`. |
| **Authentication → URL Configuration** | Additional Redirect URLs | The live e-mahata origin and the development preview origin, if email confirmation is tested there. |

The sign-up flow sends Supabase confirmation emails to `window.location.origin`. If **Confirm email** is enabled, a user will see an in-app confirmation message and must verify the email before signing in. If it is disabled for a controlled testing environment, Supabase returns a session immediately after registration.

The public portal’s preserved HTML interface communicates only with the React application at the same origin. The React `AuthContext` owns the Supabase session, sends signed-in user email state to the navigation, and performs the sign-out request. This keeps the legacy visual shell intact while all credentials and session calls remain inside the typed React/Supabase integration.

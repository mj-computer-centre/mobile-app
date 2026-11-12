# Video playback: never leaving the app

The owner's firmest requirement: a video must play inside the app and **no tap may ever open YouTube** (or the browser). This page lists every way a YouTube embed can take someone out of an app, and what closes each one.

## How playback works

`features/player/lesson-player.tsx` renders `react-native-youtube-iframe`, which loads a small player page in a WebView; that page embeds YouTube's iframe player. The player page is ours (`apps/mobile/public/youtube-player.html`, from the library, MIT) and is served by the admin website, set with `EXPO_PUBLIC_PLAYER_PAGE_URL`. Until the website is deployed, the library's GitHub Pages copy is used.

## Exits and how each is closed

| Way out                                                                                                                                            | Closed by                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Tapping the YouTube logo, title, channel name, "Watch on YouTube", end-screen videos or ads navigates the top frame to youtube.com or an ad site.  | `onShouldStartLoadWithRequest` → `isAllowedPlayerRequest`: the top frame may only show our player page.                           |
| The library's own handler opens youtube.com links with `Linking.openURL` on iOS.                                                                   | Our handler replaces it (`webViewProps` are spread after the library's props).                                                    |
| `target=_blank` / `window.open`: on Android, react-native-webview opens a new WebView without a client, which hands the URL to the system browser. | `setSupportMultipleWindows={false}` (new windows navigate the same WebView, so the policy sees them) and an `onOpenWindow` no-op. |
| URLs that fail the WebView's `originWhitelist` are passed to `Linking.openURL`.                                                                    | Keep the library's `originWhitelist={['*']}` so every URL reaches our policy. Never narrow it.                                    |
| `intent://`, `vnd.youtube:`, `market://` links start other apps.                                                                                   | The policy allows only `https:` (and `about:blank`).                                                                              |
| The embed frame navigating to a YouTube page turns the player into the YouTube website.                                                            | Inner frames may not load `youtube.com` pages outside `/embed/`.                                                                  |
| Long-press link previews (iOS).                                                                                                                    | `allowsLinkPreview={false}`.                                                                                                      |
| YouTube's end screen of suggested videos.                                                                                                          | `rel: false` limits it to the same channel, and our "Up next" card covers the player when a video ends.                           |

The policy is pure TypeScript with unit tests (`packages/shared/src/player/navigation-policy.test.ts`).

## What remains true

- The YouTube logo stays visible: YouTube's terms require the branding. Tapping it does nothing.
- YouTube's terms discourage blocking parts of the player; the owner accepted this small risk (plan, "Things to know").
- YouTube may show ads; the app cannot remove them.
- An Unlisted video can still be watched on YouTube by anyone who has its link. Paid courses will move to private hosting (PAY-02).
- On the **web** admin, browsers do not let a page stop links inside a cross-origin iframe; the guarantee is for the Android app.
- Videos with "Allow embedding" switched off, or set to Private, cannot play. The admin panel flags them when they are added (`playbackProblem`).

## Manual check on a real phone (every release)

See the "No-exit checklist" in [TESTING.md](../TESTING.md).

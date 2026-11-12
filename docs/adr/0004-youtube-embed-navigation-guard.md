# 0004 — YouTube embed with a navigation guard

**Status:** Accepted, 24 Oct 2026

## Context

Videos are on the centre's YouTube channel (no hosting cost). They must play inside the app and never open YouTube. Options considered: (a) official embed with blocked navigation; (b) paid private hosting (Bunny Stream, VdoCipher); (c) extracting raw streams from YouTube, which breaks YouTube's terms and Play Store policy. The STP Computer Education app (studied with REA) uses none of these: it opens playlists in the YouTube app, which is what the owner wants to avoid.

## Decision

(a): `react-native-youtube-iframe` in a WebView, with every navigation passed through a pure, unit-tested policy (`isAllowedPlayerRequest`), new windows disabled, and the player page self-hosted on the admin website. Details and the full list of exits: [video-playback.md](../architecture/video-playback.md).

## Consequences

- Zero hosting cost; the owner keeps uploading to YouTube and pastes links (single videos or whole playlists).
- Small terms-of-service risk, accepted by the owner. YouTube branding and possible ads remain.
- Unlisted links can be shared outside the app; paid content will need (b) (PAY-02).

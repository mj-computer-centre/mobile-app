# 0011 — Pictures are kept on Cloudinary, uploaded through an edge function

**Status:** Accepted, 28 Nov 2026

## Context

Course covers and home banners were files in a public Supabase Storage bucket (`media`), uploaded straight from the app and shown at full size. A phone photo is 1 to 3 MB and a course list shows six or more covers, on mobile data in Makhdumpur. The owner opened a Cloudinary account for the centre and asked for the pictures to go there, the way the sister project (a restaurant's ordering site) keeps its dish photos.

Cloudinary needs an API secret to accept an upload, and the app has no server of its own: anything in the app's bundle can be read by every student.

## Decision

- **Pictures live on Cloudinary**, in the app's own folder (`CLOUDINARY_FOLDER`, `mishra-computer-centre`): covers in `courses/`, banners in `banners/`. PDFs stay in Supabase Storage: they are not pictures, and they will need signed URLs when paid courses arrive (PAY-03).
- **The app never holds a Cloudinary key.** It sends the picture's bytes to the `upload-image` edge function, which checks that the caller is staff, refuses anything over 5 MB or that is not a JPG, PNG or WebP by its first bytes, and makes the signed upload. The keys are Supabase function secrets (`supabase/functions/.env` on a developer's machine, git-ignored).
- **The row stores the picture's full URL** in the columns that already existed (`courses.thumbnail_path`, `banners.image_path`). No migration: a value that starts with `https://res.cloudinary.com/…/image/upload/` is a Cloudinary picture, and anything else is a path in the old `media` bucket, so pictures uploaded before this still show. Nothing else is ever treated as a URL.
- **The app asks Cloudinary for the size it shows**: cropped to 16:9 from the centre, one of two widths (960 for covers, 1280 for banners), `f_auto,q_auto`. Two widths only, so each picture is resized twice at most.
- **Removal goes through `remove-images`**, which deletes only pictures inside the app's folder that no course or banner still uses. The app calls it after replacing or deleting; a failure there never fails the change.
- **The crop is from the centre, not Cloudinary's automatic one.** Tried both on AI pictures: the automatic crop sometimes moved to include a stray headline, and the admin should get the crop they saw when choosing.

## Alternatives considered

- **Signed upload straight from the app** (the function returns a signature, the app posts to Cloudinary). One hop fewer, but a second upload path that behaves differently on Android and the web, and it could not be tried on a phone here. The picture is at most 5 MB and staff upload rarely; going through the function reuses the way the app already sends files.
- **A new column for the URL.** Cleaner names, but every query, mapper, public function and test that reads the cover would change for no difference in behaviour.
- **A database check that the value is a Cloudinary URL.** Not needed for safety (the app treats nothing else as a URL) and it would make pushing the migration depend on whatever old values production holds.

## Consequences

- A cover reaches a student at 15 to 30 KB instead of the uploaded megabyte or more.
- The centre depends on one more service. If Cloudinary is unreachable, covers fall back to nothing shown; courses, videos, notes and tests are unaffected.
- Until the secrets are set and the functions deployed on a project, staff see "Pictures cannot be saved yet" when adding a picture.
- The privacy policy names Cloudinary: it sees the IP address of whoever loads a picture, like any image host.
- Pictures in the `media` bucket stay until someone replaces them (IMG-07 moves the rest).
- A photo is still uploaded at full size and shrunk by Cloudinary (kept at 2000 px at most). Shrinking it on the phone first would save the admin's data (IMG-06).

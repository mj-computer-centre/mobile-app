# 0012 — AI course pictures: drawn on Cloudflare, stored only when chosen, no course words in the prompt

**Status:** Accepted, 28 Nov 2026

## Context

Most courses had no cover: the owner has no photos of "Tally" or "DCA", and a course without a picture shows a coloured panel. The owner asked for the admin to be able to make a picture with AI while adding a course, or change it later, the way the sister project (a restaurant's ordering site) makes pictures of dishes.

## Decision

- **FLUX.1 [schnell] on Cloudflare Workers AI**, called from the `course-image` edge function over Cloudflare's REST API. Free: each account gets 10,000 neurons a day. A picture (always 1024×1024, 4 steps) costs about 173: a new account's allowance ran out after 58 pictures while this was being built, which fits 4 tiles at 4.8 plus 9.6 a step each. So about 57 pictures a day are free. The model's licence allows commercial use. The account id and token are function secrets.
- **Four pictures per press, one request each.** The model accepts only a prompt and a step count (no seed), so the four differ by style: a flat illustration, an isometric one, a photograph of hands typing, and a bold drawing of plain shapes. The app asks for each on its own and shows it when it arrives (2 to 5 seconds).
- **Nothing is stored until the admin chooses.** The function returns a picture as a data URL and keeps nothing. The chosen picture is saved exactly like an uploaded one ([ADR 0011](0011-pictures-on-cloudinary.md)). On the New course page it is stored only when the course is created.
- **The course's name and description are never sent to the model.** FLUX paints any word it is given across the picture, usually misspelt ("Accourtn bellirg" for "Accounting and billing"), and negative instructions do not stop it. So the words only choose things to draw from a short list of the kinds of course a computer centre runs (a ledger and calculator for accounting, a chart on the screen for spreadsheets, a graduation cap for a diploma); a course that matches nothing gets a plain computer scene. The admin can add things to show in their own words. With this, 44 test pictures in a row had no writing on them; before it, about half did.
- **No faces, no brands.** The takes show hands at most, black PCs rather than "a desktop computer" (which comes out as one maker's computer with its logo), and a blurred wall rather than a classroom (which brings a whiteboard full of scribbles).
- **Staff only, 40 pictures a day**, counted in the database per UTC day (`use_ai_image_allowance`), as Cloudflare's allowance resets. About 6,900 neurons: inside the free allowance, whatever the app does. On Cloudflare's free plan a used-up allowance means a refused picture, not a charge, and the app then says to try tomorrow or upload a picture.
- **The prompt lives with the function** (`supabase/functions/_shared/cover-prompt.ts`) and is unit-tested from `packages/shared`, like the request and response contract.

## Alternatives considered

- **Sending the name and description, with "no text" in the prompt.** Tried in four wordings; the model kept writing them.
- **A language model to turn the course into things to draw.** It would handle any subject, but adds a second model call, a second way to fail and a way for odd text to reach the image model. The list covers what the centre teaches; the admin's own words cover the rest.
- **Stock photos.** No key needed for some services, but poor matches for Indian classrooms and unclear licences.

## Consequences

- A cover is one press and one choice away, at no cost.
- The pictures suggest a subject; they are not photos of the centre. The sheet says so, and asks the admin to choose one with no writing on it, since the model can still slip.
- A subject outside the list gets a generic picture unless the admin says what to show. Adding a subject is one line in `cover-prompt.ts` with a test.
- The dev bypass cannot call a function, so it shows four stand-in drawings (`src/dev/demo-covers.ts`).

# Mishra Computer Centre App — Plan

Prepared for Mishra Computer Centre · 24 October 2026

## 1. Summary

We will build a free Android app for Mishra Computer Centre. Students watch the centre's YouTube lessons and read PDF notes without ever leaving the app.

You control everything. You create courses, add units, paste YouTube links and upload PDFs, from your phone or a computer. Students see each change straight away, with no app update.

Anyone can install the app and sign in with Google. It is free now, and paid courses can be switched on later without rebuilding the app.

Everything is in your name: the Play Store listing, the student data and all accounts. The only cost to launch is the $25 Play Store fee, paid once.

## 2. What students will see

1. **Sign in** with one tap using their Google account.
2. **One-time form:** phone number, the course they are interested in, and village or city.
3. **Home:** banner slider, course cards and newly added lessons.
4. **Courses:** every course card shows **₹0**, the original price crossed out (for example ~~₹14,999~~) and **100% OFF**.
5. **Course page:** picture, short description, "About this course" points (duration, support timings, certificate), then the units: _Unit 1 – Fundamentals of Computer_, _Unit 2 – …_
6. **Video screen:** the video plays inside the app. Below it are the unit's other lessons and the notes PDF. The next video starts by itself.
7. **PDF notes** open inside the app and work without internet after the first open.
8. **Contact:** call, WhatsApp, map and timings. You can change these details any time.
9. **Profile:** edit details, share the app, delete account, log out.

No button anywhere in the app opens YouTube or the browser.

## 3. What you can do (admin panel)

The admin panel works in two places: an **Admin tab inside the app**, which only you and your staff see, and a **website** for when you are on a computer.

- **Courses:** create, edit, publish or hide, and reorder. Each course has a picture, description, duration, the original price to show crossed out, and "About this course" points.
- **Units:** add a new unit to a course, or add a unit you already made for another course.
- **Videos:** paste one YouTube video link, or paste a playlist link to add all its videos in one go. The title and thumbnail fill in automatically.
- **PDFs:** upload notes for a whole unit, or attach a PDF to one video.
- **Warnings:** the app tells you if a YouTube video cannot play in apps (embedding switched off, or the video is Private).
- **Home banners and contact details:** change them any time.
- **Students:** see everyone who signed up (name, email, phone, course of interest) and download the list for Excel from the website.
- **Staff:** add or remove people who can upload content. Only you can do this.

## 4. How courses are organised

Every course is made of units, and every unit holds YouTube videos and PDF notes. A unit is made once and can be added to any number of courses.

```
ADCA -----------+
DCA ------------+-->  MS Word unit (made once)
Basic Computer -+       |
                        +-- Video 1  (YouTube link, plays in the app)
                        |     +-- Notes PDF for this video    <- topic-wise
                        +-- Video 2
                        +-- Unit notes PDF                    <- unit-wise
```

- If you edit the MS Word unit, ADCA, DCA and Basic Computer all show the change.
- Unit numbers follow each course's own order, so MS Word can be Unit 4 in ADCA and Unit 2 in Basic Computer.
- A single video or PDF can also sit in more than one unit.

## 5. What we learned from STP Computer Education

We studied the STP Computer Education app (1 lakh+ downloads), including its code. Its look is worth copying; how it works underneath is not.

|                          | STP Computer Education                             | Our app                                                                 |
| ------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------- |
| Where videos play        | Opens the YouTube app                              | Inside the app, always                                                  |
| Adding a course or video | Their developer must release a new app version     | You add it from the admin panel; live at once                           |
| PDF notes                | Opens their website in the browser                 | Opens inside the app, in the same unit as the videos                    |
| Login                    | None                                               | Google sign-in; you get each student's phone number and course interest |
| Shared units             | The same playlist link copied into up to 5 courses | A unit made once and added to any course                                |
| Ads                      | Google banner and full-screen ads                  | None                                                                    |

What we copy from STP:

- Course cards showing ₹0, the crossed-out original price and "100% OFF".
- "About this course" points on each course page.
- Unit names like "Unit 1 – Fundamentals of Computer".
- Home banners and a Contact tab.
- Later: a gallery of certified students, and topic quizzes with a typing test.

Sources: [STP on Google Play](https://play.google.com/store/apps/details?id=com.stp_amit.stp_computer_education), [STP website](https://www.stpcomputereducation.com), and the app's own code (version 6.0).

## 6. Costs

| Item                                    | Cost                       | Notes                                                |
| --------------------------------------- | -------------------------- | ---------------------------------------------------- |
| Google Play developer account           | $25, once                  | Paid by a card that works for international payments |
| Supabase (database, login, PDF storage) | Free                       | Free plan: 1 GB of files, 5 GB of downloads a month  |
| Expo (builds the app)                   | Free                       | Free plan has a monthly build limit                  |
| Admin website hosting                   | Free                       |                                                      |
| YouTube video details and playlists     | Free                       | Within Google's free daily limit                     |
| Building the app                        | Free                       | Built within the family                              |
| If the app grows beyond the free plan   | $25 a month (Supabase Pro) | Only needed once usage passes the free limits        |

## 7. Build steps and launch

1. **Accounts (you, start now).** Play Store account, Supabase, Google Cloud and Expo, all on the centre's Gmail. Google's identity check for the Play account can take a few days.
2. **Foundation.** App skeleton, database and Google sign-in.
3. **Admin panel.** Courses, units, videos, PDFs, banners, contact details, students list and the admin website.
4. **Student app.** Home, courses, video player, PDF viewer, contact and profile.
5. **Testing.** At least 12 students install a test version and use it for 14 days. Google requires this for new personal Play accounts.
6. **Launch** on the Play Store.

Dates will be fixed once your course list, videos and accounts are ready.

**Ready to launch when:**

- [ ] You can create ADCA with its units, add a playlist to a unit, attach a PDF and publish it, and students see it at once.
- [ ] No tap anywhere opens YouTube or the browser.
- [ ] PDFs open in the app and work offline after the first open.
- [ ] Every signup appears in your Students list with name, email, phone and course of interest.
- [ ] The app runs well on a cheap, older Android phone on slow internet.

## 8. What I need from you

**Accounts**

- [ ] A new Gmail ID only for the centre. It will own everything.
- [ ] A Play Store developer account ($25). A personal account needs your ID proof; an organisation account needs a D-U-N-S number and suits only a registered business.
- [ ] Gmail IDs of staff who will upload content.
- [ ] 12 or more students with Android phones and Gmail, for 14 days of testing.

**Courses and content**

- [ ] Full course list. For each: duration, a 2–3 line description, and the original price to show crossed out.
- [ ] Units of each course in teaching order, and which units are common to several courses.
- [ ] YouTube channel link. Videos must be Public or Unlisted, with embedding left on.
- [ ] Which PDF notes are ready, and which unit or video each belongs to.
- [ ] Who will add videos and PDFs every week.

**Branding and contact**

- [ ] App name, a high-quality logo, and preferred colours.
- [ ] Phone, WhatsApp, email, full address, Google Maps link and timings.
- [ ] 4–5 photos of the centre, classroom and computers for the Play Store page.

**Decisions**

- [ ] What else to ask at signup besides phone and course (village or city, qualification, age).
- [ ] App language: Hindi, English or both.
- [ ] Target launch date, for example the start of a new batch.

## 9. Later phases

**After launch**

- Notification to students when a new lesson is added.
- "Continue watching" and progress tracking.
- Search, and a Hindi/English switch.
- A gallery of certified students.
- Topic quizzes and a typing test.

**Paid courses (when you decide)**

- Mark chosen courses as paid; only enrolled students can open them.
- Collect payment in a way that follows Google Play's billing rules.
- Move paid videos off YouTube to private video hosting, because anyone with an Unlisted link can watch it.
- Allow one phone per account and block screenshots.

## 10. Things to know

- **YouTube logo:** it stays visible in the player, but tapping it does nothing. YouTube's terms discourage blocking parts of its player, so there is a small risk.
- **YouTube ads:** YouTube can show its own ads on videos, including inside the app. We cannot turn these off.
- **Unlisted is not private:** anyone with the link can watch the video on YouTube. That is fine while courses are free.
- **Free plan limits:** about 5 GB of PDF downloads a month. PDFs are saved on the phone after the first open, which keeps usage low.
- **Play Store rules:** a privacy policy, a Data safety form and an account deletion option are required. All three are part of the plan.

## 11. Update, 28 November 2026

Four things were added after this plan was agreed. Nothing above was taken away.

**A website anyone can open.** The website used to show only a sign-in screen. It now has public pages: a home page with your courses, the outline of each course, a Tests page, your contact details, the privacy policy and a page that explains how to delete an account. Google Play asks for the last two; their addresses are `https://<your website>/privacy` and `https://<your website>/delete-account`. Students can also sign in on the website and use it exactly like the app. Videos and notes still need sign-in.

**Tests.** In Admin → Tests you create a test: its name, when it opens and closes, how many minutes students get, and the questions (typed one by one, or pasted from Word or WhatsApp in one go). Students take it in the new Tests tab.

- A student can start any time between the opening and closing time. They get the minutes you set, or until the closing time if that comes first.
- Each student takes a test once. They see their score at once.
- After the test closes, students see their rank and, if you allow it, the correct answer to every question.
- If someone missed the test, switch on "Let students who missed it take it later". Their attempt is marked as taken late. You can switch this on after the test is over.
- You see everyone's score, can download the list for Excel, can open one student's answers, and can let one student take the test again.

**A new look.** The app and the website were redesigned around one idea: students come to you to learn the keyboard, so buttons look and press like keys. The colours are ink blue and marigold yellow and the app icon is an "M" key. All of this changes easily when you give us your own logo and colours.

**Pictures for courses.** When you add a course you can now give it a cover picture on the same page, and change or remove it later. There are two ways: upload a photo from your phone, or press **Make one with AI**, which draws four pictures for the course in about ten seconds; you choose one. The AI pictures only suggest the subject (a ledger and a calculator for Tally, a keyboard for typing); a real photo of your classroom is still better. Pictures are kept on your Cloudinary account, which sends students a small, fast-loading copy. Both services are free at your size.

What we still need from you is unchanged (section 8), plus: read the new privacy policy, and after the app is on the Play Store paste its link in Admin → Centre details so the website can show a "Get the Android app" button.

## Appendix: technical details (for the developer)

| Part           | Choice                                                                                                                                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App            | React Native with Expo (TypeScript, Expo Router, development builds)                                                                                                                                                       |
| Video          | `react-native-youtube-iframe`; all navigation out of the player blocked; own "next lesson" screen at the end; fullscreen and landscape                                                                                     |
| PDF            | `react-native-pdf`, cached with `expo-file-system`                                                                                                                                                                         |
| Login          | `@react-native-google-signin/google-signin` with Supabase Auth (`signInWithIdToken`); Supabase OAuth on the web                                                                                                            |
| Backend        | Supabase: Postgres with row-level security, Storage bucket `notes`, Edge Functions                                                                                                                                         |
| Pictures       | Cloudinary for course covers and banners; Cloudflare Workers AI (FLUX.1 schnell) for AI covers. Keys are function secrets                                                                                                  |
| Edge Functions | `youtube-meta`: title, thumbnail, duration, playlist import, embeddable and privacy check via YouTube Data API v3, key stored as a secret. `delete-account`. `upload-image`, `remove-images`, `course-image` for pictures. |
| Website        | Same Expo code exported for web (public pages, student app, admin panel), hosted as a static site under the owner's account                                                                                                |
| Push (later)   | `expo-notifications`                                                                                                                                                                                                       |

**Database**

```
profiles         id, full_name, email, phone, city, interested_course_id, created_at
staff            user_id, role (owner | admin)            -- only the owner can change
courses          id, title, short_description, thumbnail_url, duration_text,
                 original_price, price (0), is_paid (false), about_points[],
                 is_published, sort_order
sections         id, title, description                    -- reusable units
course_sections  course_id, section_id, sort_order
lessons          id, type (video | pdf), title, youtube_video_id, thumbnail_url,
                 duration_seconds, pdf_path, notes_pdf_id   -- reusable
section_lessons  section_id, lesson_id, sort_order
banners          id, image_url, course_id, sort_order, is_active
app_settings     phone, whatsapp, address, map_link, timings, social_links, play_store_url
tests            id, title, description, course_id, duration_minutes, starts_at, ends_at,
                 allow_late, show_review, pass_percent, is_published
test_questions   id, test_id, position, prompt, options[], marks
test_answer_keys question_id, correct_option, explanation   -- staff only
test_attempts    id, test_id, user_id, started_at, deadline_at, submitted_at, is_late
test_answers     attempt_id, question_id, selected_option
```

**Access rules**

- Signed-in users can read content; only staff can write. Visitors who have not signed in can read course names and outlines, nothing that plays.
- Tests are timed and marked in the database. Students never read the answer key from a table.
- Users can read and update only their own profile.
- Roles live in `staff`, not in `profiles`, so a student cannot promote themselves.
- Storage bucket `notes`: public read, staff-only upload. Switch to signed URLs when paid courses start.

**Release checklist**

- Add the Play App Signing SHA-1 to the Google Cloud Android OAuth client, or Google sign-in fails in the Store build.
- Free Supabase projects pause after 7 days without activity; resume from the dashboard during development.
- Test video playback on 2–3 real Android phones, including a low-end one, before each release.

# Design system

Everything visual comes from `apps/mobile/src/ui`: tokens in `theme.ts`, components in `components/`. Screens import from `@/ui` only and never define colours, font sizes or spacing of their own.

## The idea

Students come to the centre to learn the keyboard, so **the things you press are keys**. A key has a face and a darker edge below it, and the face goes down onto the edge when pressed. Buttons, course tiles, answer options, the question grid of a test and the days of the date picker are all the same shape (`Key`).

- **Ink blue** (`hero`) is the brand surface: the website's top section, the sign-in panel, the next-test card, the footer.
- **Cobalt** (`primary`) is what can be chosen: links, selected tabs, ordinary buttons.
- **Marigold** (`accent`) is the Enter key: the one action a screen most wants taken.
- The page is a cool paper white (`background`); dark mode is a deep ink night. Both sets live side by side in `theme.ts`.

The centre has not supplied a logo or colours yet (backlog OPS-07). Until it does, the mark is the **M key** (`BrandMark`). To rebrand: change the palette in `theme.ts`, `BRAND_INK` in `app.config.ts` and the colours in `public/index.html`, and replace the pictures in `apps/mobile/assets/images` (icon, adaptive icon layers, splash mark, favicon).

## Rules

1. **One accent button per screen**, for its main action (Start learning, Start test, Submit). `primary` for ordinary confirming actions (Save, Add), `secondary` for the rest, `danger` for deleting, `ghost` for cancel and close. Admin screens do not use `accent`.
2. **Keys for actions, ruled lists for content.** Rows that belong together sit on one surface with hairlines between them (`ListGroup` + `ListRow`). Not a card per row, and no card inside a card. Most page content sits straight on the background.
3. **Only keys move.** A key goes down when pressed; a row changes its background. No entrance animations, no scaling of rows.
4. **Real numbers only.** The website's counts come from the database (`public_site_stats`). No invented figures or testimonials.
5. **Plain words.** Sentence case. No all-capitals labels above headings, no jargon, no emoji as icons. A button says what it does ("Save changes", not "Submit"); an empty screen says what will appear and why it is empty.
6. **Both themes.** Every colour is a theme token (`useTheme().colors`). The only literals are white on pictures and on a course's own tint.
7. **Loading has a shape.** First loads of lists and grids show skeletons (`SkeletonRows`, `CourseGridSkeleton`) in the layout that is coming. A refetch keeps the old content on screen.

## Type

Anek Latin (Ek Type, Mumbai) carries what the app itself says: headings, buttons, tabs, numbers and key legends. What people read and write (lesson titles, names, notes, body text) stays in the phone's own font, which also covers Hindi.

Each weight is its own family (`fonts.display`, `fonts.heading`, `fonts.label`), loaded in `app-shell/fonts.ts`. Styles choose a family and never set `fontWeight` alongside it: Android would fake a bolder cut on top of the real one. Use `AppText` variants (`hero`, `display`, `title`, `heading`, `subheading`, `body`, `bodyStrong`, `label`, `caption`, `tag`, `numeral`) rather than font sizes.

## Spacing

`spacing` has distinct steps so closeness carries meaning: rows sit closer than groups, groups closer than sections. `Screen` puts sections `spacing.xl` apart; inside a section use `spacing.md`. Screen edges are `spacing.lg` on a phone.

## Components

| Need                          | Use                                                                       |
| ----------------------------- | ------------------------------------------------------------------------- |
| A page                        | `Screen` (`width="wide"` for grids; `bottomBar` for pinned actions)       |
| A public web page             | `SiteBody` / `SitePage` and `Section` from `features/site`                |
| An action                     | `Button`; `IconButton` for icon-only tools (always with a `label`)        |
| A key that is not a button    | `Key` (any content), `KeyCap` (a legend: option letter, number, the mark) |
| Rows that belong together     | `ListGroup` + `ListRow`, `Divider`                                        |
| One self-contained thing      | `Card` (sparingly)                                                        |
| A heading over a block        | `SectionHeader` (`large` on public pages)                                 |
| Two to four views of one list | `SegmentedControl`                                                        |
| A small job over the page     | `Sheet` (never React Native's `Modal` directly)                           |
| A message about the page      | `Notice` (tone: primary, success, warning, danger)                        |
| A status word                 | `Badge`                                                                   |
| A number with what it counts  | `Stat`                                                                    |
| Text, switches, dates         | `TextField` / `FormTextField`, `SwitchRow`, `DateTimeField`               |
| A person                      | `Avatar`                                                                  |
| Loading, empty, failed        | `Skeleton`, `SkeletonRows`, `LoadingState`, `EmptyState`, `ErrorState`    |
| Pictures                      | `Thumbnail` (16:9, optional corner caption), `CourseCover` (in catalog)   |
| The centre's mark and name    | `BrandMark`, `BrandLockup`                                                |

Feature-specific pieces live in their feature: `CourseCard`, `UnitList`, `LessonRow` (catalog); `CalendarLeaf`, `TestRow`, `NextTestCard`, `OptionKey`, `Scorecard`, `ReviewQuestionCard` (tests); `CourseKeyboard`, `SiteTopBar`, `SiteFooter` (site).

## Layout

`useLayout().isWide` (window width ≥ 900) switches from the phone layout to the desktop one. The same list of tabs is drawn three ways (`app/(tabs)/_layout.tsx`): the bottom bar on a phone, a sidebar on a wide screen, and the public website's top bar for a visitor who has not signed in.

## Accessibility

Tap targets are at least 44 points high. Icon-only buttons carry a label. Keys used as choices announce `radio` and their selected state. Focus is visible on the web (keys draw an outline). Text scales with the system setting; rows grow instead of clipping.

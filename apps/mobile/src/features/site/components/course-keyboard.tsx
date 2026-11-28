import type { CourseSummary } from '@mcc/shared';
import { StyleSheet, Text, View } from 'react-native';

import { courseShortName, courseTint } from '@/features/catalog';
import { AppText, fonts, Icon, Key, keyDepth, radius, spacing, type IconName } from '@/ui';

const MAX_COURSE_KEYS = 4;

export interface CourseKeyboardProps {
  /** Undefined while the course list is loading. */
  courses: CourseSummary[] | undefined;
  onOpenCourse: (course: CourseSummary) => void;
  onOpenCourses: () => void;
  onOpenTests: () => void;
  onStart: () => void;
}

/**
 * The website's opening picture: a corner of a keyboard whose keys are the centre's own
 * courses. Every key works. The course keys open their course, the row beneath says what is
 * inside one, and Enter starts.
 */
export function CourseKeyboard({
  courses,
  onOpenCourse,
  onOpenCourses,
  onOpenTests,
  onStart,
}: CourseKeyboardProps) {
  const shown = courses?.slice(0, MAX_COURSE_KEYS) ?? [];

  return (
    <View style={styles.board}>
      {courses === undefined || shown.length > 0 ? (
        <View style={styles.row}>
          {courses === undefined
            ? [0, 1, 2].map((index) => (
                <Key
                  key={index}
                  tone="hero"
                  depth={keyDepth.lg}
                  cornerRadius={radius.lg}
                  style={styles.grow}
                  faceStyle={styles.courseFace}>
                  <View />
                </Key>
              ))
            : shown.map((course) => (
                <Key
                  key={course.id}
                  tint={courseTint(course.title)}
                  depth={keyDepth.lg}
                  cornerRadius={radius.lg}
                  onPress={() => onOpenCourse(course)}
                  accessibilityLabel={`${course.title} course`}
                  accessibilityHint="Opens the course"
                  style={styles.grow}
                  faceStyle={styles.courseFace}>
                  <Text style={styles.legend} numberOfLines={1} adjustsFontSizeToFit>
                    {courseShortName(course.title)}
                  </Text>
                  <Text style={styles.courseTitle} numberOfLines={2}>
                    {course.shortDescription || course.title}
                  </Text>
                </Key>
              ))}
        </View>
      ) : null}

      {/* Offset like the rows of a real keyboard. */}
      <View style={[styles.row, styles.offset]}>
        <InsideKey icon="play-circle-outline" label="Videos" onPress={onOpenCourses} />
        <InsideKey icon="file-document-outline" label="Notes" onPress={onOpenCourses} />
        <InsideKey icon="clipboard-text-clock-outline" label="Tests" onPress={onOpenTests} />
      </View>

      <Key
        tone="accent"
        depth={keyDepth.lg}
        cornerRadius={radius.lg}
        onPress={onStart}
        accessibilityLabel="Start learning"
        accessibilityHint="Opens sign in"
        faceStyle={styles.enterFace}>
        <AppText variant="subheading" color="onAccent">
          Start learning
        </AppText>
        <Icon name="keyboard-return" size={24} color="onAccent" />
      </Key>
    </View>
  );
}

function InsideKey({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Key
      tone="hero"
      depth={keyDepth.md}
      onPress={onPress}
      accessibilityLabel={label}
      style={styles.grow}
      faceStyle={styles.insideFace}>
      <Icon name={icon} size={22} color="onHero" />
      <AppText variant="label" color="onHero" numberOfLines={1}>
        {label}
      </AppText>
    </Key>
  );
}

const styles = StyleSheet.create({
  board: { gap: spacing.md, width: '100%' },
  row: { flexDirection: 'row', gap: spacing.md },
  offset: { marginLeft: spacing.xl },
  grow: { flex: 1, minWidth: 0 },
  courseFace: {
    minHeight: 104,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  // White on a course's own colour, whatever the theme.
  legend: {
    color: '#FFFFFF',
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 30,
    includeFontPadding: false,
  },
  courseTitle: { color: 'rgba(255, 255, 255, 0.86)', fontSize: 12, lineHeight: 16 },
  insideFace: { minHeight: 64, gap: spacing.xs, paddingHorizontal: spacing.sm },
  enterFace: {
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },
});

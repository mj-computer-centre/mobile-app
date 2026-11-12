import { describe, expect, it } from 'vitest';

import { courseFormSchema, courseFormToRow, courseRowToForm, EMPTY_COURSE_FORM } from './course';
import { youtubeLinkSchema } from './content';
import { completeProfileSchema, completeProfileToUpdate } from './profile';
import { settingsFormSchema, settingsFormToRow } from './settings';
import { staffInviteSchema } from './staff';

describe('course form', () => {
  const values = {
    ...EMPTY_COURSE_FORM,
    title: '  ADCA ',
    originalPriceRupees: '14999',
    aboutPointsText: '12 months\n\n  Free certificate  \n',
    isPublished: true,
  };

  it('turns form values into a database row', () => {
    expect(courseFormSchema.safeParse(values).success).toBe(true);
    expect(courseFormToRow(values)).toMatchObject({
      title: 'ADCA',
      original_price_paise: 1499900,
      about_points: ['12 months', 'Free certificate'],
      is_published: true,
    });
  });

  it('round-trips through the edit form', () => {
    const row = { ...courseFormToRow(values), short_description: '', duration_text: '' };
    expect(courseRowToForm(row as Parameters<typeof courseRowToForm>[0]).originalPriceRupees).toBe(
      '14999',
    );
  });

  it('rejects a price with paise or letters', () => {
    expect(courseFormSchema.safeParse({ ...values, originalPriceRupees: '149.50' }).success).toBe(
      false,
    );
    expect(courseFormSchema.safeParse({ ...values, originalPriceRupees: 'free' }).success).toBe(
      false,
    );
  });

  it('rejects more than 12 about points', () => {
    const many = Array.from({ length: 13 }, (_, i) => `Point ${i}`).join('\n');
    expect(courseFormSchema.safeParse({ ...values, aboutPointsText: many }).success).toBe(false);
  });
});

describe('profile form', () => {
  it('normalises the phone number and stamps completion', () => {
    const values = { fullName: 'Asha', phone: '+91 98765 43210', city: '', interestedCourseId: '' };
    expect(completeProfileSchema.safeParse(values).success).toBe(true);
    expect(completeProfileToUpdate(values, new Date('2026-10-24T10:00:00Z'))).toEqual({
      full_name: 'Asha',
      phone: '9876543210',
      city: null,
      interested_course_id: null,
      profile_completed_at: '2026-10-24T10:00:00.000Z',
    });
  });

  it('asks for a real mobile number', () => {
    const result = completeProfileSchema.safeParse({
      fullName: 'Asha',
      phone: '123',
      city: '',
      interestedCourseId: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('youtube link form', () => {
  it('accepts video and playlist links, rejects others', () => {
    expect(youtubeLinkSchema.safeParse({ url: 'https://youtu.be/HP8eBnwVZGg' }).success).toBe(true);
    expect(youtubeLinkSchema.safeParse({ url: 'https://example.com' }).success).toBe(false);
  });
});

describe('settings form', () => {
  it('stores empty fields as null and normalises numbers', () => {
    const values = {
      centreName: 'Mishra Computer Centre',
      phone: '098765 43210',
      whatsapp: '',
      email: '',
      address: 'Near Government School, Makhdumpur',
      mapUrl: '',
      timings: '',
      youtubeUrl: '',
      facebookUrl: '',
      instagramUrl: '',
    };
    expect(settingsFormSchema.safeParse(values).success).toBe(true);
    expect(settingsFormToRow(values)).toMatchObject({
      phone: '9876543210',
      whatsapp: null,
      email: null,
    });
  });

  it('rejects links without https', () => {
    const result = settingsFormSchema.safeParse({
      centreName: 'X',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      mapUrl: 'maps.google.com',
      timings: '',
      youtubeUrl: '',
      facebookUrl: '',
      instagramUrl: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('staff invite', () => {
  it('needs an email address', () => {
    expect(
      staffInviteSchema.safeParse({ email: ' teacher@gmail.com ', role: 'admin' }).success,
    ).toBe(true);
    expect(staffInviteSchema.safeParse({ email: 'teacher', role: 'admin' }).success).toBe(false);
  });
});

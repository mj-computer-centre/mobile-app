import type { Database } from './generated/database.types';

export type { Database, Json } from './generated/database.types';

type PublicSchema = Database['public'];

export type TableRow<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TableInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];
export type TableUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];
export type ViewRow<T extends keyof PublicSchema['Views']> = PublicSchema['Views'][T]['Row'];
export type DbEnum<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];

export type StaffRole = DbEnum<'staff_role'>;
export type LessonKind = DbEnum<'lesson_kind'>;

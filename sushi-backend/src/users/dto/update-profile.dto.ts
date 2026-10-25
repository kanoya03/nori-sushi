export class UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  gender?: 'MALE' | 'FEMALE';
  birthDate?: string;
  contactEmail?: string | null;
}

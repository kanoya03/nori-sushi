export class CreateAddressDto {
  city: string;
  street: string;
  house: string;

  apartment?: string;
  entrance?: string;
  floor?: string;
  comment?: string;

  latitude?: number;
  longitude?: number;

  isDefault?: boolean;
}
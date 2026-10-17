export type ResolvedAddress = {
  city: string;
  street: string;
  house: string;
};

type MapboxFeature = {
  properties?: {
    feature_type?: string;
    name?: string;
    street?: string;
    address_number?: string;

    context?: {
      place?: {
        name?: string;
      };

      locality?: {
        name?: string;
      };

      district?: {
        name?: string;
      };

      street?: {
        name?: string;
      };

      address?: {
        street_name?: string;
        address_number?: string;
      };
    };
  };
};

type MapboxReverseGeocodingResponse = {
  features?: MapboxFeature[];
};

const MAPBOX_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<ResolvedAddress | null> => {
  if (!MAPBOX_TOKEN) {
    throw new Error(
      'EXPO_PUBLIC_MAPBOX_TOKEN is not configured'
    );
  }

  const url =
    `https://api.mapbox.com/search/geocode/v6/reverse` +
    `?longitude=${longitude}` +
    `&latitude=${latitude}` +
    `&types=address,street` +
    `&language=it,en` +
    `&access_token=${MAPBOX_TOKEN}`;

  const response =
    await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Mapbox reverse geocoding failed: ${response.status}`
    );
  }

  const data =
    (await response.json()) as
      MapboxReverseGeocodingResponse;

  const features =
    data.features ?? [];

  if (features.length === 0) {
    return null;
  }

  const addressFeature =
    features.find(
      (feature) =>
        feature.properties
          ?.feature_type ===
        'address'
    );

  const streetFeature =
    features.find(
      (feature) =>
        feature.properties
          ?.feature_type ===
        'street'
    );

  const feature =
    addressFeature ??
    streetFeature ??
    features[0];

  const properties =
    feature.properties ?? {};

  const context =
    properties.context ?? {};

  const city =
    context.place?.name ??
    context.locality?.name ??
    context.district?.name ??
    '';

  const addressContext =
    context.address;

  const street =
    (
      addressContext?.street_name ??
      context.street?.name ??
      properties.street ??
      (
        properties.feature_type ===
        'street'
          ? properties.name
          : ''
      ) ??
      ''
    ).trim();

  const house =
    (
      addressContext
        ?.address_number ??
      properties.address_number ??
      ''
    ).trim();

  return {
    city,
    street,
    house,
  };
};
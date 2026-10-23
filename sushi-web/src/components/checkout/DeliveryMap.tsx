import { useEffect, useRef, useState } from 'react';
import mapboxgl, { type Map as MapboxMap, type Marker } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocateFixed } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AppLanguage } from '../../i18n';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN?.trim();
type ResolvedAddress = { city: string; street: string; house: string };
type Props = {
  language: AppLanguage;
  onSelect: (location: {
    latitude: number;
    longitude: number;
    address: ResolvedAddress | null;
  }) => void;
};

async function reverseGeocode(
  latitude: number,
  longitude: number,
  language: AppLanguage,
  signal: AbortSignal,
): Promise<ResolvedAddress | null> {
  if (!TOKEN) {
    return null;
  }
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    types: 'address,street',
    language: language === 'ru' ? 'it,ru,en' : 'it,en',
    access_token: TOKEN,
  });
  const response = await fetch(`https://api.mapbox.com/search/geocode/v6/reverse?${params}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error('reverse-geocoding');
  }
  const data = (await response.json()) as {
    features?: Array<{
      properties?: {
        feature_type?: string;
        name?: string;
        street?: string;
        address_number?: string;
        context?: {
          place?: { name?: string };
          locality?: { name?: string };
          district?: { name?: string };
          street?: { name?: string };
          address?: { street_name?: string; address_number?: string };
        };
      };
    }>;
  };
  const features = data.features ?? [];
  if (!features.length) {
    return null;
  }
  const feature =
    features.find((item) => item.properties?.feature_type === 'address') ??
    features.find((item) => item.properties?.feature_type === 'street') ??
    features[0];
  const properties = feature.properties ?? {};
  const context = properties.context ?? {};
  return {
    city: context.place?.name ?? context.locality?.name ?? context.district?.name ?? '',
    street: (
      context.address?.street_name ??
      context.street?.name ??
      properties.street ??
      (properties.feature_type === 'street' ? properties.name : '') ??
      ''
    ).trim(),
    house: (context.address?.address_number ?? properties.address_number ?? '').trim(),
  };
}

export function DeliveryMap({ language, onSelect }: Props) {
  const { t } = useTranslation();
  const node = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const callback = useRef(onSelect);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const selectLocation = useRef<(longitude: number, latitude: number) => void>(() => undefined);
  useEffect(() => {
    callback.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!TOKEN || !node.current) {
      return;
    }
    mapboxgl.accessToken = TOKEN;
    const instance = new mapboxgl.Map({
      container: node.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [9.19, 45.465],
      zoom: 12,
      attributionControl: true,
    });
    map.current = instance;
    let geocodingRequest: AbortController | undefined;
    setBusy(false);
    setError('');
    const point = (lng: number, lat: number) => {
      if (!marker.current) {
        marker.current = new mapboxgl.Marker({ draggable: true, color: '#b3261e' })
          .setLngLat([lng, lat])
          .addTo(instance);
      } else {
        marker.current.setLngLat([lng, lat]);
      }
      marker.current.off('dragend', onDragEnd);
      marker.current.on('dragend', onDragEnd);
      void resolve(lat, lng);
    };
    selectLocation.current = point;
    const resolve = async (latitude: number, longitude: number) => {
      geocodingRequest?.abort();
      const request = new AbortController();
      geocodingRequest = request;
      setBusy(true);
      setError('');
      try {
        const address = await reverseGeocode(latitude, longitude, language, request.signal);
        if (!request.signal.aborted) {
          callback.current({ latitude, longitude, address });
        }
      } catch {
        if (!request.signal.aborted) {
          callback.current({ latitude, longitude, address: null });
          setError(t('checkout.mapError'));
        }
      } finally {
        if (!request.signal.aborted) {
          setBusy(false);
        }
      }
    };
    const onDragEnd = () => {
      const lngLat = marker.current?.getLngLat();
      if (lngLat) {
        void resolve(lngLat.lat, lngLat.lng);
      }
    };
    instance.on('click', (event) => point(event.lngLat.lng, event.lngLat.lat));
    return () => {
      geocodingRequest?.abort();
      selectLocation.current = () => undefined;
      marker.current?.remove();
      marker.current = null;
      instance.remove();
      map.current = null;
    };
  }, [language, t]);

  const locate = () => {
    if (!navigator.geolocation) {
      setError(t('checkout.locationUnavailable'));
      return;
    }
    setError('');
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!map.current) {
          return;
        }
        const { latitude, longitude } = position.coords;
        map.current?.flyTo({ center: [longitude, latitude], zoom: 16 });
        selectLocation.current(longitude, latitude);
      },
      () => {
        if (!map.current) {
          return;
        }
        setBusy(false);
        setError(t('checkout.locationDenied'));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };

  if (!TOKEN) {
    return (
      <div className="map-placeholder">
        <strong>{t('checkout.mapUnavailable')}</strong>
        <p>{t('checkout.mapFallback')}</p>
      </div>
    );
  }
  return (
    <div className="delivery-map-wrap">
      <div ref={node} className="delivery-map" aria-label={t('checkout.mapLabel')} />
      <button className="map-locate" type="button" onClick={locate} disabled={busy}>
        <LocateFixed size={17} />
        {t('checkout.currentLocation')}
      </button>
      {busy && (
        <span className="map-progress" role="status">
          {t('checkout.mapResolving')}
        </span>
      )}
      {error && (
        <span className="map-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Issue, Coordinates } from '@/utils/geoUtils';
import { ISSUE_CATEGORIES, ISSUE_STATUS } from '@/constants/categories';

// Fix for default markers in react-leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface MapViewProps {
  issues: Issue[];
  center: Coordinates;
  onIssueClick?: (issue: Issue) => void;
  selectedIssue?: Issue | null;
  className?: string;
}

export default function MapView({
  issues,
  center,
  onIssueClick,
  selectedIssue,
  className = "h-96"
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Create custom icons based on issue status
  const createIcon = (status: string) => {
    const color = status === 'resolved' ? '#10b981' :
                  status === 'in_progress' ? '#3b82f6' : '#f59e0b';

    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const createUserLocationIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          background-color: #3b82f6;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
        "></div>
      `,
      className: 'user-location-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    // Initialize map
    const map = L.map(mapRef.current).setView([center.lat, center.lng], 14);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add user location marker
    const userMarker = L.marker([center.lat, center.lng], {
      icon: createUserLocationIcon()
    }).addTo(map);

    userMarker.bindPopup('<div style="font-size: 14px;"><strong>Your Location</strong></div>');

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center.lat, center.lng]);

  // Update markers when issues change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing issue markers (keep user location)
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.options.className === 'issue-marker') {
        map.removeLayer(layer);
      }
    });

    // Add issue markers
    issues.forEach((issue) => {
      const category = ISSUE_CATEGORIES.find(c => c.id === issue.category);
      const status = ISSUE_STATUS.find(s => s.id === issue.status);

      const marker = L.marker([issue.coordinates.lat, issue.coordinates.lng], {
        icon: createIcon(issue.status),
        className: 'issue-marker'
      }).addTo(map);

      // Create popup content
      const popupContent = `
        <div style="min-width: 250px; max-width: 320px;">
          <div style="margin-bottom: 8px;">
            <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 4px;">
              <h3 style="font-weight: 600; font-size: 14px; margin: 0;">${issue.title}</h3>
              <span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; background-color: ${
                status?.id === 'resolved' ? '#dcfce7; color: #166534' :
                status?.id === 'in_progress' ? '#dbeafe; color: #1d4ed8' :
                '#fef3c7; color: #92400e'
              };">${status?.label}</span>
            </div>
            <p style="font-size: 14px; color: #6b7280; margin: 8px 0; line-height: 1.4;">${issue.description}</p>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #9ca3af;">
              <span style="display: flex; align-items: center;">
                <span style="margin-right: 4px;">${category?.icon}</span>
                ${category?.label}
              </span>
              <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
            ${issue.images.length > 0 ? `
              <div style="margin-top: 8px;">
                <img src="${issue.images[0]}" alt="Issue" style="width: 100%; height: 96px; object-fit: cover; border-radius: 4px;" />
              </div>
            ` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      if (onIssueClick) {
        marker.on('click', () => onIssueClick(issue));
      }
    });
  }, [issues, onIssueClick]);

  // Update map center when center changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([center.lat, center.lng], mapInstanceRef.current.getZoom());
    }
  }, [center]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapRef}
        className="h-full w-full rounded-lg border border-border"
        style={{ minHeight: '200px' }}
      />
    </div>
  );
}

// Location service with geolocation + IP fallback
interface GeolocationResult {
  success: boolean;
  address: string;
  latitude?: number;
  longitude?: number;
  error?: string;
}

interface IPStackResponse {
  city?: string;
  region_name?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
}

interface ReverseGeocodeResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
}

// IP-based location fallback
async function getIPBasedLocation(): Promise<GeolocationResult> {
  const apiKey = process.env.NEXT_PUBLIC_IPSTACK_API_KEY;

  if (!apiKey) {
    console.error(
      "IPSTACK_API_KEY not configured. Add NEXT_PUBLIC_IPSTACK_API_KEY to your .env.local file",
    );
    throw new Error("Location service not configured. Please contact support.");
  }

  const res = await fetch(`https://api.ipstack.com/check?access_key=${apiKey}`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("IPStack API error:", errorText);
    throw new Error("IP location fetch failed");
  }

  const data: IPStackResponse = await res.json();

  const city = data.city || "Kaduna";
  const state = data.region_name || "Kaduna State";
  const country = data.country_name || "Nigeria";

  const parts = [city, state, country].filter(Boolean);

  if (parts.length === 0) {
    throw new Error("No location data from IP");
  }

  return {
    success: true,
    address: parts.join(", "),
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

export async function getUserLocation(): Promise<GeolocationResult> {
  try {
    const position = await getBrowserGeolocation();
    const { latitude, longitude } = position.coords;

    const address = await reverseGeocode(latitude, longitude);

    return {
      success: true,
      address,
      latitude,
      longitude,
    };
  } catch (geolocationError) {
    console.warn("Geolocation failed, trying IP fallback:", geolocationError);

    try {
      const ipLocation = await getIPBasedLocation();
      return ipLocation;
    } catch (ipError) {
      console.error("IP location also failed:", ipError);
      return {
        success: false,
        address: "",
        error: "Unable to determine location",
      };
    }
  }
}

function getBrowserGeolocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      maximumAge: 0,
      enableHighAccuracy: true,
    });
  });
}

// async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
//   console.log("API Key:", process.env.NEXT_PUBLIC_IPSTACK_API_KEY);

//   const res = await fetch(
//     `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
//   );

//   if (!res.ok) {
//     throw new Error("Reverse geocoding failed");
//   }

//   const data: ReverseGeocodeResponse = await res.json();

//   const city = data.city || data.locality || "";
//   const state = data.principalSubdivision || "";
//   const country = data.countryName || "";

//   const parts = [city, state, country].filter(Boolean);

//   if (parts.length === 0) {
//     return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
//   }

//   return parts.join(", ");
//   async function getIPBasedLocation(): Promise<GeolocationResult> {
//     const apiKey = process.env.NEXT_PUBLIC_IPSTACK_API_KEY;

//     if (!apiKey) {
//       console.error(
//         "IPSTACK_API_KEY not configured. Add NEXT_PUBLIC_IPSTACK_API_KEY to your .env.local file",
//       );
//       throw new Error("Location service not configured. Please contact support.");
//     }

//     const res = await fetch(`https://api.ipstack.com/check?access_key=${apiKey}`);

//     if (!res.ok) {
//       const errorText = await res.text();
//       console.error("IPStack API error:", errorText);
//       throw new Error("IP location fetch failed");
//     }

//     const data: IPStackResponse = await res.json();

//     const city = data.city || "";
//     const state = data.region_name || "";
//     const country = data.country_name || "";

//     const parts = [city, state, country].filter(Boolean);

//     if (parts.length === 0) {
//       throw new Error("No location data from IP");
//     }

//     return {
//       success: true,
//       address: parts.join(", "),
//       latitude: data.latitude,
//       longitude: data.longitude,
//     };
//   }
// }

async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
  );

  if (!res.ok) {
    throw new Error("Reverse geocoding failed");
  }

  const data: ReverseGeocodeResponse = await res.json();

  const city = data.city || data.locality || "";
  const state = data.principalSubdivision || "";
  const country = data.countryName || "";

  const parts = [city, state, country].filter(Boolean);

  if (parts.length === 0) {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }

  return parts.join(", ");
}

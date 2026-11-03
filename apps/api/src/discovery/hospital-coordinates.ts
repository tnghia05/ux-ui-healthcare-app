// Geographic points from OSM objects, not live hospital/GPS integration.
export const hospitalCoordinates:Record<string,{latitude:number;longitude:number;sourceUrl:string;source:string;checkedOn:string}>={
  "vinmec-da-nang": {
    "latitude": 16.0387507,
    "longitude": 108.2112279,
    "sourceUrl": "https://www.openstreetmap.org/way/489789425",
    "source": "openstreetmap",
    "checkedOn": "2026-11-02"
  },
  "hoan-my-da-nang": {
    "latitude": 16.059401,
    "longitude": 108.2098753,
    "sourceUrl": "https://www.openstreetmap.org/node/729405662",
    "source": "openstreetmap",
    "checkedOn": "2026-11-02"
  },
  "benh-vien-da-nang": {
    "latitude": 16.0729442,
    "longitude": 108.2154554,
    "sourceUrl": "https://www.openstreetmap.org/way/372433638",
    "source": "openstreetmap",
    "checkedOn": "2026-11-02"
  },
  "benh-vien-c": {
    "latitude": 16.0731525,
    "longitude": 108.2168358,
    "sourceUrl": "https://www.openstreetmap.org/way/372433951",
    "source": "openstreetmap",
    "checkedOn": "2026-11-02"
  },
  "benh-vien-199": {
    "latitude": 16.0657753,
    "longitude": 108.2359315,
    "sourceUrl": "https://www.openstreetmap.org/way/1076716238",
    "source": "openstreetmap",
    "checkedOn": "2026-11-02"
  },
  "tam-tri-da-nang": {
    "latitude": 16.0229038,
    "longitude": 108.2142,
    "sourceUrl": "https://www.openstreetmap.org/way/1524495306",
    "source": "openstreetmap",
    "checkedOn": "2026-11-02"
  },
  "phu-san-nhi": {
    "latitude": 16.0226987,
    "longitude": 108.2493906,
    "sourceUrl": "https://www.openstreetmap.org/way/344021057",
    "source": "openstreetmap",
    "checkedOn": "2026-11-02"
  },
  "gia-dinh-da-nang": {
    "latitude": 16.051289,
    "longitude": 108.210203,
    "sourceUrl": "https://familyhospital.vn/en/home/",
    "source": "hospital-published-map-location",
    "checkedOn": "2026-11-02"
  }
};

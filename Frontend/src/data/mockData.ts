import type { EventItem, OrganizerEvent, TicketType } from "../types";

export const images = {
  arctic:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAypfo9eLGXJv78zkxY1hpbrr8O1NS8eHreE5ZyP7E-3fr7G8LpCAal0DvdpXoEYzPwxll3bfNKed3G217ygTvIpasIBCYrxyx1T6ZJyqdljDQNrFDqjx73eFV1QgUx6YB9hwPD1Zoup9yy-EC1YlJ7mnwDy8qAfP8pKXRzQHAPxAUtlvB0aimfr8D01aEHdJp4ILvar7bcQq8KGrJFjFWi0UUpk6IbmRrmQu0QDRF3-ukUEeFvy0jR",
  cinema:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBHvWJFDWPVVgxo1MAtLKp1C7vJEFpEFvDQ7DaPVGmvdxlG_oBxH61hK3Arepn2VXOSWE_Jec4N1cSdUvqlLp0SBcXbjNekwmgyuv3y3FikI1pVQ2YY7t3wAWv7ibp5gYbcXHX3RobRtN026R3qqmQlIHsoWgryElgLkqy7Kmh9XDrIdywK6UnuWX_rwOw3dfbOzbBuK3MLEGPe2-Vsf8qYYABydCZ190dIWac6GQubwOe7FgTSZGae",
  festival:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuARpKg6NGYO8UVXawzO4UxFnfa5B2YIS6W66kKTET15tj4WlwFbkyPXP-mENA5Dnp7osO_mFnv4XDyAj33rbxEgPGr5uX8JstFoNx7mL6bhAuQuQ1EGjXNUC3a8AG6WGCzOemTxNMSJiZAuX__KkxjsYEMX-eKWVI6WAPWRjjCF9Nnsfn1RDFZhAlNfnNaokQ9zt1iZgnjHHbn0sKPURzDagCuxws8jbBX3Dx6TjPjFWTfl7v87DYS7",
  login:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAzVIpzVZ8hWU48QSsGfTI-l1wnL4HXucUQgJGGeU41Dhof-26XDUJNFfU1oh_wLXm7D6MyypLOpRUCHaIgydijb5lJrFIA90roxmhnJCL05aDkscfF22D4uMH12G6SAxmUuZvkMtJ5OgpQgjQl9ywvXToODYGmb9eMqphc0NsctQOpFYB16jMkGc2-_yeKecgXmADKFamke8t8KBMGW3pDkPJNVm5nnT_rsC3hxuucrqDvQp0Cuo7J",
  scanner:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD0NYu50Ey_qExsr0a6Cum6cmZ1ukVHyDTQal_1PvSwO56N0rOrfQYcf7WCS0vJo4LJW3-GaOjxJujlFbF1FSe_SOoo3kdTAX9OHc4xI7Ydv_K5fP5tq1RAR_jHphfr4N1VkHJwgvUhBfPBmT6QgHz4gLnTsKkO8nYUF0g7rL-UqE2TI9-kBz16vtc_QdSU74Y7zcyOzXRS9diJIcX1v78Ac_9sRqgKpwkwh0ptR0chXkKnC5zcmCDj",
  ticket:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuA8PNZxqb47H4enK3snKNnv6ZV9EOtJEst8MzIx1ZtPsfFQthUpudyaOBN8Yv_PWVuHRpGAS3tf8r_yT6O3SutNW1aDbmF1kCurBIhk-A4o_3Z4q9o0w3piWJI52kPZlKddBj8smcBNdl_41ag2Ko_7cyM4WEF-LlT8DNYWdh2SGBu003q9G1QIpzOqaV3TeW-RF8S-X_iUbGjLFyOEFXXKEfbo53AcTi8b2gPzWpCgmuBdyI4qSNi8",
};

export const events: EventItem[] = [
  {
    id: "arctic-monkeys",
    title: "Arctic Monkeys Tour 2024",
    date: "22 AGO • 20:00",
    venue: "Allianz Parque",
    city: "São Paulo",
    price: 350,
    category: "Show",
    image: images.arctic,
  },
  {
    id: "duna",
    title: "Duna: Parte Dois - IMAX",
    date: "HOJE • 19:30",
    venue: "Cinemark Iguatemi",
    city: "SP",
    price: 45,
    category: "Filme",
    image: images.cinema,
  },
  {
    id: "tomorrowland",
    title: "Tomorrowland Brasil",
    date: "15 SET • 14:00",
    venue: "Parque Maeda",
    city: "Itu",
    price: 450,
    category: "Festival",
    image: images.festival,
  },
];

export const ticketTypes: TicketType[] = [
  {
    id: "pista",
    name: "Pista",
    description: "Acesso à pista comum",
    price: 180,
    available: 342,
  },
  {
    id: "premium",
    name: "Pista Premium",
    description: "Área exclusiva próxima ao palco",
    price: 320,
    available: 84,
  },
  {
    id: "vip",
    name: "VIP",
    description: "Open bar e acesso ao lounge",
    price: 520,
    available: 21,
  },
];

export const organizerEvents: OrganizerEvent[] = [
  {
    ...events[0],
    id: "EVT-1042",
    title: "Tech Summit 2024",
    capacity: 5000,
    sold: 2500,
    status: "Publicado",
  },
  {
    ...events[1],
    id: "EVT-1043",
    title: "Workshop Design Systems",
    capacity: 50,
    sold: 0,
    status: "Rascunho",
  },
  {
    ...events[2],
    id: "EVT-1020",
    title: "Festival de Verão",
    capacity: 10000,
    sold: 10000,
    status: "Encerrado",
  },
];

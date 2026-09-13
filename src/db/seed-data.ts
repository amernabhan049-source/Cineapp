export interface SeedGenre {
  id: string;
  name: string;
  slug: string;
}

export interface SeedMovie {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  durationMins: number;
  rating: string;
  imdbScore: string;
  releaseDate: string;
  language: string;
  director: string;
  cast: string;
  status: "NOW_SHOWING" | "COMING_SOON";
  genreSlugs: string[];
}

export interface SeedCinema {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  imageUrl: string;
  amenities: string[];
  screens: {
    id: string;
    name: string;
    screenType: "STANDARD" | "IMAX" | "DOLBY_CINEMA" | "VIP_LUXE";
    rows: string[];
    seatsPerRow: number;
  }[];
}

export const SEED_GENRES: SeedGenre[] = [
  { id: "10000000-0000-0000-0000-000000000001", name: "Action", slug: "action" },
  { id: "10000000-0000-0000-0000-000000000002", name: "Sci-Fi", slug: "sci-fi" },
  { id: "10000000-0000-0000-0000-000000000003", name: "Thriller", slug: "thriller" },
  { id: "10000000-0000-0000-0000-000000000004", name: "Drama", slug: "drama" },
  { id: "10000000-0000-0000-0000-000000000005", name: "Adventure", slug: "adventure" },
  { id: "10000000-0000-0000-0000-000000000006", name: "Animation", slug: "animation" },
  { id: "10000000-0000-0000-0000-000000000007", name: "Comedy", slug: "comedy" },
  { id: "10000000-0000-0000-0000-000000000008", name: "Fantasy", slug: "fantasy" },
];

export const SEED_MOVIES: SeedMovie[] = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    title: "Dune: Part Two",
    slug: "dune-part-two",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
    posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    durationMins: 166,
    rating: "PG-13",
    imdbScore: "8.6",
    releaseDate: "2024-03-01T00:00:00Z",
    language: "English",
    director: "Denis Villeneuve",
    cast: "Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem, Austin Butler",
    status: "NOW_SHOWING",
    genreSlugs: ["sci-fi", "adventure", "action"],
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    title: "Oppenheimer: The Director's Cut",
    slug: "oppenheimer",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project, capturing the psychological toll and monumental geopolitical shockwaves.",
    posterUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    durationMins: 180,
    rating: "R",
    imdbScore: "8.9",
    releaseDate: "2024-01-15T00:00:00Z",
    language: "English",
    director: "Christopher Nolan",
    cast: "Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr., Florence Pugh",
    status: "NOW_SHOWING",
    genreSlugs: ["drama", "thriller"],
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    title: "Cyberpunk: Neon Horizon",
    slug: "cyberpunk-neon-horizon",
    description:
      "In a 2088 megacity flooded in holographic rain, an elite cyber-detective uncovers an AI consciousness syndicate threatening the neural net of humanity.",
    posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=LembwKDo1Dk",
    durationMins: 135,
    rating: "PG-13",
    imdbScore: "8.4",
    releaseDate: "2024-04-10T00:00:00Z",
    language: "English",
    director: "Elena Rostova",
    cast: "Koji Sato, Maya Lin, David Sterling",
    status: "NOW_SHOWING",
    genreSlugs: ["sci-fi", "action", "thriller"],
  },
  {
    id: "20000000-0000-0000-0000-000000000004",
    title: "Interstellar: 10th Anniversary IMAX",
    slug: "interstellar-10th-anniversary",
    description:
      "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
    posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1920&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    durationMins: 169,
    rating: "PG-13",
    imdbScore: "8.7",
    releaseDate: "2024-05-01T00:00:00Z",
    language: "English",
    director: "Christopher Nolan",
    cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine",
    status: "NOW_SHOWING",
    genreSlugs: ["sci-fi", "adventure", "drama"],
  },
  {
    id: "20000000-0000-0000-0000-000000000005",
    title: "Gladiator II: Imperial Reckoning",
    slug: "gladiator-ii",
    description:
      "Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.",
    posterUrl: "https://images.unsplash.com/photo-1533928298208-27ff66555d8d?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1920&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=4rgYUipGJNo",
    durationMins: 148,
    rating: "R",
    imdbScore: "8.1",
    releaseDate: "2024-11-22T00:00:00Z",
    language: "English",
    director: "Ridley Scott",
    cast: "Paul Mescal, Pedro Pascal, Denzel Washington, Connie Nielsen",
    status: "NOW_SHOWING",
    genreSlugs: ["action", "drama", "adventure"],
  },
  {
    id: "20000000-0000-0000-0000-000000000006",
    title: "Avatar: Fire and Ash",
    slug: "avatar-fire-and-ash",
    description:
      "Jake Sully and Neytiri encounter the Ash People, a volcanic Na'vi clan on Pandora whose ruthless philosophy challenges their understanding of the living world.",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
    durationMins: 190,
    rating: "PG-13",
    imdbScore: "Expected 9.0",
    releaseDate: "2025-12-19T00:00:00Z",
    language: "English",
    director: "James Cameron",
    cast: "Sam Worthington, Zoe Saldana, Sigourney Weaver, Michelle Yeoh",
    status: "COMING_SOON",
    genreSlugs: ["sci-fi", "fantasy", "adventure"],
  },
  {
    id: "20000000-0000-0000-0000-000000000007",
    title: "The Batman: Part II",
    slug: "the-batman-part-ii",
    description:
      "The dark knight delves deeper into the submerged criminal underworld of Gotham City as a ruthless new mastermind unleashes a cold conspiracy.",
    posterUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80",
    backdropUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1920&q=80",
    trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
    durationMins: 172,
    rating: "PG-13",
    imdbScore: "Expected 8.8",
    releaseDate: "2026-10-02T00:00:00Z",
    language: "English",
    director: "Matt Reeves",
    cast: "Robert Pattinson, Andy Serkis, Colin Farrell, Jeffrey Wright",
    status: "COMING_SOON",
    genreSlugs: ["action", "thriller"],
  },
];

export const SEED_CINEMAS: SeedCinema[] = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    name: "CineBook Grand Luxe IMAX",
    slug: "cinebook-grand-luxe-imax",
    address: "700 Grand Boulevard, Downtown Center",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    phone: "(212) 555-0199",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
    amenities: [
      "IMAX with Laser",
      "Dolby Atmos 128-channel",
      "Italian Leather Recliners",
      "VIP Cocktail Lounge",
      "Gourmet In-Seat Dining",
      "Laser 4K Projection",
      "Wheelchair Accessible",
    ],
    screens: [
      {
        id: "40000000-0000-0000-0000-000000000001",
        name: "Screen 1 - IMAX Laser Experience",
        screenType: "IMAX",
        rows: ["A", "B", "C", "D", "E", "F", "G"],
        seatsPerRow: 10,
      },
      {
        id: "40000000-0000-0000-0000-000000000002",
        name: "Screen 2 - Dolby Cinema Atmos",
        screenType: "DOLBY_CINEMA",
        rows: ["A", "B", "C", "D", "E", "F"],
        seatsPerRow: 10,
      },
      {
        id: "40000000-0000-0000-0000-000000000003",
        name: "Screen 3 - VIP Royale Club",
        screenType: "VIP_LUXE",
        rows: ["A", "B", "C", "D"],
        seatsPerRow: 8,
      },
    ],
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    name: "CineBook Starlight Pavilion",
    slug: "cinebook-starlight-pavilion",
    address: "450 University Ave, Silicon Square",
    city: "San Francisco",
    state: "CA",
    postalCode: "94103",
    phone: "(415) 555-0144",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80",
    amenities: [
      "Dolby Cinema",
      "Ultra-Plush Heated Recliners",
      "Craft Beer & Wine Bar",
      "Digital Concessions Express",
      "Wheelchair Accessible",
    ],
    screens: [
      {
        id: "40000000-0000-0000-0000-000000000004",
        name: "Auditorium A - Laser 4K",
        screenType: "DOLBY_CINEMA",
        rows: ["A", "B", "C", "D", "E", "F"],
        seatsPerRow: 10,
      },
      {
        id: "40000000-0000-0000-0000-000000000005",
        name: "Auditorium B - Standard Premier",
        screenType: "STANDARD",
        rows: ["A", "B", "C", "D", "E"],
        seatsPerRow: 10,
      },
    ],
  },
  {
    id: "30000000-0000-0000-0000-000000000003",
    name: "CineBook Sunset Luxe Suites",
    slug: "cinebook-sunset-luxe-suites",
    address: "8800 Sunset Boulevard, West Hollywood",
    city: "Los Angeles",
    state: "CA",
    postalCode: "90069",
    phone: "(310) 555-0188",
    imageUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80",
    amenities: [
      "VIP Daybed Suites",
      "Private Butler Service",
      "Champagne Bar & Charcuterie",
      "Dolby Atmos Surround",
      "Laser Crisp Projection",
    ],
    screens: [
      {
        id: "40000000-0000-0000-0000-000000000006",
        name: "Suite 1 - Gold Class Dolby",
        screenType: "VIP_LUXE",
        rows: ["A", "B", "C", "D", "E"],
        seatsPerRow: 8,
      },
    ],
  },
];

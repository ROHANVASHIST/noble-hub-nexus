export interface Laureate {
  id: string;
  firstName: string;
  lastName: string;
  birthYear: number;
  deathYear?: number;
  nationality: string;
  category: NobelCategory;
  year: number;
  motivation: string;
  institution: string;
  photo: string;
  biography: string;
}

export interface Lecture {
  id: string;
  title: string;
  speakerName: string;
  category: NobelCategory;
  year: number;
  duration: string;
  views: number;
  thumbnail: string;
  description: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  category: NobelCategory;
  year: number;
  citations: number;
  abstract: string;
  doi: string;
  journal: string;
}

export type NobelCategory = 'Physics' | 'Chemistry' | 'Medicine' | 'Literature' | 'Peace' | 'Economics';

export const CATEGORIES: { name: NobelCategory; icon: string; color: string; count: number }[] = [
  { name: 'Physics', icon: '⚛️', color: 'from-blue-500/20 to-blue-600/5', count: 225 },
  { name: 'Chemistry', icon: '🧪', color: 'from-emerald-500/20 to-emerald-600/5', count: 194 },
  { name: 'Medicine', icon: '🧬', color: 'from-rose-500/20 to-rose-600/5', count: 227 },
  { name: 'Literature', icon: '📚', color: 'from-amber-500/20 to-amber-600/5', count: 120 },
  { name: 'Peace', icon: '🕊️', color: 'from-sky-500/20 to-sky-600/5', count: 112 },
  { name: 'Economics', icon: '📊', color: 'from-violet-500/20 to-violet-600/5', count: 93 },
];

export const LAUREATES: Laureate[] = [
  {
    id: '1', firstName: 'Albert', lastName: 'Einstein', birthYear: 1879, deathYear: 1955,
    nationality: 'German-American', category: 'Physics', year: 1921,
    motivation: 'For his services to Theoretical Physics, and especially for his discovery of the law of the photoelectric effect.',
    institution: 'Kaiser Wilhelm Institute', photo: '',
    biography: 'Albert Einstein was a German-born theoretical physicist who developed the theory of relativity.'
  },
  {
    id: '2', firstName: 'Marie', lastName: 'Curie', birthYear: 1867, deathYear: 1934,
    nationality: 'Polish-French', category: 'Chemistry', year: 1911,
    motivation: 'In recognition of her services to the advancement of chemistry by the discovery of the elements radium and polonium.',
    institution: 'University of Paris', photo: '',
    biography: 'Marie Curie was the first woman to win a Nobel Prize and the only person to win in two different sciences.'
  },
  {
    id: '3', firstName: 'Martin Luther', lastName: 'King Jr.', birthYear: 1929, deathYear: 1968,
    nationality: 'American', category: 'Peace', year: 1964,
    motivation: 'For his non-violent struggle for civil rights for the Afro-American population.',
    institution: 'Southern Christian Leadership Conference', photo: '',
    biography: 'Martin Luther King Jr. was an American Baptist minister and activist who became the most visible leader of the civil rights movement.'
  },
  {
    id: '4', firstName: 'Malala', lastName: 'Yousafzai', birthYear: 1997,
    nationality: 'Pakistani', category: 'Peace', year: 2014,
    motivation: 'For her struggle against the suppression of children and young people and for the right of all children to education.',
    institution: 'Malala Fund', photo: '',
    biography: 'Malala Yousafzai is a Pakistani activist for female education and the youngest Nobel Prize laureate.'
  },
  {
    id: '5', firstName: 'Richard', lastName: 'Feynman', birthYear: 1918, deathYear: 1988,
    nationality: 'American', category: 'Physics', year: 1965,
    motivation: 'For their fundamental work in quantum electrodynamics, with deep-ploughing consequences for the physics of elementary particles.',
    institution: 'California Institute of Technology', photo: '',
    biography: 'Richard Feynman was an American theoretical physicist known for his work in quantum mechanics and particle physics.'
  },
  {
    id: '6', firstName: 'Tu', lastName: 'Youyou', birthYear: 1930,
    nationality: 'Chinese', category: 'Medicine', year: 2015,
    motivation: 'For her discoveries concerning a novel therapy against Malaria.',
    institution: 'China Academy of Chinese Medical Sciences', photo: '',
    biography: 'Tu Youyou is a Chinese pharmaceutical chemist who discovered artemisinin, which has saved millions of lives.'
  },
  {
    id: '7', firstName: 'Gabriel García', lastName: 'Márquez', birthYear: 1927, deathYear: 2014,
    nationality: 'Colombian', category: 'Literature', year: 1982,
    motivation: 'For his novels and short stories, in which the fantastic and the realistic are combined in a richly composed world of imagination.',
    institution: 'Independent Writer', photo: '',
    biography: 'Gabriel García Márquez was a Colombian novelist, known for One Hundred Years of Solitude.'
  },
  {
    id: '8', firstName: 'Daniel', lastName: 'Kahneman', birthYear: 1934, deathYear: 2024,
    nationality: 'Israeli-American', category: 'Economics', year: 2002,
    motivation: 'For having integrated insights from psychological research into economic science, especially concerning human judgment and decision-making under uncertainty.',
    institution: 'Princeton University', photo: '',
    biography: 'Daniel Kahneman was a psychologist and economist notable for his work on the psychology of judgment and decision-making.'
  },
];

export const LECTURES: Lecture[] = [
  { id: '1', title: 'The Photoelectric Effect and Beyond', speakerName: 'Albert Einstein', category: 'Physics', year: 1921, duration: '45:00', views: 125000, thumbnail: '', description: 'Einstein discusses his groundbreaking work on the photoelectric effect.' },
  { id: '2', title: 'Radioactivity: A New Property of Matter', speakerName: 'Marie Curie', category: 'Chemistry', year: 1911, duration: '52:00', views: 98000, thumbnail: '', description: 'Marie Curie presents her discoveries on radioactive substances.' },
  { id: '3', title: 'The Quest for Peace', speakerName: 'Martin Luther King Jr.', category: 'Peace', year: 1964, duration: '38:00', views: 340000, thumbnail: '', description: 'Dr. King delivers his powerful Nobel lecture on nonviolence and peace.' },
  { id: '4', title: 'Quantum Electrodynamics', speakerName: 'Richard Feynman', category: 'Physics', year: 1965, duration: '55:00', views: 210000, thumbnail: '', description: 'Feynman explains QED in his characteristically engaging style.' },
  { id: '5', title: 'Artemisinin: A Gift from Traditional Medicine', speakerName: 'Tu Youyou', category: 'Medicine', year: 2015, duration: '42:00', views: 67000, thumbnail: '', description: 'Tu Youyou shares her journey of discovering the malaria treatment.' },
  { id: '6', title: 'The Solitude of Latin America', speakerName: 'Gabriel García Márquez', category: 'Literature', year: 1982, duration: '35:00', views: 89000, thumbnail: '', description: 'García Márquez speaks about Latin American identity and literature.' },
];

export const PAPERS: ResearchPaper[] = [
  { id: '1', title: 'On a Heuristic Point of View Concerning the Production and Transformation of Light', authors: ['Albert Einstein'], category: 'Physics', year: 1905, citations: 12500, abstract: 'This paper introduces the concept of light quanta and explains the photoelectric effect.', doi: '10.1002/andp.19053220607', journal: 'Annalen der Physik' },
  { id: '2', title: 'Researches on the Radioactive Substances', authors: ['Marie Curie'], category: 'Chemistry', year: 1903, citations: 8900, abstract: 'A comprehensive study of radioactive substances including the discovery of radium and polonium.', doi: '10.1234/curie1903', journal: 'Comptes Rendus' },
  { id: '3', title: 'Space-Time Approach to Quantum Electrodynamics', authors: ['Richard Feynman'], category: 'Physics', year: 1949, citations: 15600, abstract: 'Introduction of Feynman diagrams and a new approach to quantum electrodynamics.', doi: '10.1103/PhysRev.76.769', journal: 'Physical Review' },
  { id: '4', title: 'Artemisinin: Discovery from the Chinese Herbal Garden', authors: ['Tu Youyou'], category: 'Medicine', year: 2011, citations: 4200, abstract: 'The discovery and development of artemisinin as an antimalarial drug from traditional Chinese medicine.', doi: '10.1016/j.cell.2011.08.024', journal: 'Cell' },
  { id: '5', title: 'Prospect Theory: An Analysis of Decision under Risk', authors: ['Daniel Kahneman', 'Amos Tversky'], category: 'Economics', year: 1979, citations: 65000, abstract: 'Presents a critique of expected utility theory and develops an alternative model of choice under risk.', doi: '10.2307/1914185', journal: 'Econometrica' },
  { id: '6', title: 'One Hundred Years of Solitude: Literary Analysis', authors: ['Gabriel García Márquez'], category: 'Literature', year: 1967, citations: 3100, abstract: 'The masterwork of magical realism exploring the multi-generational story of the Buendía family.', doi: '10.1234/marquez1967', journal: 'Harper & Row' },
];

export const ANALYTICS_DATA = {
  prizesByDecade: [
    { decade: '1900s', Physics: 8, Chemistry: 7, Medicine: 8, Literature: 8, Peace: 9, Economics: 0 },
    { decade: '1910s', Physics: 5, Chemistry: 5, Medicine: 5, Literature: 4, Peace: 3, Economics: 0 },
    { decade: '1920s', Physics: 9, Chemistry: 8, Medicine: 9, Literature: 9, Peace: 6, Economics: 0 },
    { decade: '1930s', Physics: 8, Chemistry: 8, Medicine: 8, Literature: 7, Peace: 4, Economics: 0 },
    { decade: '1940s', Physics: 7, Chemistry: 6, Medicine: 7, Literature: 6, Peace: 4, Economics: 0 },
    { decade: '1950s', Physics: 10, Chemistry: 10, Medicine: 10, Literature: 10, Peace: 8, Economics: 0 },
    { decade: '1960s', Physics: 11, Chemistry: 11, Medicine: 12, Literature: 10, Peace: 8, Economics: 2 },
    { decade: '1970s', Physics: 14, Chemistry: 13, Medicine: 14, Literature: 10, Peace: 9, Economics: 10 },
    { decade: '1980s', Physics: 15, Chemistry: 14, Medicine: 14, Literature: 10, Peace: 10, Economics: 10 },
    { decade: '1990s', Physics: 14, Chemistry: 15, Medicine: 15, Literature: 10, Peace: 12, Economics: 11 },
    { decade: '2000s', Physics: 17, Chemistry: 18, Medicine: 16, Literature: 10, Peace: 13, Economics: 13 },
    { decade: '2010s', Physics: 18, Chemistry: 18, Medicine: 17, Literature: 10, Peace: 14, Economics: 12 },
    { decade: '2020s', Physics: 10, Chemistry: 9, Medicine: 9, Literature: 5, Peace: 6, Economics: 6 },
  ],
  countryDistribution: [
    { country: 'United States', count: 400 },
    { country: 'United Kingdom', count: 137 },
    { country: 'Germany', count: 111 },
    { country: 'France', count: 72 },
    { country: 'Sweden', count: 33 },
    { country: 'Japan', count: 29 },
    { country: 'Russia', count: 27 },
    { country: 'Switzerland', count: 26 },
    { country: 'Canada', count: 23 },
    { country: 'Others', count: 113 },
  ],
  genderDistribution: [
    { gender: 'Male', count: 908, fill: 'hsl(220 15% 50%)' },
    { gender: 'Female', count: 63, fill: 'hsl(42 65% 58%)' },
  ],
  stats: {
    totalLaureates: 971,
    totalPrizes: 621,
    totalLectures: 1243,
    totalPapers: 10500,
    yearsOfHistory: 125,
    countries: 79,
  },
};

export interface Job {
  id: number;
  title: string;
  employer: string;
  budget: number;
  location: string;
  category: string;
  skills: string[];
  postedDate: string;
  deadline: string;
  proposals: number;
  description: string;
  employerRating: number;
}

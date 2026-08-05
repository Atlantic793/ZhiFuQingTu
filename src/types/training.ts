export interface SuitableMajor {
  id: string;
  name: string;
  source?: string;
}

export interface TrainingJob {
  id: string;
  source: string;
  site: string;
  externalId: string;
  jobCode: string | null;
  title: string;
  url: string;
  categoryName: string;
  natureCode: string;
  natureName: string;
  locationNames: string;
  departmentName: string;
  description: string;
  requirement: string;
  sourceUpdatedAt: string;
  searchQuery: string;
  searchNature: string;
  majorSeedId: string;
  majorSeedName: string;
  suitableMajors: SuitableMajor[];
  suitableMajorsNote: string;
  fetchedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

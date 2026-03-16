export interface ExternalExperience {
  value: Array<{
    type: string;
    title: string;
    organisation: string;
    startDate?: string;
    endDate?: string;
  }>;
}

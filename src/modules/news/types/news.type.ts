export type ISODateTime = string;

export interface GovUkResultItem {
  description: string;
  link: string;
  organisations: GovUkOrganisation[];
  public_timestamp: ISODateTime;
  title: string;
  organisation_content_ids?: string[];
  expanded_organisations: GovUkOrganisation[];
  _id: string;
}

export interface GovUkOrganisation {
  organisation_type: string;
  organisation_state: string;
  acronym?: string;
  content_id: string;
  link: string;
  superseded_organisations?: string[];
  title: string;
  analytics_identifier?: string;
  organisation_brand?: string;
  child_organisations?: string[];
  logo_formatted_title?: string;
  public_timestamp?: ISODateTime;
}

export interface GovUkSearchResponse {
  total: number;
  start: number;
  results: GovUkResultItem[];
  aggregates?: Record<string, any>;
}

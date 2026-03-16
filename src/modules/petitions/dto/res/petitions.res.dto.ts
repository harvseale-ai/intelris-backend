export class PetitionsResDto {
  type: string;
  id: number;
  links: {
    self: string;
  };
  attributes: {
    action: string;
    background: string;
    additional_details: string;
    committee_note: string;
    state: string;
    signature_count: number;
    created_at: string;
    updated_at: string;
    rejected_at: string | null;
    opened_at: string | null;
    closed_at: string | null;
    moderation_threshold_reached_at: string | null;
    response_threshold_reached_at: string | null;
    government_response_at: string | null;
    debate_threshold_reached_at: string | null;
    scheduled_debate_date: string | null;
    debate_outcome_at: string | null;
    creator_name: string;
    rejection: any | null;
    government_response?: {
      responded_on: string;
      summary: string;
      details: string;
      created_at: string;
      updated_at: string;
    };
    debate: {
      debated_on: string;
      transcript_url: string;
      video_url: string;
      debate_pack_url: string;
      public_engagement_url: string;
      debate_summary_url: string;
      overview: string;
    } | null;
    departments: {
      acronym: string;
      name: string;
      url: string;
    }[];
    topics: any[];
  };
}

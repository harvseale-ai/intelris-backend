export class PublicationResDto {
  id: number;
  description: string;
  publicationStartDate: string;
  publicationEndDate: string | null;
  governmentResponses: {
    publication: any[];
    responseDeadline: string;
    responseExcepted: boolean;
  };
  documents: {
    documentId: number;
    files: {
      fileName: string;
      fileSize: number;
      fileDataFormat: string;
      url: string | null;
    }[];
  }[];
  hcNumber: {
    number: string;
    sessionId: number;
    sessionDescription: string;
  } | null;
  hlPaper: any | null;
  type: {
    id: number;
    name: string;
    description: string;
    governmentCanRespond: boolean;
    canBeResponse: boolean;
    iconKey: string | null;
    pluralVersion: string;
  };
  responseToPublicationId: number | null;
  additionalContentUrl: string | null;
  additionalContentUrl2: string | null;
  respondingDepartment: string | null;

  committee: {
    id: number;
    name: string;
    house: string;
    startDate: string;
    endDate: string | null;
    dateCommonsAppointed: string | null;
    dateLordsAppointed: string | null;
    showOnWebsite: boolean;
    websiteLegacyUrl: string | null;
    websiteLegacyRedirectEnabled: boolean;
    contact: {
      email: string;
      phone: string;
      address: string | null;
      contactDisclaimer: string | null;
    };
    parentCommittee: any | null;
    subCommittees: any[];
    category: {
      id: number;
      name: string;
    };
    committeeTypes: {
      id: number;
      name: string;
      committeeCategory: {
        id: number;
        name: string;
      };
    }[];
    scrutinisingDepartments: any[];
    isLeadCommittee: boolean | null;
    nameHistory: {
      id: number;
      committeeId: number;
      name: string;
      startDate: string;
      endDate: string | null;
    }[];
  };

  businesses: {
    id: number;
    title: string;
    type: {
      id: number;
      name: string;
      isInquiry: boolean;
      description: string;
    };
    openDate: string;
    closeDate: string | null;
    latestReport: any | null;
    openSubmissionPeriods: any[];
    closedSubmissionPeriods: {
      id: number;
      startDate: string;
      endDate: string;
      submissionType: string;
      isPromoted: boolean;
      statusMessage: string;
      allowSubmissionsPastEndDate: boolean;
    }[];
    nextOralEvidenceSession: any | null;
    contact: {
      email: string;
      phone: string;
      address: string | null;
      contactDisclaimer: string | null;
    };
  }[];
}

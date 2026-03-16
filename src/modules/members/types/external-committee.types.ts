export interface ExternalCommittee {
  committees: Array<{
    roles: Array<{
      startDate: string;
      endDate?: string;
      role: {
        id: number;
        name: string;
        roleType: {
          id: number;
          name: string;
        };
        isChair: boolean;
      };
      exOfficio: boolean;
      alternate: boolean;
      coOpted: boolean;
    }>;
    id: number;
    name: string;
    house: string;
    category: {
      id: number;
      name: string;
    };
    committeeTypes: Array<{
      id: number;
      name: string;
      committeeCategory: {
        id: number;
        name: string;
      };
    }>;
    startDate: string;
    endDate?: string;
  }>;
}

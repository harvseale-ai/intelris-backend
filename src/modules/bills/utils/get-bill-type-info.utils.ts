export const getBillTypeInfo = (
  billTypeId: number,
): {
  name: string;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
} => {
  const billTypeInfo: Record<
    number,
    {
      name: string;
      category: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
    }
  > = {
    1: {
      name: 'Government Bill',
      category: 'Public',
      description:
        "Government Bills are formal proposals for new laws or changes in law put forward by the Government for consideration by Parliament. They are normally Public Bills and are listed in the King's Speech.",
      priority: 'high',
    },
    2: {
      name: "Private Members' Bill (Starting in the House of Lords)",
      category: 'Public',
      description:
        "Private Members' bills in the Lords are usually introduced through a ballot held on the day after State Opening of a new session of parliament.",
      priority: 'medium',
    },
    3: {
      name: 'Consolidation Bill',
      category: 'Public',
      description:
        'Consolidation Bills re-enact a body of existing law in a single statute in an improved form without substantive change. They are invariably introduced in the House of Lords.',
      priority: 'medium',
    },
    4: {
      name: 'Hybrid Bill',
      category: 'Hybrid',
      description:
        'Hybrid Bills mix the characteristics of Public and Private Bills. They affect the general public but also have significant impact for specific individuals or groups.',
      priority: 'high',
    },
    5: {
      name: "Private Members' Bill (under the Ten Minute Rule)",
      category: 'Public',
      description:
        'Ten Minute Rule Bills are often an opportunity for Members to voice an opinion on a subject, rather than a serious attempt to get a bill passed. Members make speeches of no more than ten minutes.',
      priority: 'low',
    },
    6: {
      name: 'Private Bill',
      category: 'Private',
      description:
        'Private Bills are for the particular interest or benefit of any person, public company, corporation, or local authority, affecting only a particular section of the population.',
      priority: 'medium',
    },
    7: {
      name: "Private Members' Bill (Ballot Bill)",
      category: 'Public',
      description:
        "Ballot Bills have the best chance of becoming law among Private Members' Bills, as they get priority for the limited amount of debating time available.",
      priority: 'medium',
    },
    8: {
      name: "Private Members' Bill (Presentation Bill)",
      category: 'Public',
      description:
        'Presentation Bills allow any Member to introduce a bill as long as they have given notice. Members formally introduce the title but do not speak in support - they rarely become law.',
      priority: 'low',
    },
    9: {
      name: 'Draft Bill',
      category: 'Public',
      description:
        'Draft Bills are published to enable consultation and pre-legislative scrutiny before being formally introduced in either House.',
      priority: 'medium',
    },
    10: {
      name: 'Supply and Appropriation Bill',
      category: 'Public',
      description:
        'Supply and Appropriation Bills give authority for the Government to use expenditure requested in estimates and to be issued with money from the Consolidated Fund.',
      priority: 'high',
    },
  };

  return (
    billTypeInfo[billTypeId] || {
      name: 'Unknown Bill Type',
      category: 'Unknown',
      description: 'No detailed description available.',
      priority: 'medium',
    }
  );
};

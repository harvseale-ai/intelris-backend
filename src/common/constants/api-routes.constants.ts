export const API_ROUTES = {
  PARLIAMENT: {
    BASE_URL: 'https://bills-api.parliament.uk/api/v1',
    BILLS: '/Bills',
  },
  COMMITTEES: {
    BASE_URL: 'https://committees-api.parliament.uk/api',
    PUBLICATIONS: '/Publications',
    MEMBERS: '/Members',
  },
  MEMBERS: {
    BASE_URL: 'https://members-api.parliament.uk/api',
    PARTIES: '/Parties/GetActive',
    MEMBERS: '/Members',
    FOCUS: '/Focus',
    EXPERIENCE: '/Experience',
  },
  PETITIONS: {
    BASE_URL: 'https://petition.parliament.uk',
    PETITIONS: '/petitions.json',
    OPEN: 'open',
    CLOSED: 'closed',
  },
  NEWS: {
    BASE_URL: 'https://www.gov.uk',
  },
  MEMBERS_NEWS: {
    BASE_URL_ORAL: 'https://oralquestionsandmotions-api.parliament.uk',
    ORAL_QUESTIONS: '/oralquestions/list',
    EARLY_DAY_MOTIONS: '/EarlyDayMotions/list',
    //
    BASE_URL_WRITTEN_QUESTIONS: 'https://questions-statements-api.parliament.uk/api/writtenquestions/questions',
    BASE_URL_WRITTEN_STATEMENTS: 'https://questions-statements-api.parliament.uk/api/writtenstatements/statements',
  },
};

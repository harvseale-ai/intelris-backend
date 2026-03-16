export interface IMember {
  MnisId: number;
  PimsId: number;
  Name: string;
  ListAs: string;
  Constituency: string;
  Status: string;
  Party: string;
  PartyId: number;
  PartyColour: string;
  PhotoUrl: string;
}

export interface IOralquestions {
  Id: number;
  QuestionType: number;
  QuestionText: string;
  Status: number;
  Number: number;
  TabledWhen: string;
  RemovedFromToBeAskedWhen: string | null;
  DeclarableInterestDetail: string | null;
  HansardLink: string;
  UIN: number;
  AnsweringWhen: string;
  AnsweringBodyId: number;
  AnsweringBody: string;
  AnsweringMinisterTitle: string;
  AskingMember: IMember;
  AnsweringMinister: IMember;
  AskingMemberId: number;
  AnsweringMinisterId: number;
}

export interface IOralquestionsResDto {
  StatusCode: number;
  Success: boolean;
  Errors: any[];
  Response: IOralquestions[];
}
//
export interface IEarlyDayMotions {
  Id: number;
  Status: number;
  StatusDate: string;
  MemberId: number;
  PrimarySponsor: Record<string, unknown>;
  Title: string;
  MotionText: string;
  AmendmentToMotionId: number | null;
  UIN: number;
  AmendmentSuffix: string | null;
  DateTabled: string;
  PrayingAgainstNegativeStatutoryInstrumentId: number | null;
  StatutoryInstrumentNumber: string | null;
  StatutoryInstrumentYear: number | null;
  StatutoryInstrumentTitle: string | null;
  UINWithAmendmentSuffix: string;
  SponsorsCount: number;
}

export interface IEarlyDayMotionsResDto {
  StatusCode: number;
  Success: boolean;
  Errors: any[];
  Response: IEarlyDayMotions[];
}
//

export interface IWrittenquestions {
  id: number;
  askingMemberId: number;
  house: string; // 'Lords' | 'Commons'
  memberHasInterest: boolean;
  dateTabled: string;
  dateForAnswer: string;
  uin: string;
  questionText: string;
  answeringBodyId: number;
  answeringBodyName: string;
  isWithdrawn: boolean;
  isNamedDay: boolean;
  groupedQuestions: number[];
  answerIsHolding: boolean;
  answerIsCorrection: boolean;
  answeringMemberId: number;
  correctingMemberId: number | null;
  dateAnswered: string | null;
  answerText: string;
  originalAnswerText: string;
  comparableAnswerText: string;
  dateAnswerCorrected: string | null;
  dateHoldingAnswer: string | null;
  attachmentCount: number;
  heading: string;
  attachments: any[];
  groupedQuestionsDates: string[];
}

export interface IWrittenquestionsDto {
  value: IWrittenquestions;
  links: {
    rel: string;
    href: string;
    method: string;
  }[];
}

export interface IWrittenquestionsResDto {
  total: number;
  results: IWrittenquestionsDto[];
}

//
export interface IWrittenStatements {
  id: number;
  memberId: number;
  memberRole: string;
  uin: string;
  dateMade: string;
  answeringBodyId: number;
  answeringBodyName: string;
  title: string;
  text: string;
  house: 'Commons' | 'Lords';
  noticeNumber: number;
  hasAttachments: boolean;
  hasLinkedStatements: boolean;
  attachments: [];
}
export interface IWrittenStatementsDto {
  value: IWrittenStatements;
  links: {
    rel: string;
    href: string;
    method: string;
  }[];
}

export interface IWrittenStatementsResDto {
  totalResults: number;
  results: IWrittenStatementsDto[];
}

export enum MemberNewsAction {
  DISCUSSION = 'DISCUSSION',
  SPEECH = 'SPEECH',
}

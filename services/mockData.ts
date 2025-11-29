
import { Question, Subject, MBELogEntry } from "../types";

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    subject: Subject.TORTS,
    questionText: "A plaintiff was injured when a bottle of soda exploded in his hand. The bottle was manufactured by the defendant. The plaintiff creates an inference of negligence using Res Ipsa Loquitur. What is the procedural effect of this in a majority of jurisdictions?",
    options: [
      "It shifts the burden of persuasion to the defendant.",
      "It requires a directed verdict for the plaintiff if the defendant offers no evidence.",
      "It allows the jury to infer negligence but does not require a finding of negligence.",
      "It creates a rebuttable presumption of negligence that disappears if the defendant produces evidence of due care."
    ],
    correctIndex: 2,
    explanation: "Res Ipsa Loquitur typically allows the jury to infer negligence (permissive inference) sufficient to avoid a directed verdict for the defendant, but the jury is not required to find negligence.",
    difficulty: "Medium",
    factPattern: "Procedural Torts"
  },
  {
    id: "q2",
    subject: Subject.CONTRACTS,
    questionText: "A merchant sends a written confirmation of an oral agreement to another merchant. The confirmation contains an additional term that materially alters the offer. Under the UCC, what happens to this term?",
    options: [
      "It becomes part of the contract unless objected to within 10 days.",
      "It does not become part of the contract.",
      "It knocks out the conflicting term.",
      "The entire contract is void due to lack of mirror image."
    ],
    correctIndex: 1,
    explanation: "Between merchants, additional terms become part of the contract UNLESS they materially alter it, the offer expressly limits acceptance, or objection is made. Material alterations do not become part of the contract.",
    difficulty: "Hard",
    factPattern: "UCC Battle of Forms"
  },
  {
    id: "q3",
    subject: Subject.EVIDENCE,
    questionText: "In a criminal trial for assault, the prosecution seeks to introduce evidence that the defendant has a reputation in the community for being a peaceful person to prove he did not commit the assault. Is this admissible?",
    options: [
      "Yes, because a defendant may open the door to character evidence.",
      "No, because the prosecution cannot initiate character evidence to prove conduct.",
      "Yes, under the mercy rule.",
      "No, because it is hearsay."
    ],
    correctIndex: 1,
    explanation: "The prosecution cannot initiate evidence of the defendant's bad character to prove propensity/conduct in conformity. The defendant must 'open the door' first.",
    difficulty: "Easy",
    factPattern: "Character Evidence"
  }
];

export const MOCK_ESSAY_TOPICS = [
  { name: 'Professional Responsibility', frequency: 95 },
  { name: 'Remedies', frequency: 60 },
  { name: 'Community Property', frequency: 55 },
  { name: 'Business Associations', frequency: 45 },
  { name: 'Evidence', frequency: 40 },
  { name: 'Trusts & Wills', frequency: 35 },
];

export const STATEWIDE_FREQUENCY_STATS = [
    { subject: Subject.PROFESSIONAL_RESPONSIBILITY, percentage: 16 },
    { subject: Subject.CONSTITUTIONAL_LAW, percentage: 10 },
    { subject: Subject.CONTRACTS, percentage: 11 },
    { subject: Subject.CRIMINAL_LAW, percentage: 9 },
    { subject: Subject.EVIDENCE, percentage: 9 },
    { subject: Subject.PROPERTY, percentage: 10 },
    { subject: Subject.TORTS, percentage: 8 },
    { subject: Subject.CIVIL_PROCEDURE, percentage: 10 },
    { subject: Subject.COMMUNITY_PROPERTY, percentage: 7 },
    { subject: Subject.WILLS_TRUSTS, percentage: 6 },
    { subject: Subject.BUSINESS_ASSOCIATIONS, percentage: 8 },
    { subject: Subject.REMEDIES, percentage: 6 },
];

export const MOCK_MBE_LOGS: MBELogEntry[] = [
  { 
    id: '1', 
    date: '2024-10-20', 
    subject: Subject.CONTRACTS, 
    questionsCompleted: 15, 
    correctCount: 9, 
    timeSpent: 30, 
    topics: 'Formation, Consideration' 
  },
  { 
    id: '2', 
    date: '2024-10-21', 
    subject: Subject.TORTS, 
    questionsCompleted: 20, 
    correctCount: 14, 
    timeSpent: 45, 
    topics: 'Negligence, Strict Liability' 
  },
  { 
    id: '3', 
    date: '2024-10-22', 
    subject: Subject.EVIDENCE, 
    questionsCompleted: 10, 
    correctCount: 4, 
    timeSpent: 20, 
    topics: 'Hearsay Exceptions' 
  },
  { 
    id: '4', 
    date: '2024-10-23', 
    subject: Subject.CONTRACTS, 
    questionsCompleted: 25, 
    correctCount: 18, 
    timeSpent: 50, 
    topics: 'UCC vs Common Law' 
  }
];


import { KnowledgeDocument, Subject } from '../types';

// REAL DATA extracted from the provided California Bar Exam PDFs
const INITIAL_DOCS: KnowledgeDocument[] = [
  {
    id: 'feb-2025-q1',
    title: 'Feb 2025 - Question 1',
    subject: Subject.CRIMINAL_LAW,
    year: 'Feb 2025',
    isSelected: true,
    content: `
      QUESTION 1:
      A man carrying a blue briefcase robbed a bank... Rob responded, “Yes, it was me.”...
      
      SELECTED ANSWER A:
      
      Rob's (R) Statement "Yes, it was me"
      
      Fifth Amendment and Miranda: Under the 5th amendment privileges against self-incrimination, a person has a right not to incriminate themselves and must be given their miranda warnings during a custodial interrogation.
      
      Custody: A person is in custody if the person is arrested or deprived of their freedom that a reasonable person would think they are unable to leave and the environment has the same inherently coercive pressures as a police station questioning.
      
      Interrogation: Occurs when a police officer 1) asks express questions, 2) uses words or actions that the officer should know or reasonably likely to elicit an incriminating response.
      
      Public-Safety Exception: Police are not required to read a suspect miranda rights during a custodial interrogation if the questioning relates to an immediate public safety.
      
      Exclusionary Rule: Evidence is tainted and inadmissible if it was acquired through an involuntary confession, but derivative evidence is not excluded because of miranda violations.
      
      Fourth Amendment: 4th amendment protects individuals from unreasonable searches and seizures, requiring that searches be supported by probable cause.
      
      Search incident to lawful arrest: allows police to search a person and the area with their immediate control without a warrant when making a lawful arrest. This ensures officers’ safety and prevents evidence destruction. The search must happen at the time of the arrest and must be limited to what the person could reach.
    `
  },
  {
    id: 'july-2024-q1',
    title: 'July 2024 - Question 1',
    subject: Subject.BUSINESS_ASSOCIATIONS,
    year: 'July 2024',
    isSelected: true,
    content: `
      QUESTION 1:
      PickWinners Inc. (Pick) is a corporation... Cate believed that Alex and Baker caused a decline...
      
      SELECTED ANSWER A:
      
      Shareholder Derivative Suit: A shareholder is entitled to bring a derivative suit on behalf the corporation for breaches of fiduciary duty. The plaintiff stands in the shoes of the corporation, and the corporation is entitled to any recovery obtained as a result of the suit.
      
      Demand Futility Requirement: Derivative suits are subject to a demand futility requirement, which requires that the plaintiff bring a demand to the board of directors asking them to bring suit. Only when the demand is denied is suit appropriate.
      
      Duty of Care: Directors of a corporation act as fiduciaries for the shareholders of the corporation. As a result, they owe the shareholders a duty of care. This requires that they act with the prudence and business acumen befitting of the director of a business corporation.
      
      Business Judgment Rule: The business judgment rule is a rebuttable presumption that a corporate director made a business decision in good faith and with the best interests of the corporation in mind. It has the effect of shielding directors from liability for bad business decisions.
      
      Duty of Loyalty: A corporate director owes the corporation a duty of good faith and fair dealing. The duty of loyalty provides that a corporate director must act in the best interests of the corporation and for the sole interests of the shareholders.
      
      Self-Dealing -- Usurping Business Opportunity: When a corporate director usurps a business opportunity from the corporation, they engage in self-dealing and violate the duty of loyalty. Courts consider (1) whether the corporation had an expectancy in the business opportunity and (2) whether the business opportunity is within the same line of business as the corporation.
    `
  },
  {
    id: 'feb-2012-q1',
    title: 'Feb 2012 - Question 1',
    subject: Subject.WILLS_TRUSTS,
    year: 'Feb 2012',
    isSelected: true,
    content: `
      QUESTION 1:
      Sam, a widower, set up a valid, revocable inter vivos trust...
      
      SELECTED ANSWER A:
      
      Pourover Will: Where the settlor has included a clause whereby all of the settlor's assets at the time of his death pour in to the trust for the benefit of the beneficiaries a pourover will is created.
      
      Omitted Child: In general, a child may be disinherited if the child is left out of a will... However, where a child is unknown to the parent at the time the testamentary document is created, and the parent had no reason to know of the child, that unknown child will not be disinherited, and will be able to recover his intestate share.
      
      Termination of Irrevocable Trust: Termination of an irrevocable trust can be done, either when the settlor and all of the beneficiaries agree while the settlor is still alive, or if all of the beneficiaries agree and it will not frustrate the purpose of the trust.
      
      Trustee Duties: A trustee has a number of duties to the beneficiaries... a) a duty of care, b) a duty to distribute benefits in accordance with the trust, c) a duty to treat beneficiaries equally, d) and a duty to follow the settlor's instructions.
    `
  },
  {
    id: 'july-2012-q2',
    title: 'July 2012 - Question 2',
    subject: Subject.COMMUNITY_PROPERTY,
    year: 'July 2012',
    isSelected: true,
    content: `
      QUESTION 2:
      Wendy and Hal are married and live in California...
      
      SELECTED ANSWER A:
      
      Community Property Presumption: California is a community property (CP) jurisdiction. Thus, any property acquired by either spouse during the course of the marriage by either spouse's labor is presumptively community property. Property acquired before or after the marriage... is presumptively separate property (SP).
      
      Transmutation: A spouse may transmute her SP to CP of the MEC by creating a writing, signed by the adversely affected spouse, that clearly evidences that spouse's intent to treat the property as CP.
      
      Community Responsibility for Debts: All debts incurred by either spouse prior to or during the course of marriage are community debts. Tort obligations are "incurred" when the tort occurs, not when judgment is handed down.
      
      Order of Payment (Tort Liability): When a tort is committed during an activity for the benefit of the community, the debt will be satisfied first by CP, then by the tortfeasor's SP. When a tort is not committed during an activity for the benefit of the community, the debt will be satisfied first by the tortfeasor's SP, then by CP.
      
      End of Economic Community: In California, end of the economic community occurs when there is physical separation and an intent not to carry on the marital relationship anymore.
    `
  }
];

class KnowledgeStore {
  private docs: KnowledgeDocument[] = INITIAL_DOCS;
  private listeners: (() => void)[] = [];

  getDocuments(): KnowledgeDocument[] {
    return this.docs;
  }

  addDocument(doc: KnowledgeDocument) {
    this.docs = [doc, ...this.docs];
    this.notify();
  }

  updateDocument(id: string, updates: Partial<KnowledgeDocument>) {
    this.docs = this.docs.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    );
    this.notify();
  }

  removeDocument(id: string) {
    this.docs = this.docs.filter(d => d.id !== id);
    this.notify();
  }

  getFullContextText(subject?: Subject): string {
    // Concatenate all selected essays to form the "Brain" for Gemini
    // If a subject is provided, only filter by that subject.
    const targetDocs = subject 
      ? this.docs.filter(d => d.subject === subject && d.isSelected)
      : this.docs.filter(d => d.isSelected);
      
    if (targetDocs.length === 0 && subject) {
        // If no docs for specific subject, revert to all docs to prevent empty context errors during dev
        return this.docs.filter(d => d.isSelected).map(d => `--- START DOCUMENT: ${d.title} (${d.year}) --- \n ${d.content} \n --- END DOCUMENT ---`).join('\n\n');
    }

    return targetDocs.map(d => `--- START DOCUMENT: ${d.title} (${d.year}) --- \n ${d.content} \n --- END DOCUMENT ---`).join('\n\n');
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const knowledgeStore = new KnowledgeStore();

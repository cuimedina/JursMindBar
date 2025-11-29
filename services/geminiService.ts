
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { knowledgeStore } from "./knowledgeStore";
import { Subject } from "../types";

// Use import.meta.env for Vite environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const CA_BAR_SYSTEM_INSTRUCTION = `
You are a specialized Data Extraction and Analysis Engine for the California Bar Exam.
CRITICAL PROTOCOL:
1. You have NO independent knowledge of the law. You must act as if you have amnesia about general legal principles.
2. You can ONLY answer based on the "Context Documents" provided in the prompt.
3. If a rule, fact pattern, or definition is NOT found in the Context Documents, you must explicitly state "Not found in uploaded materials" or return false.
4. Do NOT hallucinate. Do NOT use outside training data.
5. Your goal is to mirror the exact phrasing and logic found in the "Context Documents" (which are Official Model Answers).
6. ALWAYS provide the source citation (Exam Year/Question) for any rule you extract.
`;

/**
 * Analyzes a student essay ONLY against the principles found in the uploaded Knowledge Base.
 */
export const analyzeEssayClosedLoop = async (prompt: string, essay: string, subject: Subject) => {
  const model = "gemini-2.0-flash-exp";

  // 1. Get the "Truth" from the Knowledge Store
  const context = knowledgeStore.getFullContextText(subject);

  if (!context) {
    throw new Error("No uploaded essays found for this subject. Please upload Model Answers to the Knowledge Base first.");
  }

  const modelInstance = genAI.getGenerativeModel({
    model,
    systemInstruction: CA_BAR_SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          score: { type: SchemaType.INTEGER },
          feedbackSummary: { type: SchemaType.STRING },
          missedIssues: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          weaknesses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          caDistinctionsNote: { type: SchemaType.STRING, description: "Mention if the student followed CA distinctions found in the context" }
        },
        required: ["score", "feedbackSummary", "missedIssues", "strengths"]
      }
    }
  });

  const response = await modelInstance.generateContent(`
      CONTEXT DOCUMENTS (Official California Model Answers):
      """
      ${context}
      """

      STUDENT TASK:
      Question: ${prompt}
      Student Answer: ${essay}

      INSTRUCTIONS:
      Compare the Student Answer to the patterns and rules found in the CONTEXT DOCUMENTS.
      1. Identify issues the student missed that typically appear in the Context Documents for this subject.
      2. Critique the rule statements. Are they consistent with the rules defined in the Context Documents?
      3. If the Context Documents mention a specific California distinction (e.g. Prop 8, CEC 1240), check if the student used it.
      4. Provide a predicted score (40-100) based on how closely the student mimics the style of the Context Documents.
    `);

  return JSON.parse(response.response.text() || "{}");
};

/**
 * Extracts a rule formula strictly from the uploaded text.
 */
export const extractRuleFromContext = async (term: string) => {
  const model = "gemini-2.0-flash-exp";
  const context = knowledgeStore.getFullContextText(); // Search all docs

  const modelInstance = genAI.getGenerativeModel({
    model,
    systemInstruction: CA_BAR_SYSTEM_INSTRUCTION,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          found: { type: SchemaType.BOOLEAN },
          ruleStatement: { type: SchemaType.STRING },
          sourceDocTitle: { type: SchemaType.STRING, description: "The Exam Year/Question title where this rule was found" },
          confidence: { type: SchemaType.NUMBER }
        },
        required: ["found"]
      }
    }
  });

  const response = await modelInstance.generateContent(`
      CONTEXT DOCUMENTS:
      """
      ${context}
      """

      USER QUERY: Find the exact rule definition for "${term}".

      INSTRUCTIONS:
      1. Search the CONTEXT DOCUMENTS for the definition of "${term}".
      2. Extract the rule statement VERBATIM or closely paraphrased from the text.
      3. Identify which specific Document Title the rule came from (e.g. "July 2012 Question 2").
      4. If the term is not defined in the text, return "found": false.
      5. Do NOT generate a rule from general knowledge.
    `);

  return JSON.parse(response.response.text() || "{}");
};

/**
 * Scans the uploaded documents to find recurring patterns.
 */
export const identifyPatternsInKnowledgeBase = async (subject: Subject) => {
  const model = "gemini-2.0-flash-exp";
  const context = knowledgeStore.getFullContextText(subject);

  if (!context) return [];

  const modelInstance = genAI.getGenerativeModel({
    model,
    systemInstruction: "You are a Pattern Recognition Engine. Analyze the dataset provided.",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            frequency: { type: SchemaType.INTEGER, description: "Estimated percentage of essays this pattern appears in within the dataset" },
            description: { type: SchemaType.STRING },
            relatedEssays: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Titles of documents where this was found" }
          }
        }
      }
    }
  });

  const response = await modelInstance.generateContent(`
      CONTEXT DOCUMENTS (Model Answers for ${subject}):
      """
      ${context}
      """

      TASK:
      Analyze these documents as a set. Identify recurring fact patterns, organizational structures, or rule clusters that appear multiple times.
      For example: "In Torts essays, Negligence is almost always paired with a Vicarious Liability issue."
    `);

  return JSON.parse(response.response.text() || "[]");
};

/**
 * Analyzes sub-topic frequency within a subject from the Knowledge Base.
 */
export const analyzeSubjectSubtopics = async (subject: Subject) => {
  const model = "gemini-2.0-flash-exp";
  const context = knowledgeStore.getFullContextText(subject);

  if (!context) return [];

  const modelInstance = genAI.getGenerativeModel({
    model,
    systemInstruction: "You are a Data Extraction Engine. Extract subtopic frequencies.",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            subtopic: { type: SchemaType.STRING },
            count: { type: SchemaType.INTEGER, description: "Number of essays containing this issue" },
            percentage: { type: SchemaType.NUMBER, description: "Percentage of total essays for this subject" },
            relatedDocs: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "Titles of essays containing this issue" }
          }
        }
      }
    }
  });

  const response = await modelInstance.generateContent(`
      CONTEXT DOCUMENTS (Model Answers for ${subject}):
      """
      ${context}
      """

      TASK:
      Analyze the provided documents for ${subject}.
      Identify the major legal sub-issues (e.g. for Contracts: Formation, Breach, Remedies) that appear in these essays.
      Count how many essays contain each sub-issue.
    `);

  return JSON.parse(response.response.text() || "[]");
};

/**
 * Analyzes an MBE Question (Text or Image) to find patterns and distractors.
 * Uses Multimodal capabilities.
 */
export const analyzeMBEQuestionMultimodal = async (
  subject: Subject,
  text?: string,
  imageBase64?: string,
  mimeType: string = 'image/png'
) => {
  const model = "gemini-2.0-flash-exp"; // Supports vision

  const parts: any[] = [];

  if (text) {
    parts.push({ text: `Question Text: ${text}` });
  }

  if (imageBase64) {
    // Strip prefix if present (e.g. data:image/png;base64,...)
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
    parts.push({
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType
      }
    });
  }

  if (parts.length === 0) throw new Error("No content provided");

  const prompt = `
    Analyze this MBE Bar Exam Question.
    1. OCR: If an image is provided, transcribe the question text accurately.
    2. Pattern Recognition: Identify the specific "Fact Pattern" type (e.g., "Battle of the Forms", "Negligence Per Se").
    3. Distractor Analysis: Explain the likely "trick" or common wrong answer trap used here.
    4. Provide a brief analysis of the core legal issue.
  `;

  parts.push({ text: prompt });

  const modelInstance = genAI.getGenerativeModel({
    model,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          extractedText: { type: SchemaType.STRING, description: "The transcribed text of the question" },
          patternType: { type: SchemaType.STRING, description: "e.g. 'Character Evidence Exception'" },
          distractorType: { type: SchemaType.STRING, description: "e.g. 'Right result, wrong reason'" },
          analysis: { type: SchemaType.STRING, description: "Brief explanation of the legal logic" }
        }
      }
    }
  });

  const response = await modelInstance.generateContent(parts);

  return JSON.parse(response.response.text() || "{}");
};

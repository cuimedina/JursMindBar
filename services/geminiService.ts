

import { GoogleGenAI, Type } from "@google/genai";
import { knowledgeStore } from "./knowledgeStore";
import { Subject } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  const model = "gemini-2.5-flash"; 
  
  // 1. Get the "Truth" from the Knowledge Store
  const context = knowledgeStore.getFullContextText(subject);

  if (!context) {
    throw new Error("No uploaded essays found for this subject. Please upload Model Answers to the Knowledge Base first.");
  }

  const response = await ai.models.generateContent({
    model,
    contents: `
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
    `,
    config: {
      systemInstruction: CA_BAR_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          feedbackSummary: { type: Type.STRING },
          missedIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          caDistinctionsNote: { type: Type.STRING, description: "Mention if the student followed CA distinctions found in the context" }
        },
        required: ["score", "feedbackSummary", "missedIssues", "strengths"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

/**
 * Extracts a rule formula strictly from the uploaded text.
 */
export const extractRuleFromContext = async (term: string) => {
  const model = "gemini-2.5-flash";
  const context = knowledgeStore.getFullContextText(); // Search all docs

  const response = await ai.models.generateContent({
    model,
    contents: `
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
    `,
    config: {
      systemInstruction: CA_BAR_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          found: { type: Type.BOOLEAN },
          ruleStatement: { type: Type.STRING },
          sourceDocTitle: { type: Type.STRING, description: "The Exam Year/Question title where this rule was found" },
          confidence: { type: Type.NUMBER }
        },
        required: ["found"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

/**
 * Scans the uploaded documents to find recurring patterns.
 */
export const identifyPatternsInKnowledgeBase = async (subject: Subject) => {
  const model = "gemini-2.5-flash";
  const context = knowledgeStore.getFullContextText(subject);

  if (!context) return [];

  const response = await ai.models.generateContent({
    model,
    contents: `
      CONTEXT DOCUMENTS (Model Answers for ${subject}):
      """
      ${context}
      """

      TASK:
      Analyze these documents as a set. Identify recurring fact patterns, organizational structures, or rule clusters that appear multiple times.
      For example: "In Torts essays, Negligence is almost always paired with a Vicarious Liability issue."
    `,
    config: {
      systemInstruction: "You are a Pattern Recognition Engine. Analyze the dataset provided.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            frequency: { type: Type.INTEGER, description: "Estimated percentage of essays this pattern appears in within the dataset" },
            description: { type: Type.STRING },
            relatedEssays: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Titles of documents where this was found" }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
};

/**
 * Analyzes sub-topic frequency within a subject from the Knowledge Base.
 */
export const analyzeSubjectSubtopics = async (subject: Subject) => {
  const model = "gemini-2.5-flash";
  const context = knowledgeStore.getFullContextText(subject);

  if (!context) return [];

  const response = await ai.models.generateContent({
    model,
    contents: `
      CONTEXT DOCUMENTS (Model Answers for ${subject}):
      """
      ${context}
      """

      TASK:
      Analyze the provided documents for ${subject}. 
      Identify the major legal sub-issues (e.g. for Contracts: Formation, Breach, Remedies) that appear in these essays.
      Count how many essays contain each sub-issue.
    `,
    config: {
      systemInstruction: "You are a Data Extraction Engine. Extract subtopic frequencies.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            subtopic: { type: Type.STRING },
            count: { type: Type.INTEGER, description: "Number of essays containing this issue" },
            percentage: { type: Type.NUMBER, description: "Percentage of total essays for this subject" },
            relatedDocs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Titles of essays containing this issue" }
          }
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
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
  const model = "gemini-2.5-flash"; // Supports vision
  
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

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          extractedText: { type: Type.STRING, description: "The transcribed text of the question" },
          patternType: { type: Type.STRING, description: "e.g. 'Character Evidence Exception'" },
          distractorType: { type: Type.STRING, description: "e.g. 'Right result, wrong reason'" },
          analysis: { type: Type.STRING, description: "Brief explanation of the legal logic" }
        }
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

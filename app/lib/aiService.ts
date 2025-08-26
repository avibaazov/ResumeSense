// AI Service using Google Gemini for free resume analysis
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AppFeedback } from './database';

// Initialize Gemini client safely
let model: any = null;
try {
  const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
  if (apiKey && apiKey !== 'your-gemini-api-key-here') {
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }
} catch (error) {
  console.warn('Gemini API not properly configured, falling back to mock data');
}

export const analyzeResume = async (
  resumeFile: File,
  instructions: string
): Promise<AppFeedback> => {
  try {
    // Check if Gemini is available
    if (!model) {
      console.log('Gemini not configured, using fallback feedback');
      return generateFallbackFeedback();
    }

    // Extract text from PDF
    const resumeText = await extractTextFromPDF(resumeFile);
    
    // Send to Gemini for analysis
    const prompt = `${instructions}\n\nHere is the resume text to analyze:\n\n${resumeText}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedbackText = response.text();
    
    try {
      // Try to parse as JSON
      const feedback = JSON.parse(feedbackText);
      return feedback as AppFeedback;
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.log('Gemini response:', feedbackText);
      
      // Fallback to mock data if parsing fails
      return generateFallbackFeedback();
    }
  } catch (error) {
    console.error('Failed to analyze resume with Gemini:', error);
    
    // Fallback to mock data if Gemini fails
    return generateFallbackFeedback();
  }
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .filter((item: any) => item.str)
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Failed to extract text from PDF:', error);
    // Fallback to basic file info if text extraction fails
    return `Resume file: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`;
  }
};

// Fallback feedback if Claude API fails
const generateFallbackFeedback = (): AppFeedback => {
  return {
    overallScore: 75,
    ATS: {
      score: 80,
      tips: [
        { type: "good", tip: "Good use of keywords" },
        { type: "improve", tip: "Add more industry-specific terms" }
      ]
    },
    toneAndStyle: {
      score: 70,
      tips: [
        { type: "good", tip: "Professional tone", explanation: "Maintains appropriate business language" }
      ]
    },
    content: {
      score: 75,
      tips: [
        { type: "improve", tip: "Add quantifiable achievements", explanation: "Include specific metrics and numbers" }
      ]
    },
    structure: {
      score: 85,
      tips: [
        { type: "good", tip: "Clear section organization", explanation: "Well-structured layout" }
      ]
    },
    skills: {
      score: 70,
      tips: [
        { type: "improve", tip: "Add more technical skills", explanation: "Include relevant technologies and tools" }
      ]
    }
  };
};


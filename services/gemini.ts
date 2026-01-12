
import { GoogleGenAI } from "@google/genai";
import { BACKGROUND_COLORS } from "../constants";

export async function processImage(
  base64Image: string,
  options: {
    gender: string;
    size: string;
    background: string;
    dress: string;
    faceSmooth: boolean;
    lightFix: boolean;
    brightness: number;
    fairness: number;
  }
): Promise<string | null> {
  // Initialize AI client with API Key from process.env
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const mimeType = base64Image.match(/data:(.*?);base64/)?.[1] || 'image/png';
  const imageData = base64Image.split(',')[1];

  // Map Bengali background name to English descriptive ID for AI
  const bgColorObj = BACKGROUND_COLORS.find(c => c.name === options.background);
  const bgDescription = bgColorObj ? bgColorObj.id : "solid studio blue";

  const clothingInstruction = options.dress === "পরিবর্তন নেই" 
    ? "PRESERVE CLOTHING: Keep the original outfit exactly as it appears in the source image. Do not change color or style."
    : `REPLACE CLOTHING: Replace current outfit with a high-end, tailored, and realistic "${options.dress}". The clothing must fit perfectly on the straightened posture.`;

  // Authoritative prompt for high-quality studio generation and auto-straightening
  const prompt = `Task: Professional AI Studio Portrait Generation with Mandatory Auto-Straightening.
  
  CRITICAL POSTURE RULES (MANDATORY):
  1. AUTO-ALIGNMENT & STRAIGHTENING: Analyze the subject's head, neck, and shoulders. If the person is tilted, leaning, or crooked in the source image, you MUST automatically rotate and align them to a perfect 90-degree vertical professional studio posture. 
  2. EYE LEVELING: Ensure the eyes are perfectly horizontal and level. 
  3. COMPOSITION: Center the subject perfectly in the frame. The head must be upright and the body must be straight as in a high-end formal passport photograph.

  STRICT VISUAL RULES:
  4. NO TEXT OR GRAPHICS: Do NOT include any text, letters, watermarks, symbols, or labels (absolutely no "নীল", "Blue", or any other text).
  5. FACE IDENTITY: The face must remain 100% identical to the source person. Do not alter facial structure.
  6. BACKGROUND: Replace the entire background with a single, solid, clean "${bgDescription}" color. No textures or gradients.
  7. ${clothingInstruction}
  8. SKIN & LIGHTING: Increase fairness by ${options.fairness}% and overall image brightness to ${options.brightness}%. ${options.faceSmooth ? "Apply professional high-end skin retouching, removing blemishes while keeping natural details." : ""}
  9. STUDIO QUALITY: Apply professional 3-point studio lighting. Ensure high resolution (4K) and sharp details.
  10. OUTPUT: Return ONLY the final processed image part. No borders, no text, no multi-panels.

  Final Result Goal: A perfectly straightened, professional studio portrait that looks realistic and formal.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageData,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part && part.inlineData) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    
    console.warn("AI response did not contain an image part.");
    return null;
  } catch (error) {
    console.error("AI Generation Critical Error:", error);
    return null;
  }
}

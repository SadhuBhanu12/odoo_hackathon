// Civic Issue Classifier Service
// Ready to integrate with your ChatGPT API

export interface IssueClassification {
  category: 'Road' | 'Sanitation' | 'Streetlight' | 'Water Supply' | 'Electricity' | 'Drainage' | 'Public Safety' | 'Other';
  suggested_title: string;
  summary: string;
  tags: string[];
  urgency: 'Low' | 'Medium' | 'High';
}

export interface IssueInput {
  title: string;
  description: string;
  location?: string;
}

// The exact prompt you provided - ready for ChatGPT API
const CIVIC_CLASSIFIER_PROMPT = `You are an assistant for a Civic Issue Reporting platform.  
Given a user-submitted report that includes a title, description, and optional location, your task is to:

1. **Classify** the issue into one of the following categories:  
   - Road  
   - Sanitation  
   - Streetlight  
   - Water Supply  
   - Electricity  
   - Drainage  
   - Public Safety  
   - Other

2. **Enhance the issue title** to make it clear and professional.

3. **Summarize** the issue in a single sentence (max 30 words) for quick viewing.

4. **Suggest 3–5 relevant tags** related to the issue.

5. **Determine the urgency level**: Low, Medium, or High — based on public impact and severity.

Respond strictly in the following JSON format:

{
  "category": "string",
  "suggested_title": "string",
  "summary": "string",
  "tags": ["string", "string", "string"],
  "urgency": "Low | Medium | High"
}

Use the inputs thoughtfully and keep the language civic, respectful, and clear.`;

export class CivicClassifierService {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async classifyIssue(issue: IssueInput): Promise<IssueClassification | null> {
    try {
      const userMessage = `Title: ${issue.title}
Description: ${issue.description}
${issue.location ? `Location: ${issue.location}` : ''}`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4', // or 'gpt-3.5-turbo'
          messages: [
            {
              role: 'system',
              content: CIVIC_CLASSIFIER_PROMPT
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.3, // Low temperature for consistent classification
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content received');
      }

      // Parse the JSON response
      const classification: IssueClassification = JSON.parse(content);
      
      // Validate the response structure
      if (!this.isValidClassification(classification)) {
        throw new Error('Invalid classification response format');
      }

      return classification;
    } catch (error) {
      console.error('Error classifying issue:', error);
      return null;
    }
  }

  private isValidClassification(obj: any): obj is IssueClassification {
    return (
      obj &&
      typeof obj.category === 'string' &&
      typeof obj.suggested_title === 'string' &&
      typeof obj.summary === 'string' &&
      Array.isArray(obj.tags) &&
      ['Low', 'Medium', 'High'].includes(obj.urgency)
    );
  }

  // Demo classification for testing without API
  getDemoClassification(issue: IssueInput): IssueClassification {
    const title = issue.title.toLowerCase();
    const description = issue.description.toLowerCase();
    
    let category: IssueClassification['category'] = 'Other';
    let urgency: IssueClassification['urgency'] = 'Medium';
    
    // Simple keyword-based classification for demo
    if (title.includes('pothole') || title.includes('road') || description.includes('road')) {
      category = 'Road';
      urgency = 'Medium';
    } else if (title.includes('light') || description.includes('light') || description.includes('dark')) {
      category = 'Streetlight';
      urgency = 'Medium';
    } else if (title.includes('water') || description.includes('water') || description.includes('leak')) {
      category = 'Water Supply';
      urgency = 'High';
    } else if (title.includes('garbage') || description.includes('trash') || description.includes('clean')) {
      category = 'Sanitation';
      urgency = 'Low';
    } else if (title.includes('electric') || description.includes('power') || description.includes('electric')) {
      category = 'Electricity';
      urgency = 'High';
    } else if (title.includes('drain') || description.includes('flood') || description.includes('drain')) {
      category = 'Drainage';
      urgency = 'Medium';
    } else if (title.includes('safety') || description.includes('danger') || description.includes('unsafe')) {
      category = 'Public Safety';
      urgency = 'High';
    }

    return {
      category,
      suggested_title: `${category}: ${issue.title}`,
      summary: `${category} issue reported: ${issue.description.substring(0, 50)}...`,
      tags: [category.toLowerCase(), 'civic', 'community'],
      urgency,
    };
  }
}

// Usage example:
// const classifier = new CivicClassifierService('https://api.openai.com/v1/chat/completions', 'your-api-key');
// const result = await classifier.classifyIssue({
//   title: 'Broken streetlight',
//   description: 'The streetlight on Main St has been out for 3 days',
//   location: 'Main St & Oak Ave'
// });

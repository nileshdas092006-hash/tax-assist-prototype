export async function fetchIntakeQuestions() {
  try {
    // Attempt live fetch if we add a backend later
    /*
    const response = await fetch('/api/tax-intake');
    if (response.ok) {
      return await response.json();
    }
    */
    
    // Simulate network delay for AI generation feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Fallback Mock Payload
    return {
      questions: [
        {
          id: 'employment_type',
          text: 'What was your primary source of income this year?',
          options: [
            { label: 'Salaried Employee', value: 'salary' },
            { label: 'Freelancer / Business Owner', value: 'business' },
            { label: 'Retired / Pensioner', value: 'pension' }
          ]
        },
        {
          id: 'capital_gains',
          text: 'Did you sell any stocks, mutual funds, or property?',
          options: [
            { label: 'Yes, I had investments', value: 'yes' },
            { label: 'No, nothing sold', value: 'no' }
          ]
        },
        {
          id: 'foreign_assets',
          text: 'Do you hold any foreign bank accounts or assets outside India?',
          options: [
            { label: 'Yes, I have foreign assets', value: 'yes' },
            { label: 'No, completely domestic', value: 'no' }
          ]
        }
      ]
    };
  } catch (error) {
    console.warn("Intake API failed, using fallback.", error);
    // Return empty or fallback in worst case
    return { questions: [] };
  }
}


'use server';

/**
 * @fileOverview An AI agent that provides insights into energy consumption safety based on current usage compared to the monthly goal and historical data.
 *
 * - getEnergyConsumptionSafety - A function that returns a safety assessment of energy consumption.
 * - EnergyConsumptionSafetyInput - The input type for the getEnergyConsumptionSafety function.
 * - EnergyConsumptionSafetyOutput - The return type for the getEnergyConsumptionSafety function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnergyConsumptionSafetyInputSchema = z.object({
  monthlyGoal: z
    .number()
    .describe('The monthly electricity consumption goal in units.'),
  currentUsage: z
    .number()
    .describe('The current electricity consumption in units.'),
  daysElapsed: z
    .number()
    .describe('The number of days elapsed in the current month.'),
  historicalUsageData: z
    .string()
    .describe(
      `Historical electricity usage data as a JSON string, including date and usage. For example: [{"date": "2023-01-15T10:00:00Z", "usage": 50}, {"date": "2023-01-16T10:00:00Z", "usage": 55}]`
    ),
});
export type EnergyConsumptionSafetyInput = z.infer<typeof EnergyConsumptionSafetyInputSchema>;


const EnergyConsumptionSafetyOutputSchema = z.object({
    safetyLevel: z.string().describe("The safety level of the energy consumption. Can be 'Safe', 'Warning', or 'Danger'."),
    recommendation: z.string().describe("A recommendation for the user based on their energy consumption."),
    projectedUsage: z.number().describe("The projected energy consumption for the end of the month."),
});
export type EnergyConsumptionSafetyOutput = z.infer<typeof EnergyConsumptionSafetyOutputSchema>;

const safetyPrompt = ai.definePrompt({
    name: "energyConsumptionSafetyPrompt",
    input: { schema: EnergyConsumptionSafetyInputSchema },
    output: { schema: EnergyConsumptionSafetyOutputSchema },
    prompt: `You are an energy consumption analyst. Your task is to assess the electricity usage of a household and provide a safety assessment.
        
Current situation:
- Monthly Goal: {{{monthlyGoal}}} units
- Current Usage this month: {{{currentUsage}}} units
- Days elapsed in the month: {{{daysElapsed}}}
- Total days in month (assume 30 for simplicity)

Historical Data (JSON format):
{{{historicalUsageData}}}

Analyze the data and provide the following:
1.  **Safety Level**: Categorize the current consumption trend into one of three levels: 'Safe', 'Warning', or 'Danger'.
    - 'Safe': On track to meet or be well under the monthly goal.
    - 'Warning': At risk of exceeding the monthly goal if current consumption rates continue.
    - 'Danger': Very likely to exceed the monthly goal. Immediate action is needed.
2.  **Recommendation**: Provide a concise, actionable recommendation for the user. (e.g., "You're on track! Keep up the good work.", "Your usage is a bit high. Try to reduce appliance use during peak hours.", "Urgent: Your consumption is on a path to significantly exceed your goal. Unplug unused electronics and review your high-usage appliances.")
3.  **Projected Usage**: Calculate the projected total consumption for the end of the month based on the current average daily usage.

The current date is ${new Date().toLocaleDateString()}.
`
});


export const energyConsumptionSafetyGauge = ai.defineFlow(
  {
    name: 'energyConsumptionSafetyGauge',
    inputSchema: EnergyConsumptionSafetyInputSchema,
    outputSchema: EnergyConsumptionSafetyOutputSchema,
  },
  async (input) => {
    const llmResponse = await safetyPrompt(input);
    
    return llmResponse.output ?? {
        safetyLevel: 'Unknown',
        recommendation: 'Could not generate a response.',
        projectedUsage: 0
    };
  }
);

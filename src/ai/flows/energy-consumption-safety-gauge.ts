
'use server';

/**
 * @fileOverview An AI agent that provides insights into energy consumption pace based on current usage compared to the monthly goal.
 *
 * - getConsumptionPace - A function that returns a pace assessment of energy consumption.
 * - ConsumptionPaceInput - The input type for the getConsumptionPace function.
 * - ConsumptionPaceOutput - The return type for the getConsumptionPace function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConsumptionPaceInputSchema = z.object({
  monthlyGoal: z
    .number()
    .describe('The monthly electricity consumption goal in units.'),
  currentUsage: z
    .number()
    .describe('The current electricity consumption in units for this billing cycle.'),
  daysElapsed: z
    .number()
    .describe('The number of days that have passed in the current billing cycle.'),
});
export type ConsumptionPaceInput = z.infer<typeof ConsumptionPaceInputSchema>;


const ConsumptionPaceOutputSchema = z.object({
    paceStatus: z.string().describe("The pace of the energy consumption. Can be 'On Track', 'Slightly High', or 'High'."),
    analysis: z.string().describe("A brief analysis of the user's consumption pace."),
    projectedUsage: z.number().describe("The projected energy consumption for the end of the month based on the current pace."),
});
export type ConsumptionPaceOutput = z.infer<typeof ConsumptionPaceOutputSchema>;


export async function getConsumptionPace(input: ConsumptionPaceInput): Promise<ConsumptionPaceOutput> {
  return consumptionPaceFlow(input);
}


const pacePrompt = ai.definePrompt({
    name: "consumptionPacePrompt",
    input: { schema: ConsumptionPaceInputSchema },
    output: { schema: ConsumptionPaceOutputSchema },
    prompt: `You are an energy consumption analyst. Your task is to assess the electricity usage pace of a household. Assume a 30-day billing cycle.

Current situation:
- Monthly Goal: {{{monthlyGoal}}} units
- Current Usage this cycle: {{{currentUsage}}} units
- Days elapsed in the cycle: {{{daysElapsed}}}

Analyze the data and provide the following:
1.  **Pace Status**: Categorize the current consumption pace into one of three levels: 'On Track', 'Slightly High', or 'High'.
    - 'On Track': Projected usage is less than or equal to 100% of the monthly goal.
    - 'Slightly High': Projected usage is between 101% and 120% of the monthly goal.
    - 'High': Projected usage is over 120% of the monthly goal.
2.  **Analysis**: Provide a very brief, one-sentence analysis. For example: "You're using energy efficiently and are on track to meet your goal." or "Your usage is a bit high, but you can still get back on track." or "Your consumption is high and you're projected to exceed your goal."
3.  **Projected Usage**: Calculate the projected total consumption for the end of the 30-day cycle based on the current average daily usage.
`
});


const consumptionPaceFlow = ai.defineFlow(
  {
    name: 'consumptionPaceFlow',
    inputSchema: ConsumptionPaceInputSchema,
    outputSchema: ConsumptionPaceOutputSchema,
  },
  async (input) => {
    const llmResponse = await pacePrompt(input);
    
    return llmResponse.output ?? {
        paceStatus: 'Unknown',
        analysis: 'Could not generate a response.',
        projectedUsage: 0
    };
  }
);

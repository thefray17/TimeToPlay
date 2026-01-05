'use server';

/**
 * @fileOverview A flow that suggests alternative nearby courts if the preferred court is unavailable.
 *
 * - suggestAlternativeCourts - A function that suggests alternative courts.
 * - SuggestAlternativeCourtsInput - The input type for the suggestAlternativeCourts function.
 * - SuggestAlternativeCourtsOutput - The return type for the suggestAlternativeCourts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAlternativeCourtsInputSchema = z.object({
  sportType: z.string().describe('The type of sport the user is looking for (e.g., Pickleball, Basketball).'),
  dateTime: z.string().describe('The date and time the user wants to book the court (e.g., 2024-07-22T14:00:00).'),
  currentLocation: z.string().describe('The current location of the user (e.g., latitude, longitude).'),
  distance: z.number().describe('The maximum distance (in miles) the user is willing to travel.'),
  indoorOutdoor: z.string().optional().describe('Whether the user prefers indoor or outdoor courts (if specified).'),
  freePaid: z.string().optional().describe('Whether the user prefers free or paid courts (if specified).'),
  preferredCourtDetails: z
    .string()
    .describe(
      'Court details including address, surface type, lighting, amenities, pricing, rules, and operating hours.'
    ),
  preferredCourtName: z.string().describe('Name of the preferred court that is unavailable.'),
});

export type SuggestAlternativeCourtsInput = z.infer<typeof SuggestAlternativeCourtsInputSchema>;

const SuggestAlternativeCourtsOutputSchema = z.object({
  alternativeCourts: z.array(
    z.object({
      courtName: z.string().describe('The name of the alternative court.'),
      address: z.string().describe('The address of the alternative court.'),
      availability: z.string().describe('The availability of the alternative court at the specified time.'),
      distance: z.number().describe('Distance in miles from current location.'),
      travelTime: z.string().describe('Estimated travel time to the court.'),
      surfaceType: z.string().describe('The surface type of the alternative court.'),
      lighting: z.string().describe('Lighting details of the court'),
      amenities: z.string().describe('Amenities offered by the court'),
      pricing: z.string().describe('Pricing of the court if applicable'),
      rules: z.string().describe('Rules and operating hours of the court'),
    })
  ).describe('A list of alternative nearby courts that are open at the same time.'),
});

export type SuggestAlternativeCourtsOutput = z.infer<typeof SuggestAlternativeCourtsOutputSchema>;

export async function suggestAlternativeCourts(
  input: SuggestAlternativeCourtsInput
): Promise<SuggestAlternativeCourtsOutput> {
  return suggestAlternativeCourtsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAlternativeCourtsPrompt',
  input: {schema: SuggestAlternativeCourtsInputSchema},
  output: {schema: SuggestAlternativeCourtsOutputSchema},
  prompt: `You are a helpful assistant that suggests alternative sports courts based on user preferences and availability.

The user's preferred court, {{preferredCourtName}}, is unavailable at the specified date and time: {{dateTime}}.

Consider the following user preferences:
- Sport type: {{sportType}}
- Date and time: {{dateTime}}
- Current location: {{currentLocation}}
- Maximum distance: {{distance}} miles
{{#if indoorOutdoor}}- Indoor/Outdoor preference: {{indoorOutdoor}}{{/if}}
{{#if freePaid}}- Free/Paid preference: {{freePaid}}{{/if}}

Court details of preferred court:
{{preferredCourtDetails}}

Suggest alternative nearby courts that are open at the same time and match the user's preferences. Include the court name, address, availability, distance from the user's location, travel time, and other relevant details.
Return the result in JSON format.
`,
});

const suggestAlternativeCourtsFlow = ai.defineFlow(
  {
    name: 'suggestAlternativeCourtsFlow',
    inputSchema: SuggestAlternativeCourtsInputSchema,
    outputSchema: SuggestAlternativeCourtsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

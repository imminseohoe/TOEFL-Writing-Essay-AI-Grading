document.addEventListener('DOMContentLoaded', function() {
    
    document.getElementById("btn_gemini").addEventListener("click", () => {
    const GEMINI_API_KEY = "";
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const promptText = `You are a strict and detailed TOEFL writing grader. When grading the essay, adhere to the following guidelines and provide feedback according to the JSON schema provided. If the input does not appear to be a TOEFL independent or integrated writing task response, follow the specific instructions for non-TOEFL writing at the end of this prompt.

**Grading Principles:**

Evaluate the essay based on the official TOEFL Writing rubric, focusing on these five key criteria:

* **Development:** How well the writer develops their ideas and supports their main points with relevant details and examples.
* **Organization:** How clearly the writer organizes their thoughts and presents them in a logical sequence. Assess the use of transitions and paragraph structure.
* **Unity:** How well the writer stays on topic and avoids irrelevant information within each paragraph and the essay as a whole.
* **Coherence:** How smoothly the ideas flow together, using appropriate transitions, connectives, and pronoun references to create clear relationships between sentences and paragraphs.
* **Language Use:** How accurately and effectively the writer uses grammar, vocabulary, and sentence structure. Note errors in grammar, word choice, and sentence construction that impede understanding.

**Score Level Interpretation:**

Consider the following score level descriptions when assigning the overall score (0-30):

* **28-30 (Excellent):** Demonstrates a high degree of proficiency in all five criteria. Ideas are well-developed, organized, and coherently presented. Language use is accurate and varied with only minor errors.
* **24-27 (Good):** Demonstrates solid proficiency in all five criteria. Ideas are well-developed and organized, but there might be minor flaws in coherence or language use.
* **20-23 (Adequate):** Demonstrates basic proficiency in all five criteria. Ideas may be adequately developed, but organization and coherence may be inconsistent. Language use contains noticeable errors, but meaning is generally clear.
* **16-19 (Limited):** Demonstrates limited proficiency in one or more of the five criteria. Ideas may be underdeveloped or disorganized, and language use contains significant errors that may sometimes obscure meaning.
* **0-15 (Unscorable):** Does not meet the minimum requirements for scoring (e.g., too short, off-topic, incomprehensible *for a TOEFL essay*).

**Feedback Format (JSON):**

Provide your evaluation in the following JSON format:

\`\`\`json
{
  "score": "numerical score (0-30)",
  "strengths": [
    "Specific positive aspects of the essay related to the five grading criteria. Provide 2-3 concise bullet points, referencing specific examples if possible."
  ],
  "weaknesses": [
    "Specific areas where the essay falls short according to the five grading criteria. Provide 2-3 concise bullet points, referencing specific examples if possible."
  ],
  "points_to_improve": [
    "Actionable and specific suggestions for the writer to improve their essay based on the identified weaknesses. Provide 2-3 concise bullet points."
  ],
  "score_breakdown": {
    "task_achievement": "numerical score (out of 10) reflecting how well the essay addresses the prompt and develops ideas.",
    "coherence": "numerical score (out of 10) reflecting the logical flow and connection of ideas.",
    "language_use": "numerical score (out of 10) reflecting the accuracy and effectiveness of grammar and vocabulary."
  }
}
\`\`\`

**Instructions for Grading:**

* **Be Strict and Detail-Oriented:** Do not overlook minor errors in grammar, vocabulary, or organization.
* **Justify the Score:** Ensure the assigned score aligns with the provided score level descriptions and the evaluation of the five criteria.
* **Provide Specific Examples:** When possible, reference specific sentences or phrases from the essay to illustrate your points about strengths and weaknesses.
* **Focus on Actionable Advice:** The "points_to_improve" section should offer concrete suggestions the writer can implement to improve their writing. Avoid vague advice.
* **Maintain a Professional Tone:** While strict, your feedback should be constructive and aimed at helping the writer improve.

**Instructions for Non-TOEFL Writing Input:**

If the input text does not resemble a standard TOEFL independent or integrated writing task response (e.g., it's a poem, a code snippet, a personal message, is completely off-topic, or is not structured as an essay with an introduction, body paragraphs, and conclusion), respond with the following JSON format:

\`\`\`json
{
  "score": "error",
  "strengths": [ "The input does not appear to be a TOEFL essay response." ],
  "weaknesses": null,
  "points_to_improve": null,
  "score_breakdown": null
}
\`\`\`
`;

    let context = document.getElementById("context_text");
    let topic = document.getElementById("topic_text");
    let resultText = document.getElementById("result_text");
    let gemini_button = document.getElementById('btn_gemini');
  
        gemini_button.disabled = true;
        gemini_button.textContent = 'Analyzing...';

        fetch(GEMINI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `topic: ${topic.value} content:${context.value} `
                            }
                        ]
                    }
                ],
                systemInstruction: {
                    role: "user",
                    parts: [
                        {
                            text: promptText
                        }
                    ]
                },
                generationConfig: {
                    temperature: 1,
                    topK: 64,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                    responseMimeType: "application/json"
                }
            })
        })
        .then((response) => response.json())
        .then((result) => {
            gemini_button.disabled = false;
            gemini_button.textContent = 'Analyze My Essay';
            const data = JSON.parse(result.candidates[0].content.parts[0].text);

            function getScoreLevel(score) {
                const numScore = parseInt(score);
                if (numScore <= 12) return { text: 'Very Limited', color: 'text-red-400' };
                if (numScore <= 17) return { text: 'Limited', color: 'text-orange-400' };
                if (numScore <= 23) return { text: 'Fair', color: 'text-yellow-400' };
                if (numScore <= 27) return { text: 'Good', color: 'text-green-400' };
                return { text: 'Excellent', color: 'text-blue-400' };
            }
    
            function renderScoreReport(data) {
                const scoreLevel = getScoreLevel(data.score);
                const scorePercentage = (parseInt(data.score) / 30 * 100).toFixed(0);
    
                resultText.innerHTML = `
                <br>
                <br>
                <br>
                <br>
                <br>
                <div class="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                    <h4 class="text-center text-gray-400 mb-3">Score Scale Reference</h4>
                    <div class="grid grid-cols-5 gap-2 text-sm">
                        <div class="text-center p-2 rounded bg-gray-800">
                            <div class="text-red-400">Very Limited</div>
                            <div class="text-gray-400">0-12</div>
                        </div>
                        <div class="text-center p-2 rounded bg-gray-800">
                            <div class="text-orange-400">Limited</div>
                            <div class="text-gray-400">13-17</div>
                        </div>
                        <div class="text-center p-2 rounded bg-gray-800">
                            <div class="text-yellow-400">Fair</div>
                            <div class="text-gray-400">18-23</div>
                        </div>
                        <div class="text-center p-2 rounded bg-gray-800">
                            <div class="text-green-400">Good</div>
                            <div class="text-gray-400">24-27</div>
                        </div>
                        <div class="text-center p-2 rounded bg-gray-800">
                            <div class="text-blue-400">Excellent</div>
                            <div class="text-gray-400">28-30</div>
                        </div>
                    </div>
                </div>
                    <div class="bg-gray-800 p-8 rounded-2xl border border-gray-700 space-y-8">
                        <div class="text-center">
                            <div class="inline-block">
                                <div class="bg-gray-900 rounded-2xl p-8 border border-purple-500 mb-4">
                                    <div class="flex items-center justify-center gap-4">
                                        <div>
                                            <span class="text-5xl font-bold text-white">${data.score}</span>
                                            <span class="text-lg text-purple-400">/30</span>
                                        </div>
                                        <div class="h-12 w-px bg-gray-700"></div>
                                        <div class="text-left">
                                            <span class="block text-xl font-semibold ${scoreLevel.color}">${scoreLevel.text}</span>
                                            <span class="text-gray-400">~${scorePercentage}% Score</span>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-3 gap-4 mt-6 text-sm">
                                        <div class="bg-gray-800/50 p-3 rounded-lg">
                                            <div class="text-green-400 font-medium">Task Achievement</div>
                                            <div class="text-white">${data.score_breakdown.task_achievement}/10</div>
                                        </div>
                                        <div class="bg-gray-800/50 p-3 rounded-lg">
                                            <div class="text-blue-400 font-medium">Coherence</div>
                                            <div class="text-white">${data.score_breakdown.coherence}/10</div>
                                        </div>
                                        <div class="bg-gray-800/50 p-3 rounded-lg">
                                            <div class="text-purple-400 font-medium">Language Use</div>
                                            <div class="text-white">${data.score_breakdown.language_use}/10</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
    
                        <div class="bg-gray-900/50 rounded-xl p-6 border border-green-500/20">
                            <div class="flex items-center mb-4">
                                <div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <h3 class="text-green-400 font-semibold text-lg">Strengths</h3>
                            </div>
                            <ul class="space-y-3">
                                ${data.strengths.map(strength => `
                                    <li class="flex items-start">
                                        <svg class="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span class="text-gray-300">${strength}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
    
                        <div class="bg-gray-900/50 rounded-xl p-6 border border-red-500/20">
                            <div class="flex items-center mb-4">
                                <div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                <h3 class="text-red-400 font-semibold text-lg">Areas for Improvement</h3>
                            </div>
                            <ul class="space-y-3">
                                ${data.weaknesses.map(weakness => `
                                    <li class="flex items-start">
                                        <svg class="w-5 h-5 text-red-500 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                        <span class="text-gray-300">${weakness}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
    
                        <div class="bg-gray-900/50 rounded-xl p-6 border border-blue-500/20">
                            <div class="flex items-center mb-4">
                                <div class="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                <h3 class="text-blue-400 font-semibold text-lg">Target Areas for Next Level</h3>
                            </div>
                            <ul class="space-y-4">
                                ${data.points_to_improve.map((point, index) => `
                                    <li class="flex items-start">
                                        <div class="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                                            <span class="text-blue-400 font-semibold">${index + 1}</span>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-gray-300">${point}</p>
                                        </div>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            }
    
            renderScoreReport(data);
    
            function updateReport(newData) {
                renderScoreReport(newData);
            }
   
        })
        .catch((error) => {
            console.error("Error:", error);
            gemini_button.disabled = false;
        });
    });

});
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const questionTextEl = document.getElementById('question-text');
    const responseAreaEl = document.getElementById('response-area');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const formContainer = document.getElementById('form-container');
    const completionMessage = document.getElementById('completion-message');
    const progressBar = document.getElementById('progress-bar');

    // --- State Management ---
    let allQuestions = []; // To store all questions from JSON
    let questionMap = new Map(); // For quick lookup of question by number
    let currentQuestionIndex = 0; // The index in the allQuestions array
    let answers = {}; // { "question_number": "user_answer" }
    let navigationHistory = []; // Stack to keep track of visited question indices for "Previous" button

    // --- Main Initialization ---
    async function initializeForm() {
        try {
            const response = await fetch('/api/questions');
            if (!response.ok) throw new Error('Network response was not ok');
            allQuestions = await response.json();
            
            // Populate the question map for easy lookups
            allQuestions.forEach(q => questionMap.set(q.question_number, q));

            if (allQuestions.length > 0) {
                renderQuestion(0);
            } else {
                questionTextEl.textContent = "No questions found.";
            }
        } catch (error) {
            console.error('Failed to initialize form:', error);
            questionTextEl.textContent = "Error loading form. Please try again later.";
        }
    }

    // --- Rendering Logic ---
    function renderQuestion(index) {
        currentQuestionIndex = index;
        const question = allQuestions[index];
        if (!question) return;

        questionTextEl.textContent = question.question_text;
        responseAreaEl.innerHTML = ''; // Clear previous input

        // Restore saved answer if it exists
        const savedAnswer = answers[question.question_number];

        // Generate input based on response_type
        switch (question.response_type.split(':')[0]) {
            case 'text':
            case 'number':
            case 'date':
                const input = document.createElement('input');
                input.type = question.response_type;
                input.id = `q_${question.question_number}`;
                input.name = `q_${question.question_number}`;
                if (savedAnswer) input.value = savedAnswer;
                responseAreaEl.appendChild(input);
                break;
            case 'radio':
                const options = question.response_type.split(':')[1].split('/');
                options.forEach(option => {
                    const label = document.createElement('label');
                    const radio = document.createElement('input');
                    radio.type = 'radio';
                    radio.name = `q_${question.question_number}`;
                    radio.value = option;
                    if (savedAnswer === option) radio.checked = true;
                    label.appendChild(radio);
                    label.appendChild(document.createTextNode(` ${option}`));
                    responseAreaEl.appendChild(label);
                    responseAreaEl.appendChild(document.createElement('br'));
                });
                break;
        }
        updateNavigation();
    }

    // --- Navigation and State Update ---
    function updateNavigation() {
        // Show/hide previous button
        prevBtn.style.display = navigationHistory.length > 0 ? 'inline-block' : 'none';

        // Update progress bar
        const totalPotentialSteps = allQuestions.length;
        // A more accurate progress would be complex due to branching, so we use a simple percentage
        const progressPercentage = ((navigationHistory.length + 1) / totalPotentialSteps) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Update next button text to "Finish" on the last logical step
        const nextIndex = getNextQuestionIndex(false); // Peek at the next index without saving
        nextBtn.textContent = (nextIndex === -1) ? 'Finish' : 'Next';
    }

    function saveCurrentAnswer() {
        const question = allQuestions[currentQuestionIndex];
        const qNum = question.question_number;
        let answer = '';
        const input = document.querySelector(`[name="q_${qNum}"]`);
        
        if (input.type === 'radio') {
            const checkedRadio = document.querySelector(`[name="q_${qNum}"]:checked`);
            answer = checkedRadio ? checkedRadio.value : null;
        } else {
            answer = input.value;
        }

        if (answer !== null && answer.trim() !== '') {
            answers[qNum] = answer;
        } else {
            delete answers[qNum]; // Remove if empty
        }
    }

    // --- Conditional Logic ---
    function getNextQuestionIndex(saveAnswer = true) {
        if (saveAnswer) {
            saveCurrentAnswer();
        }
        
        const question = allQuestions[currentQuestionIndex];
        const answer = answers[question.question_number];
        const logic = question.conditional_logic;

        if (logic === 'none') {
            return currentQuestionIndex + 1 < allQuestions.length ? currentQuestionIndex + 1 : -1;
        }

        // Parse complex logic: "if Yes skip to Q3, if No go to Q2a"
        const conditions = logic.split(',').map(c => c.trim());
        for (const condition of conditions) {
            const parts = condition.match(/if\s(.+?)\s(skip to|go to)\sQ(.+)/);
            if (parts) {
                let conditionValue = parts[1];
                const targetQNum = parts[3];

                // Handle different condition types (e.g., "Yes", "=1")
                let match = false;
                if (conditionValue.startsWith('=')) {
                    match = (answer == conditionValue.substring(1));
                } else {
                    match = (answer === conditionValue);
                }

                if (match) {
                    const targetIndex = allQuestions.findIndex(q => q.question_number === targetQNum);
                    return targetIndex;
                }
            }
        }

        // Default: go to the next question in the array if no condition matched
        return currentQuestionIndex + 1 < allQuestions.length ? currentQuestionIndex + 1 : -1;
    }

    // --- Event Handlers ---
    nextBtn.addEventListener('click', () => {
        const nextIndex = getNextQuestionIndex(true);

        if (nextIndex !== -1) {
            navigationHistory.push(currentQuestionIndex); // Add current to history before moving
            renderQuestion(nextIndex);
        } else {
            // This is the "Finish" button action
            submitForm();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (navigationHistory.length > 0) {
            const lastIndex = navigationHistory.pop();
            renderQuestion(lastIndex);
        }
    });

    // --- Final Data Mapping and Submission ---
    function mapAnswersToPdfData() {
        const pdfData = {};

        // Iterate through all answered questions to perform the mapping
        for (const qNum in answers) {
            const question = questionMap.get(qNum);
            const answer = answers[qNum];
            const mappingStr = question.maps_to_pdf;

            if (!mappingStr || mappingStr === "none") continue;

            // Simple direct mapping: "PR7:deceased_fullname"
            if (mappingStr.startsWith('PR7:')) {
                const key = mappingStr.split(':')[1].trim();
                pdfData[key] = answer;
            }

            // Conditional mapping: "if No then PR7: deceased_name_discrepancy (insert conditional text: {{...}})"
            if (mappingStr.startsWith('if No then') && answer === 'No') {
                const match = mappingStr.match(/PR7:\s*([a-zA-Z_]+)\s*\(insert conditional text:\s*(.+)\)/);
                if (match) {
                    const key = match[1];
                    let text = match[2];
                    
                    // Replace placeholders in the text, e.g., "{{deceased_fullname_in_will}}"
                    const placeholderMatch = text.match(/{{(.+?)}}/);
                    if (placeholderMatch) {
                        const subQKey = placeholderMatch[1]; // e.g., "deceased_fullname_in_will"
                        // Find the question that maps to this key
                        const subQ = allQuestions.find(q => q.maps_to_pdf.includes(subQKey));
                        if (subQ && answers[subQ.question_number]) {
                            text = text.replace(placeholderMatch[0], answers[subQ.question_number]);
                        }
                    }
                    pdfData[key] = text;
                }
            }

            // Pluralization mapping: "PR7: single/plural_executors (if=1 then insert 'executor', if 1< then insert 'executors')"
            if (mappingStr.includes('single/plural')) {
                const keyMatch = mappingStr.match(/PR7:\s*([a-zA-Z_\/]+)/);
                if (keyMatch) {
                    const key = keyMatch[1];
                    pdfData[key] = (answer === '1') ? 'executor' : 'executors';
                    // This handles both executor and administrator based on your JSON sample
                    if (key.includes('administrator')) {
                        pdfData[key] = (answer === '1') ? 'administrator' : 'administrators';
                    }
                }
            }
        }
        return pdfData;
    }

    async function submitForm() {
        const finalData = mapAnswersToPdfData();
        
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData),
            });
            if (!response.ok) throw new Error('Submission failed');
            
            // On success, show completion message
            formContainer.style.display = 'none';
            completionMessage.style.display = 'block';

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your form. Please try again.');
        }
    }

    // --- Start the application ---
    initializeForm();
});
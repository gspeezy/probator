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
    let currentPageIndex = 0; // The current page index
    let answers = {}; // { "question_number": "user_answer" }
    let visitedPages = []; // Stack to keep track of visited pages for "Previous" button
    
    // Define question groupings by page
    const pageGroups = [
        ['1', '3', '5'],     // Page 1
        ['7', '8'],           // Page 2
        ['10', '12', '14'],  // Page 3
    ];

    // --- Main Initialization ---
    async function initializeForm() {
        try {
            const response = await fetch('/api/questions');
            if (!response.ok) throw new Error('Network response was not ok');
            allQuestions = await response.json();
            
            // Populate the question map for easy lookups
            allQuestions.forEach(q => questionMap.set(q.question_number, q));

            if (allQuestions.length > 0) {
                renderPage(0);
            } else {
                questionTextEl.textContent = "No questions found.";
            }
        } catch (error) {
            console.error('Failed to initialize form:', error);
            questionTextEl.textContent = "Error loading form. Please try again later.";
        }
    }

    // --- Rendering Logic ---
    function renderPage(pageIndex) {
        currentPageIndex = pageIndex;
        if (pageIndex >= pageGroups.length) return;

        const currentPageQuestions = pageGroups[pageIndex];
        responseAreaEl.innerHTML = ''; // Clear previous inputs

        // Create a container for all questions on this page
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-container';

        currentPageQuestions.forEach((questionNumber, index) => {
            const question = questionMap.get(questionNumber);
            if (!question) return;

            // Check if this question should be shown based on conditional logic
            if (!shouldShowQuestion(questionNumber)) return;

            // Create question container
            const questionContainer = document.createElement('div');
            questionContainer.className = 'question-container';
            questionContainer.style.marginBottom = '2rem';

            // Question text
            const questionTitle = document.createElement('h3');
            questionTitle.textContent = `${questionNumber}. ${question.question_text}`;
            questionTitle.style.marginBottom = '1rem';
            questionTitle.style.color = '#2c3e50';
            questionContainer.appendChild(questionTitle);

            // Input area for this question
            const inputContainer = document.createElement('div');
            inputContainer.className = 'input-container';

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
                    inputContainer.appendChild(input);
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
                        inputContainer.appendChild(label);
                        inputContainer.appendChild(document.createElement('br'));
                    });
                    break;
            }

            questionContainer.appendChild(inputContainer);
            pageContainer.appendChild(questionContainer);
        });

        // Update page title
        questionTextEl.textContent = `Page ${pageIndex + 1} of ${pageGroups.length}`;

        responseAreaEl.appendChild(pageContainer);
        updateNavigation();
    }

    function shouldShowQuestion(questionNumber) {
        // Check conditional logic to determine if question should be shown
        const question = questionMap.get(questionNumber);
        if (!question || !question.conditional_logic || question.conditional_logic === 'none') {
            return true;
        }

    }

    // --- Navigation and State Update ---
    function updateNavigation() {
        // Show/hide previous button
        prevBtn.style.display = visitedPages.length > 0 ? 'inline-block' : 'none';

        // Update progress bar
        const progressPercentage = ((currentPageIndex + 1) / pageGroups.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Update next button text to "Finish" on the last page
        nextBtn.textContent = (currentPageIndex === pageGroups.length - 1) ? 'Finish' : 'Next';
    }

    function saveCurrentPageAnswers() {
        const currentPageQuestions = pageGroups[currentPageIndex];
        
        currentPageQuestions.forEach(questionNumber => {
            if (!shouldShowQuestion(questionNumber)) return;
            
            const input = document.querySelector(`[name="q_${questionNumber}"]`);
            if (!input) return;
            
            let answer = '';
            if (input.type === 'radio') {
                const checkedRadio = document.querySelector(`[name="q_${questionNumber}"]:checked`);
                answer = checkedRadio ? checkedRadio.value : null;
            } else {
                answer = input.value;
            }

            if (answer !== null && answer.trim() !== '') {
                answers[questionNumber] = answer;
            } else {
                delete answers[questionNumber]; // Remove if empty
            }
        });
    }

    // --- Event Handlers ---
    nextBtn.addEventListener('click', () => {
        saveCurrentPageAnswers();

        if (currentPageIndex < pageGroups.length - 1) {
            visitedPages.push(currentPageIndex); // Add current page to history before moving
            renderPage(currentPageIndex + 1);
        } else {
            // This is the "Finish" button action
            submitForm();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (visitedPages.length > 0) {
            const lastPageIndex = visitedPages.pop();
            renderPage(lastPageIndex);
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
            
            // Handle PDF download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'probate-application.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
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
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
    
    // --- Date Formatting ---
    function formatDateLongform(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr; // fallback if invalid
    
        const day = date.getDate();
        const daySuffix =
            day % 10 === 1 && day !== 11 ? 'st' :
            day % 10 === 2 && day !== 12 ? 'nd' :
            day % 10 === 3 && day !== 13 ? 'rd' : 'th';
    
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getFullYear();
    
        return `${day}${daySuffix} of ${month} ${year}`;
    }    
    
    // Define question groupings by page
    const pageGroups = [
        ['1', '2', '3'],     // Page 1
        ['4', '5', '6'],           // Page 2
        ['7', '8', '9', '10'],  // Page 3
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

    function mapAnswersToPdfData() {
        const pdfData = {};
    
        // First pass: Map all regular answers
        for (const qNum in answers) {
            const question = questionMap.get(qNum);
            const answer = answers[qNum];
            const mappingStr = question.maps_to_pdf;
    
            if (!mappingStr) continue;
    
            const key = mappingStr.trim();
    
            if (question.response_type.startsWith('date')) {
                pdfData[key] = formatDateLongform(answer);
            } else {
                pdfData[key] = answer;
            }            
        }
        
        // Special logic for spouse/partner question (question 10) and will date (question 6)
        const isSpousePartner = answers['10'] === 'Yes';
        const dateOfWill = answers['6'];
        
        if (!isSpousePartner) {
            // Hide paragraph 6 entirely
            pdfData['PARAGRAPH_6'] = '';
        } else {
            // Show paragraph 6 with appropriate statement
            if (dateOfWill) {
                const willDate = new Date(dateOfWill);
                const cutoffDate = new Date('2007-11-01');
                
                if (willDate < cutoffDate) {
                    // Show Statement B
                    pdfData['PARAGRAPH_6'] = `
                    <div class="paragraph-6">
                        <p><strong>6. [Include this paragraph only if it applies. Select the statement that applies.]</strong></p>
                        <div class="statement-selected">
                            <p><strong>Statement B ✓</strong></p>
                            <p>The deceased's will was made before 1 November 2007. I am the deceased's surviving spouse. When the deceased died, no order, decree, or enactment was in force between the deceased and myself providing for the dissolution of our marriage.</p>
                        </div>
                    </div>
                `;
                } else {
                    // Show Statement A
                    pdfData['PARAGRAPH_6'] = `
                    <div class="paragraph-6">
                        <p><strong>6. [Include this paragraph only if it applies. Select the statement that applies.]</strong></p>
                        <div class="statement-selected">
                            <p><strong>Statement A ✓</strong></p>
                            <p>The deceased's will was made on or after 1 November 2007. I am the deceased's surviving spouse/surviving civil union partner*. When the deceased died, no order, decree, or enactment was in force between the deceased and myself providing for our separation or the dissolution of our marriage/civil union*.</p>
                        </div>
                    </div>
                `;
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
            formContainer.style.display = 'block';
            document.getElementById("question-section").style.display = "none";
            document.getElementById("navigation-buttons").style.display = "none";
            document.getElementById("progress-bar-container").style.display = "none";
            completionMessage.style.display = 'block';

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your form. Please try again.');
        }
    }

    // --- Start the application ---
    initializeForm();
});
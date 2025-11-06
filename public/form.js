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
    let allQuestions = [];
    let questionMap = new Map();
    let currentPageIndex = 0;
    let answers = {};
    let visitedPages = [];
    
    // --- Date Formatting ---
    function formatDateLongform(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date)) return dateStr;
    
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
        ['1', '2', '3'],
        ['4', '5', '6', '7', '8', '9'],
        ['10', '11', '12'],
        ['13', '14', '15',], 
        ['16', '17', '18', '19', '20', '21'],
        ['22']
    ];

    // --- Main Initialization ---
    async function initializeForm() {
        try {
            const response = await fetch('/api/questions');
            if (!response.ok) throw new Error('Network response was not ok');
            allQuestions = await response.json();
            
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

    // --- Conditional Field Handler ---
    function handleConditionalFields(triggerQuestionNumber) {
        const dependencies = {
            '4': '5',
            '6': '7',
            '8': '9',
            '16': '17',
            '18': '19',
            '20': '21'
        };
        
        const dependentQ = dependencies[triggerQuestionNumber];
        if (!dependentQ) return;
        
        const triggerAnswer = document.querySelector(`[name="q_${triggerQuestionNumber}"]:checked`)?.value;
        const dependentInput = document.getElementById(`q_${dependentQ}`);
        
        if (dependentInput) {
            if (triggerAnswer === 'No') {
                dependentInput.disabled = true;
                dependentInput.style.backgroundColor = '#e0e0e0'; // Light gray background
                dependentInput.style.color = '#666'; // Darker text color
                dependentInput.style.cursor = 'not-allowed';
                dependentInput.value = '';
                dependentInput.title = 'This field is not required because you indicated the details have not changed';
            } else {
                dependentInput.disabled = false;
                dependentInput.style.backgroundColor = ''; // Reset to default
                dependentInput.style.color = ''; // Reset to default
                dependentInput.style.cursor = 'text';
                dependentInput.title = '';
            }
        }
    }

    // --- Rendering Logic ---
    function renderPage(pageIndex) {
        currentPageIndex = pageIndex;
        if (pageIndex >= pageGroups.length) return;

        const currentPageQuestions = pageGroups[pageIndex];
        responseAreaEl.innerHTML = '';

        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-container';

        currentPageQuestions.forEach((questionNumber) => {
            const question = questionMap.get(questionNumber);
            if (!question) return;

            const questionContainer = document.createElement('div');
            questionContainer.className = 'question-container';
            questionContainer.style.marginBottom = '2rem';

            const questionTitle = document.createElement('h3');
            questionTitle.textContent = `${questionNumber}. ${question.question_text}`;
            questionTitle.style.marginBottom = '1rem';
            questionTitle.style.color = '#2c3e50';
            questionContainer.appendChild(questionTitle);

            const inputContainer = document.createElement('div');
            inputContainer.className = 'input-container';

            const savedAnswer = answers[question.question_number];

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
                        
                        radio.addEventListener('change', () => {
                            handleConditionalFields(question.question_number);
                        });
                        
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

        questionTextEl.textContent = `Page ${pageIndex + 1} of ${pageGroups.length}`;
        responseAreaEl.appendChild(pageContainer);
        
        // Apply conditional field states after rendering
        ['4', '6', '8', '16', '18', '20'].forEach(qNum => {
            handleConditionalFields(qNum);
        });
        
        updateNavigation();
    }

    // --- Navigation and State Update ---
    function updateNavigation() {
        prevBtn.style.display = visitedPages.length > 0 ? 'inline-block' : 'none';
        const progressPercentage = ((currentPageIndex + 1) / pageGroups.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        nextBtn.textContent = (currentPageIndex === pageGroups.length - 1) ? 'Finish' : 'Next';
    }

    function saveCurrentPageAnswers() {
        const currentPageQuestions = pageGroups[currentPageIndex];
        
        currentPageQuestions.forEach(questionNumber => {
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
                delete answers[questionNumber];
            }
        });
    }

    // --- Event Handlers ---
    nextBtn.addEventListener('click', () => {
        saveCurrentPageAnswers();

        if (currentPageIndex < pageGroups.length - 1) {
            visitedPages.push(currentPageIndex);
            renderPage(currentPageIndex + 1);
        } else {
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
        
        // Handle "formerly known as" clauses
        pdfData['former_name_clause'] = answers['5'] ? `, formerly known as ${answers['5']}` : '';
        pdfData['former_residence_clause'] = answers['7'] ? `, formerly of ${answers['7']}` : '';
        pdfData['former_occupation_clause'] = answers['9'] ? `, formerly ${answers['9']}` : '';
        pdfData['executor_former_name_clause'] = answers['17'] ? `, formerly known as ${answers['17']}` : '';
        pdfData['executor_former_residence_clause'] = answers['19'] ? `, formerly of ${answers['19']}` : '';
        pdfData['executor_former_occupation_clause'] = answers['21'] ? `, formerly ${answers['21']}` : '';

        // Special logic for spouse/partner question and will date
        const isSpousePartner = answers['22'] === 'Yes';
        const dateOfWill = answers['12'];
        
        if (!isSpousePartner) {
            pdfData['PARAGRAPH_6'] = '';
        } else {
            if (dateOfWill) {
                const willDate = new Date(dateOfWill);
                const cutoffDate = new Date('2007-11-01');
                
                if (willDate < cutoffDate) {
                    pdfData['PARAGRAPH_6'] = `
                    <div class="paragraph">
                    <span class="paragraph-number">6.</span>
                    The deceased's will was made before 1 November 2007. I am the deceased's surviving spouse. When the deceased died, no order, decree, or enactment was in force between the deceased and myself providing for the dissolution of our marriage.
                    </div>
                `;
                } else {
                    pdfData['PARAGRAPH_6'] = `
                    <div class="paragraph">
                    <span class="paragraph-number">6.</span>
                    The deceased's will was made on or after 1 November 2007. I am the deceased's surviving spouse/surviving civil union partner. When the deceased died, no order, decree, or enactment was in force between the deceased and myself providing for our separation or the dissolution of our marriage/civil union.
                    </div>
                `;
                }
            }
        }

        if (!isSpousePartner) {
            pdfData['PARAGRAPH_6'] = '';
            pdfData['PARA_7_NUMBER'] = '6';
        } else {
            pdfData['PARA_7_NUMBER'] = '7';
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
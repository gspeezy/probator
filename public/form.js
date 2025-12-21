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
        ['13', '14', '15'], 
        ['16', '17', '18', '19', '20', '21'],
        ['22'], // Spouse question alone
        ['23', '24', '25', '26', '27', '28', '29', '30', '31', '32'], // Executor count + all executor2 questions
        ['33', '34']    
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
            '20': '21',
            '27': '28',  
            '29': '30',
            '31': '32'
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

    // --- Show/Hide Conditional Questions for Executor 2 ---
    function handleShowHideExecutor2Fields(triggerQuestionNumber) {
        // Only process if this is the executor count question
        if (triggerQuestionNumber !== '23') return;
        
        const triggerAnswer = document.querySelector(`[name="q_${triggerQuestionNumber}"]:checked`)?.value;
        
        // All executor2 questions (including their sub-conditionals)
        const executor2Questions = ['24', '25', '26', '27', '28', '29', '30', '31', '32'];
        
        executor2Questions.forEach(qNum => {
            // For radio buttons, use querySelector with name attribute; for text inputs, use getElementById
            let element = document.getElementById(`q_${qNum}`);
            if (!element) {
                element = document.querySelector(`[name="q_${qNum}"]`);
            }
            
            const questionContainer = element?.closest('.question-container');
            
            if (questionContainer) {
                if (triggerAnswer === 'Two executors') {
                    questionContainer.style.display = 'block';
                } else {
                    questionContainer.style.display = 'none';
                    // Clear the answer when hiding
                    if (element) {
                        if (element.type === 'radio') {
                            document.querySelectorAll(`[name="q_${qNum}"]`).forEach(radio => {
                                radio.checked = false;
                            });
                        } else {
                            element.value = '';
                        }
                        delete answers[qNum];
                    }
                }
            }
        });
        
        // Also handle the nested conditionals for executor2 (27->28, 29->30, 31->32)
        if (triggerAnswer === 'Two executors') {
            handleConditionalFields('27');
            handleConditionalFields('29');
            handleConditionalFields('31');
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
                            handleShowHideExecutor2Fields(question.question_number);
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
        ['4', '6', '8', '16', '18', '20', '27', '29', '31'].forEach(qNum => {
            handleConditionalFields(qNum);
        });

        // Initially hide all executor2 questions on page load
        ['24', '25', '26', '27', '28', '29', '30', '31', '32'].forEach(qNum => {
            // For radio buttons, use querySelector with name attribute; for text inputs, use getElementById
            let element = document.getElementById(`q_${qNum}`);
            if (!element) {
                element = document.querySelector(`[name="q_${qNum}"]`);
            }
            
            const questionContainer = element?.closest('.question-container');
            if (questionContainer) {
                questionContainer.style.display = 'none';
            }
        });

        // Apply show/hide states for executor2 questions
        handleShowHideExecutor2Fields('23');
        
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
        pdfData['executor2_former_name_clause'] = answers['28'] ? `, formerly known as ${answers['28']}` : '';
        pdfData['executor2_former_residence_clause'] = answers['30'] ? `, formerly of ${answers['30']}` : '';
        pdfData['executor2_former_occupation_clause'] = answers['32'] ? `, formerly ${answers['32']}` : '';

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
           
        // Dual executor version of PARAGRAPH_6
        if (!isSpousePartner) {
            pdfData['PARAGRAPH_6_DUAL'] = '';
        } else {
            if (dateOfWill) {
                const willDate = new Date(dateOfWill);
                const cutoffDate = new Date('2007-11-01');
                
                if (willDate < cutoffDate) {
                    pdfData['PARAGRAPH_6_DUAL'] = `
                        <div class="paragraph">
                        <span class="paragraph-number">6.</span>
                        The deceased's will was made before 1 November 2007. I, ${pdfData['executor1_fullname']}, am the deceased's surviving spouse. When the deceased died, no order, decree, or enactment was in force between the deceased and myself providing for the dissolution of our marriage.
                        </div>
                    `;
                } else {
                    pdfData['PARAGRAPH_6_DUAL'] = `
                        <div class="paragraph">
                        <span class="paragraph-number">6.</span>
                        The deceased's will was made on or after 1 November 2007. I, ${pdfData['executor1_fullname']}, am the deceased's surviving spouse/surviving civil union partner. When the deceased died, no order, decree, or enactment was in force between the deceased and myself providing for our separation or the dissolution of our marriage/civil union.
                        </div>
                    `;
                }
            }
        }

        // Add flag for single vs dual executor 
        pdfData['isSingleExecutor'] = answers['23'] === 'One executor';

        return pdfData;
    }

    async function submitForm() {
        const finalData = mapAnswersToPdfData();
        
        // Show loading screen
        formContainer.style.display = 'none';
        document.getElementById("question-section").style.display = "none";
        document.getElementById("navigation-buttons").style.display = "none";
        document.getElementById("progress-bar-container").style.display = "none";
        
        // Create and show loading message
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-screen';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        loadingDiv.innerHTML = `
            <div style="text-align: center;">
                <div class="spinner" style="
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <h2 style="color: #2c3e50; margin-bottom: 10px;">Generating Your Probate Forms</h2>
                <p style="color: #7f8c8d;">This may take up to 15 seconds. Please don't close this window.</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loadingDiv);
        
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
            
            // Remove loading screen
            document.body.removeChild(loadingDiv);
            
            // Show completion message
            formContainer.style.display = 'block';
            completionMessage.style.display = 'block';
    
        } catch (error) {
            console.error('Error submitting form:', error);
            
            // Remove loading screen
            document.body.removeChild(loadingDiv);
            
            // Show error message
            alert('There was an error submitting your form. Please try again.');
            
            // Show form again so user can retry
            formContainer.style.display = 'block';
            document.getElementById("question-section").style.display = "block";
            document.getElementById("navigation-buttons").style.display = "flex";
            document.getElementById("progress-bar-container").style.display = "block";
        }
    }

    // --- Start the application ---
    initializeForm();
});
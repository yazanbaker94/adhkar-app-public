// Depression Assessment Quiz JavaScript
class DepressionQuiz {
    constructor() {
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.allQuestions = this.initializeQuestions();
        this.currentQuestions = []; // Dynamic list of questions to show
        this.totalQuestions = 0;
        this.currentPath = 'main'; // Track which question path we're on
        this.causeSelected = null; // Track which cause was selected
        this.initializeQuestionFlow();
    }

    initializeQuestions() {
        return [
            // Main Depression Assessment Questions (PHQ-9 based)
            {
                id: 'mood',
                category: 'main',
                title: 'Mood Assessment',
                question: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
                options: [
                    { text: 'Not at all', value: 0, weight: 0 },
                    { text: 'Several days', value: 1, weight: 1 },
                    { text: 'More than half the days', value: 2, weight: 2 },
                    { text: 'Nearly every day', value: 3, weight: 3 }
                ]
            },
            {
                id: 'interest',
                category: 'main',
                title: 'Interest & Pleasure',
                question: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
                options: [
                    { text: 'Not at all', value: 0, weight: 0 },
                    { text: 'Several days', value: 1, weight: 1 },
                    { text: 'More than half the days', value: 2, weight: 2 },
                    { text: 'Nearly every day', value: 3, weight: 3 }
                ]
            },
            {
                id: 'sleep',
                category: 'main',
                title: 'Sleep Problems',
                question: 'Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?',
                options: [
                    { text: 'Not at all', value: 0, weight: 0 },
                    { text: 'Several days', value: 1, weight: 1 },
                    { text: 'More than half the days', value: 2, weight: 2 },
                    { text: 'Nearly every day', value: 3, weight: 3 }
                ]
            },
            {
                id: 'energy',
                category: 'main',
                title: 'Energy Levels',
                question: 'Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?',
                options: [
                    { text: 'Not at all', value: 0, weight: 0 },
                    { text: 'Several days', value: 1, weight: 1 },
                    { text: 'More than half the days', value: 2, weight: 2 },
                    { text: 'Nearly every day', value: 3, weight: 3 }
                ]
            },
            {
                id: 'appetite',
                category: 'main',
                title: 'Appetite Changes',
                question: 'Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?',
                options: [
                    { text: 'Not at all', value: 0, weight: 0 },
                    { text: 'Several days', value: 1, weight: 1 },
                    { text: 'More than half the days', value: 2, weight: 2 },
                    { text: 'Nearly every day', value: 3, weight: 3 }
                ]
            },
            {
                id: 'self_worth',
                category: 'main',
                title: 'Self-Worth',
                question: 'Over the last 2 weeks, how often have you been bothered by feeling bad about yourself, or that you are a failure, or have let yourself or your family down?',
                options: [
                    { text: 'Not at all', value: 0, weight: 0 },
                    { text: 'Several days', value: 1, weight: 1 },
                    { text: 'More than half the days', value: 2, weight: 2 },
                    { text: 'Nearly every day', value: 3, weight: 3 }
                ]
            },
            {
                id: 'concentration',
                category: 'main',
                title: 'Concentration',
                question: 'Over the last 2 weeks, how often have you been bothered by trouble concentrating on things, such as reading the newspaper or watching television?',
                options: [
                    { text: 'Not at all', value: 0, weight: 0 },
                    { text: 'Several days', value: 1, weight: 1 },
                    { text: 'More than half the days', value: 2, weight: 2 },
                    { text: 'Nearly every day', value: 3, weight: 3 }
                ]
            },
            {
                id: 'movement',
                category: 'main',
                title: 'Physical Movement',
                question: 'Over the last 2 weeks, how often have you been bothered by moving or speaking so slowly that other people could have noticed, or the opposite - being so fidgety or restless that you have been moving around a lot more than usual?',
                options: [
                    { text: 'Not at all', value: 0, weight: 0 },
                    { text: 'Several days', value: 1, weight: 1 },
                    { text: 'More than half the days', value: 2, weight: 2 },
                    { text: 'Nearly every day', value: 3, weight: 3 }
                ]
            },
            {
                id: 'suicidal',
                category: 'main',
                title: 'Suicidal Thoughts',
                question: 'Over the last 2 weeks, how often have you been bothered by thoughts that you would be better off dead, or of hurting yourself in some way?',
                options: [
                    { text: 'Not at all', value: 0, weight: 0 },
                    { text: 'Several days', value: 1, weight: 1 },
                    { text: 'More than half the days', value: 2, weight: 2 },
                    { text: 'Nearly every day', value: 3, weight: 3 }
                ]
            },
            {
                id: 'duration',
                category: 'main',
                title: 'Duration',
                question: 'How long have you been experiencing these feelings?',
                options: [
                    { text: 'Less than 2 weeks', value: 0, weight: 0 },
                    { text: '2-4 weeks', value: 1, weight: 1 },
                    { text: '1-3 months', value: 2, weight: 2 },
                    { text: 'More than 3 months', value: 3, weight: 3 }
                ]
            },
            {
                id: 'impact',
                category: 'main',
                title: 'Daily Impact',
                question: 'How much have these problems affected your ability to do your work, take care of things at home, or get along with other people?',
                options: [
                    { text: 'Not difficult at all', value: 0, weight: 0 },
                    { text: 'Somewhat difficult', value: 1, weight: 1 },
                    { text: 'Very difficult', value: 2, weight: 2 },
                    { text: 'Extremely difficult', value: 3, weight: 3 }
                ]
            },
            // Cause Identification Questions
            {
                id: 'cause_identification',
                category: 'cause',
                title: 'Potential Causes',
                question: 'What do you think might be contributing to how you\'re feeling? (Select all that apply)',
                options: [
                    { text: 'Loneliness or social isolation', value: 'loneliness', weight: 0 },
                    { text: 'Work or job-related stress', value: 'work', weight: 0 },
                    { text: 'Financial difficulties', value: 'financial', weight: 0 },
                    { text: 'Relationship problems', value: 'relationships', weight: 0 },
                    { text: 'Health issues', value: 'health', weight: 0 },
                    { text: 'Family problems', value: 'family', weight: 0 },
                    { text: 'Academic pressure', value: 'academic', weight: 0 },
                    { text: 'Grief or loss', value: 'grief', weight: 0 },
                    { text: 'Other reasons', value: 'other', weight: 0 }
                ],
                multiple: true
            },
            // Loneliness-specific questions
            {
                id: 'loneliness_friends',
                category: 'loneliness',
                title: 'Social Connections',
                question: 'How many close friends do you have that you can talk to about personal matters?',
                options: [
                    { text: 'None', value: 0, weight: 3 },
                    { text: '1-2 friends', value: 1, weight: 2 },
                    { text: '3-5 friends', value: 2, weight: 1 },
                    { text: 'More than 5 friends', value: 3, weight: 0 }
                ]
            },
            {
                id: 'loneliness_frequency',
                category: 'loneliness',
                title: 'Social Interaction',
                question: 'How often do you see or talk to your close friends?',
                options: [
                    { text: 'Never or rarely', value: 0, weight: 3 },
                    { text: 'Once a month or less', value: 1, weight: 2 },
                    { text: 'A few times a month', value: 2, weight: 1 },
                    { text: 'Weekly or more often', value: 3, weight: 0 }
                ]
            },
            {
                id: 'loneliness_quality',
                category: 'loneliness',
                title: 'Relationship Quality',
                question: 'How satisfied are you with the quality of your social relationships?',
                options: [
                    { text: 'Very dissatisfied', value: 0, weight: 3 },
                    { text: 'Somewhat dissatisfied', value: 1, weight: 2 },
                    { text: 'Somewhat satisfied', value: 2, weight: 1 },
                    { text: 'Very satisfied', value: 3, weight: 0 }
                ]
            },
            // Work-related questions
            {
                id: 'work_satisfaction',
                category: 'work',
                title: 'Job Satisfaction',
                question: 'How satisfied are you with your current job or work situation?',
                options: [
                    { text: 'Very dissatisfied', value: 0, weight: 3 },
                    { text: 'Somewhat dissatisfied', value: 1, weight: 2 },
                    { text: 'Somewhat satisfied', value: 2, weight: 1 },
                    { text: 'Very satisfied', value: 3, weight: 0 }
                ]
            },
            {
                id: 'work_stress',
                category: 'work',
                title: 'Work Stress',
                question: 'How would you rate your current level of work-related stress?',
                options: [
                    { text: 'No stress', value: 0, weight: 0 },
                    { text: 'Low stress', value: 1, weight: 1 },
                    { text: 'Moderate stress', value: 2, weight: 2 },
                    { text: 'High stress', value: 3, weight: 3 }
                ]
            },
            {
                id: 'work_balance',
                category: 'work',
                title: 'Work-Life Balance',
                question: 'How would you describe your work-life balance?',
                options: [
                    { text: 'Excellent balance', value: 0, weight: 0 },
                    { text: 'Good balance', value: 1, weight: 1 },
                    { text: 'Poor balance', value: 2, weight: 2 },
                    { text: 'No balance at all', value: 3, weight: 3 }
                ]
            },
            // Financial stress questions
            {
                id: 'financial_worry',
                category: 'financial',
                title: 'Financial Concerns',
                question: 'How often do you worry about your financial situation?',
                options: [
                    { text: 'Never', value: 0, weight: 0 },
                    { text: 'Rarely', value: 1, weight: 1 },
                    { text: 'Sometimes', value: 2, weight: 2 },
                    { text: 'Often or constantly', value: 3, weight: 3 }
                ]
            },
            {
                id: 'financial_impact',
                category: 'financial',
                title: 'Financial Impact',
                question: 'How much do financial concerns affect your daily life?',
                options: [
                    { text: 'Not at all', value: 0, weight: 0 },
                    { text: 'Slightly', value: 1, weight: 1 },
                    { text: 'Moderately', value: 2, weight: 2 },
                    { text: 'Significantly', value: 3, weight: 3 }
                ]
            },
            // Relationship questions
            {
                id: 'relationship_satisfaction',
                category: 'relationships',
                title: 'Relationship Satisfaction',
                question: 'How satisfied are you with your current romantic relationship (if applicable)?',
                options: [
                    { text: 'Not in a relationship', value: 0, weight: 1 },
                    { text: 'Very dissatisfied', value: 1, weight: 3 },
                    { text: 'Somewhat dissatisfied', value: 2, weight: 2 },
                    { text: 'Somewhat satisfied', value: 3, weight: 1 },
                    { text: 'Very satisfied', value: 4, weight: 0 }
                ]
            },
            {
                id: 'relationship_conflict',
                category: 'relationships',
                title: 'Relationship Conflicts',
                question: 'How often do you experience conflicts in your relationships?',
                options: [
                    { text: 'Never', value: 0, weight: 0 },
                    { text: 'Rarely', value: 1, weight: 1 },
                    { text: 'Sometimes', value: 2, weight: 2 },
                    { text: 'Often', value: 3, weight: 3 }
                ]
            },
            // Health-related questions
            {
                id: 'health_concerns',
                category: 'health',
                title: 'Health Concerns',
                question: 'How much do health issues affect your mood and daily functioning?',
                options: [
                    { text: 'Not at all', value: 0, weight: 0 },
                    { text: 'Slightly', value: 1, weight: 1 },
                    { text: 'Moderately', value: 2, weight: 2 },
                    { text: 'Significantly', value: 3, weight: 3 }
                ]
            },
            {
                id: 'health_management',
                category: 'health',
                title: 'Health Management',
                question: 'How well are you managing your health conditions?',
                options: [
                    { text: 'Very well', value: 0, weight: 0 },
                    { text: 'Somewhat well', value: 1, weight: 1 },
                    { text: 'Poorly', value: 2, weight: 2 },
                    { text: 'Very poorly', value: 3, weight: 3 }
                ]
            }
        ];
    }

    initializeQuestionFlow() {
        // Start with main questions only
        this.currentQuestions = this.allQuestions.filter(q => q.category === 'main');
        this.totalQuestions = this.currentQuestions.length;
    }

    startQuiz() {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('quizScreen').classList.remove('hidden');
        this.showQuestion();
    }

    showQuestion() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        const questionCard = document.getElementById('questionCard');
        
        // Update progress
        const progress = ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('progressText').textContent = `${this.currentQuestionIndex + 1} of ${this.totalQuestions}`;
        
        // Update question content
        document.getElementById('questionTitle').textContent = question.title;
        document.getElementById('questionText').textContent = question.question;
        
        // Generate options
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('button');
            optionElement.className = 'option-button';
            optionElement.innerHTML = `
                <span>${option.text}</span>
                <i class="fas fa-check option-icon"></i>
            `;
            
            optionElement.onclick = () => this.selectOption(option, optionElement, question);
            optionsContainer.appendChild(optionElement);
        });
        
        // Update navigation buttons
        this.updateNavigationButtons();
        
        // Add slide-in animation
        questionCard.classList.remove('slide-in');
        setTimeout(() => questionCard.classList.add('slide-in'), 10);
    }

    selectOption(option, element, question) {
        // Handle multiple selection for cause identification
        if (question.multiple) {
            element.classList.toggle('selected');
            
            // Store multiple selections
            if (!this.answers[question.id]) {
                this.answers[question.id] = [];
            }
            
            const index = this.answers[question.id].indexOf(option.value);
            if (index > -1) {
                this.answers[question.id].splice(index, 1);
            } else {
                this.answers[question.id].push(option.value);
            }
        } else {
            // Single selection
            const options = document.querySelectorAll('.option-button');
            options.forEach(opt => {
                opt.classList.remove('selected');
            });
            
            element.classList.add('selected');
            this.answers[question.id] = option.value;
        }
        
        this.updateNavigationButtons();
    }

    handleCauseSelection() {
        const selectedCauses = this.answers['cause_identification'] || [];
        
        // Determine which cause to focus on (prioritize the first one selected)
        if (selectedCauses.includes('loneliness')) {
            this.causeSelected = 'loneliness';
        } else if (selectedCauses.includes('work')) {
            this.causeSelected = 'work';
        } else if (selectedCauses.includes('financial')) {
            this.causeSelected = 'financial';
        } else if (selectedCauses.includes('relationships')) {
            this.causeSelected = 'relationships';
        } else if (selectedCauses.includes('health')) {
            this.causeSelected = 'health';
        }
        
        // Add cause-specific questions to the current flow
        if (this.causeSelected) {
            this.addCauseQuestions(this.causeSelected);
        }
    }

    addCauseQuestions(cause) {
        // Get cause-specific questions
        const causeQuestions = this.allQuestions.filter(q => q.category === cause);
        
        // Check if cause questions are already added to avoid duplicates
        const alreadyAdded = this.currentQuestions.some(q => q.category === cause);
        if (alreadyAdded) {
            return; // Don't add duplicates
        }
        
        // Add them to the current questions array after the cause identification question
        const causeIndex = this.currentQuestions.findIndex(q => q.id === 'cause_identification');
        if (causeIndex !== -1) {
            // Insert cause questions after the cause identification question
            this.currentQuestions.splice(causeIndex + 1, 0, ...causeQuestions);
            this.totalQuestions = this.currentQuestions.length;
            console.log(`Added ${causeQuestions.length} ${cause} questions. Total questions: ${this.totalQuestions}`);
        }
    }

    updateNavigationButtons() {
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');
        
        prevButton.disabled = this.currentQuestionIndex === 0;
        
        const currentQuestion = this.currentQuestions[this.currentQuestionIndex];
        let hasAnswer = false;
        
        if (currentQuestion.multiple) {
            hasAnswer = this.answers[currentQuestion.id] && this.answers[currentQuestion.id].length > 0;
        } else {
            hasAnswer = this.answers[currentQuestion.id] !== undefined;
        }
        
        nextButton.disabled = !hasAnswer;
    }

    nextQuestion() {
        // Check if we just answered the cause identification question
        const currentQuestion = this.currentQuestions[this.currentQuestionIndex];
        if (currentQuestion && currentQuestion.id === 'cause_identification') {
            this.handleCauseSelection();
        }
        
        if (this.currentQuestionIndex < this.totalQuestions - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        } else {
            this.showResults();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    }

    calculateScore() {
        let totalScore = 0;
        let maxScore = 0;
        
        // Calculate main depression score (PHQ-9 based)
        const mainQuestions = this.currentQuestions.filter(q => q.category === 'main');
        let mainScore = 0;
        let mainMaxScore = 0;
        
        mainQuestions.forEach(question => {
            const answer = this.answers[question.id];
            if (answer !== undefined) {
                const option = question.options.find(opt => opt.value === answer);
                if (option) {
                    mainScore += option.weight;
                    mainMaxScore += Math.max(...question.options.map(opt => opt.weight));
                }
            }
        });
        
        // Calculate cause-specific scores
        let causeScore = 0;
        let causeMaxScore = 0;
        
        if (this.causeSelected) {
            const causeQuestions = this.currentQuestions.filter(q => q.category === this.causeSelected);
            causeQuestions.forEach(question => {
                const answer = this.answers[question.id];
                if (answer !== undefined) {
                    const option = question.options.find(opt => opt.value === answer);
                    if (option) {
                        causeScore += option.weight;
                        causeMaxScore += Math.max(...question.options.map(opt => opt.weight));
                    }
                }
            });
        }
        
        // Weight the scores (70% main depression, 30% cause-specific)
        totalScore = (mainScore * 0.7) + (causeScore * 0.3);
        maxScore = (mainMaxScore * 0.7) + (causeMaxScore * 0.3);
        
        return {
            score: Math.round(totalScore),
            maxScore: Math.round(maxScore),
            percentage: Math.round((totalScore / maxScore) * 100),
            mainScore: mainScore,
            causeScore: causeScore
        };
    }

    getSeverityLevel(percentage) {
        if (percentage <= 20) return { level: 'Minimal', color: 'green', icon: 'fa-smile' };
        if (percentage <= 40) return { level: 'Mild', color: 'yellow', icon: 'fa-meh' };
        if (percentage <= 60) return { level: 'Moderate', color: 'orange', icon: 'fa-frown' };
        if (percentage <= 80) return { level: 'Severe', color: 'red', icon: 'fa-sad-tear' };
        return { level: 'Extreme', color: 'red', icon: 'fa-exclamation-triangle' };
    }

    getSeverityDescription(severityLevel) {
        const descriptions = {
            'Minimal': 'You\'re doing well! Keep up the good work.',
            'Mild': 'Some concerns detected. Consider self-care strategies.',
            'Moderate': 'Moderate symptoms present. Professional help may be beneficial.',
            'Severe': 'Significant symptoms detected. Professional help is recommended.',
            'Extreme': 'Severe symptoms present. Please seek immediate professional help.'
        };
        return descriptions[severityLevel] || 'Assessment complete.';
    }

    showResults() {
        document.getElementById('quizScreen').classList.add('hidden');
        document.getElementById('resultsScreen').classList.remove('hidden');
        
        const scoreData = this.calculateScore();
        const severity = this.getSeverityLevel(scoreData.percentage);
        
        // Update score display
        document.getElementById('scoreValue').textContent = scoreData.score;
        document.getElementById('scoreOutOf').textContent = `out of ${scoreData.maxScore}`;
        document.getElementById('scorePercentage').textContent = `${scoreData.percentage}%`;
        
        // Update severity display
        const severityIcon = document.getElementById('severityIcon');
        severityIcon.className = `score-circle ${severity.level.toLowerCase()}`;
        severityIcon.innerHTML = `<i class="fas ${severity.icon}"></i>`;
        
        document.getElementById('severityLevel').textContent = severity.level;
        document.getElementById('severityLevel').className = `severity-level`;
        
        // Update severity description
        document.getElementById('severityDescription').textContent = this.getSeverityDescription(severity.level);
        
        // Update score circle color
        const scoreCircle = document.getElementById('scoreCircle');
        scoreCircle.className = `score-circle ${severity.level.toLowerCase()}`;
        
        // Generate detailed results
        this.generateDetailedResults(scoreData, severity);
        
        // Generate recommendations
        this.generateRecommendations(scoreData, severity);
        
        // Show follow-up question
        this.showFollowUpQuestion(scoreData, severity);
    }

    generateDetailedResults(scoreData, severity) {
        const container = document.getElementById('detailedResults');
        container.innerHTML = '';
        
        const results = [
            {
                title: 'Depression Symptoms',
                score: scoreData.mainScore,
                maxScore: 27, // PHQ-9 max score
                description: this.getDepressionDescription(scoreData.mainScore, 27)
            }
        ];
        
        if (this.causeSelected && scoreData.causeScore > 0) {
            const causeMaxScore = this.getCauseMaxScore(this.causeSelected);
            results.push({
                title: this.getCauseTitle(this.causeSelected),
                score: scoreData.causeScore,
                maxScore: causeMaxScore,
                description: this.getCauseDescription(this.causeSelected, scoreData.causeScore, causeMaxScore)
            });
        }
        
        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'result-card';
            resultElement.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="font-weight: 600; color: var(--text-primary);">${result.title}</h4>
                    <span style="font-size: 0.875rem; color: var(--text-secondary);">${result.score}/${result.maxScore}</span>
                </div>
                <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5;">${result.description}</p>
            `;
            container.appendChild(resultElement);
        });
    }

    generateRecommendations(scoreData, severity) {
        const container = document.getElementById('recommendations');
        container.innerHTML = '';
        
        const recommendations = this.getRecommendations(scoreData, severity);
        
        recommendations.forEach(rec => {
            const recElement = document.createElement('div');
            recElement.className = 'recommendation-item';
            recElement.innerHTML = `
                <div class="recommendation-icon">
                    <i class="fas ${rec.icon}"></i>
                </div>
                <div class="recommendation-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                </div>
            `;
            container.appendChild(recElement);
        });
    }

    showFollowUpQuestion(scoreData, severity) {
        // Add follow-up question section to the results
        const recommendationsContainer = document.getElementById('recommendations');
        
        const followUpSection = document.createElement('div');
        followUpSection.className = 'follow-up-section';
        followUpSection.style.cssText = `
            margin-top: 2rem;
            padding: 1.5rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-color);
        `;
        
        followUpSection.innerHTML = `
            <h3 class="question-title" style="font-size: 1.25rem; margin-bottom: 1rem;">Want to Learn More?</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">
                Would you like to answer a few more questions to help identify potential triggers or contributing factors to your current mental health state? This can provide more personalized insights and recommendations.
            </p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button onclick="startTriggerAssessment()" class="btn btn-primary">
                    <i class="fas fa-search"></i>
                    Yes, Continue Assessment
                </button>
                <button onclick="showFinalConclusion()" class="btn btn-secondary">
                    <i class="fas fa-check"></i>
                    No, Show Final Results
                </button>
            </div>
        `;
        
        recommendationsContainer.appendChild(followUpSection);
    }

    startTriggerAssessment() {
        // Hide the follow-up question and show trigger assessment
        const followUpSection = document.querySelector('.follow-up-section');
        if (followUpSection) {
            followUpSection.remove();
        }
        
        // Show trigger assessment questions
        this.showTriggerAssessment();
    }

    showTriggerAssessment() {
        // Create trigger assessment section
        const recommendationsContainer = document.getElementById('recommendations');
        
        const triggerSection = document.createElement('div');
        triggerSection.className = 'trigger-assessment';
        triggerSection.style.cssText = `
            margin-top: 2rem;
            padding: 1.5rem;
            background: var(--bg-primary);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-color);
        `;
        
        triggerSection.innerHTML = `
            <h3 class="question-title" style="font-size: 1.25rem; margin-bottom: 1rem;">Identifying Potential Triggers</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">
                Let's explore what might be contributing to your current mental health state. Select all that apply:
            </p>
            <div class="options-container" style="margin-bottom: 1.5rem;">
                <button class="option-button trigger-option" data-trigger="loneliness">
                    <span>Loneliness or social isolation</span>
                    <i class="fas fa-check option-icon"></i>
                </button>
                <button class="option-button trigger-option" data-trigger="work">
                    <span>Work or job-related stress</span>
                    <i class="fas fa-check option-icon"></i>
                </button>
                <button class="option-button trigger-option" data-trigger="financial">
                    <span>Financial difficulties or money worries</span>
                    <i class="fas fa-check option-icon"></i>
                </button>
                <button class="option-button trigger-option" data-trigger="relationships">
                    <span>Relationship problems or conflicts</span>
                    <i class="fas fa-check option-icon"></i>
                </button>
                <button class="option-button trigger-option" data-trigger="health">
                    <span>Health issues or chronic illness</span>
                    <i class="fas fa-check option-icon"></i>
                </button>
                <button class="option-button trigger-option" data-trigger="family">
                    <span>Family problems or responsibilities</span>
                    <i class="fas fa-check option-icon"></i>
                </button>
                <button class="option-button trigger-option" data-trigger="academic">
                    <span>Academic pressure or school stress</span>
                    <i class="fas fa-check option-icon"></i>
                </button>
                <button class="option-button trigger-option" data-trigger="grief">
                    <span>Grief, loss, or bereavement</span>
                    <i class="fas fa-check option-icon"></i>
                </button>
                <button class="option-button trigger-option" data-trigger="trauma">
                    <span>Past trauma or difficult experiences</span>
                    <i class="fas fa-check option-icon"></i>
                </button>
                <button class="option-button trigger-option" data-trigger="other">
                    <span>Other personal circumstances</span>
                    <i class="fas fa-check option-icon"></i>
                </button>
            </div>
            <div style="text-align: center;">
                <button onclick="generateComprehensiveConclusion()" class="btn btn-primary" id="generateConclusionBtn" disabled>
                    <i class="fas fa-chart-line"></i>
                    Generate Comprehensive Analysis
                </button>
            </div>
        `;
        
        recommendationsContainer.appendChild(triggerSection);
        
        // Add event listeners for trigger selection
        const triggerOptions = triggerSection.querySelectorAll('.trigger-option');
        triggerOptions.forEach(option => {
            option.addEventListener('click', () => {
                option.classList.toggle('selected');
                this.updateTriggerSelection();
            });
        });
    }

    updateTriggerSelection() {
        const selectedTriggers = document.querySelectorAll('.trigger-option.selected');
        const generateBtn = document.getElementById('generateConclusionBtn');
        
        if (selectedTriggers.length > 0) {
            generateBtn.disabled = false;
        } else {
            generateBtn.disabled = true;
        }
    }

    generateComprehensiveConclusion() {
        const selectedTriggers = Array.from(document.querySelectorAll('.trigger-option.selected'))
            .map(option => option.dataset.trigger);
        
        // Remove trigger assessment section
        const triggerSection = document.querySelector('.trigger-assessment');
        if (triggerSection) {
            triggerSection.remove();
        }
        
        // Show comprehensive conclusion
        this.showComprehensiveConclusion(selectedTriggers);
    }

    showComprehensiveConclusion(selectedTriggers) {
        const recommendationsContainer = document.getElementById('recommendations');
        
        const conclusionSection = document.createElement('div');
        conclusionSection.className = 'comprehensive-conclusion';
        conclusionSection.style.cssText = `
            margin-top: 2rem;
            padding: 2rem;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
            color: white;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
        `;
        
        const triggerAnalysis = this.analyzeTriggers(selectedTriggers);
        const personalizedRecommendations = this.getPersonalizedRecommendations(selectedTriggers);
        
        conclusionSection.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                    <i class="fas fa-lightbulb" style="font-size: 1.5rem;"></i>
                </div>
                <h3 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">Comprehensive Mental Health Analysis</h3>
                <p style="opacity: 0.9; font-size: 1rem;">Based on your assessment and identified triggers</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
                <h4 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">
                    <i class="fas fa-search" style="margin-right: 0.5rem;"></i>
                    Identified Contributing Factors
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    ${selectedTriggers.map(trigger => `
                        <div style="background: rgba(255,255,255,0.1); padding: 0.75rem; border-radius: var(--radius-md); text-align: center;">
                            <i class="fas ${this.getTriggerIcon(trigger)}" style="margin-bottom: 0.5rem; display: block; font-size: 1.25rem;"></i>
                            <span style="font-size: 0.875rem; font-weight: 500;">${this.getTriggerName(trigger)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
                <h4 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">
                    <i class="fas fa-chart-line" style="margin-right: 0.5rem;"></i>
                    Analysis Summary
                </h4>
                <p style="line-height: 1.6; opacity: 0.9;">${triggerAnalysis}</p>
            </div>
            
            <div style="background: rgba(255,255,255,0.1); border-radius: var(--radius-lg); padding: 1.5rem;">
                <h4 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">
                    <i class="fas fa-heart" style="margin-right: 0.5rem;"></i>
                    Personalized Action Plan
                </h4>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    ${personalizedRecommendations.map(rec => `
                        <div style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: rgba(255,255,255,0.1); border-radius: var(--radius-md);">
                            <i class="fas ${rec.icon}" style="margin-top: 0.125rem; opacity: 0.8;"></i>
                            <div>
                                <div style="font-weight: 500; margin-bottom: 0.25rem;">${rec.title}</div>
                                <div style="font-size: 0.875rem; opacity: 0.8; line-height: 1.4;">${rec.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
                <p style="font-size: 0.875rem; opacity: 0.8; margin-bottom: 1rem;">
                    Remember: This assessment is a starting point. Consider sharing these insights with a mental health professional for personalized guidance.
                </p>
                <button onclick="showFinalConclusion()" class="btn" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3);">
                    <i class="fas fa-flag-checkered"></i>
                    Complete Assessment
                </button>
            </div>
        `;
        
        recommendationsContainer.appendChild(conclusionSection);
    }

    analyzeTriggers(triggers) {
        if (triggers.length === 0) {
            return "No specific triggers were identified. Your mental health concerns may be related to biological factors, life transitions, or other personal circumstances not covered in this assessment.";
        }
        
        const triggerCount = triggers.length;
        const primaryTriggers = triggers.slice(0, 3);
        
        let analysis = `You've identified ${triggerCount} potential contributing factor${triggerCount > 1 ? 's' : ''} to your current mental health state. `;
        
        if (triggerCount === 1) {
            analysis += `The primary factor appears to be ${this.getTriggerName(triggers[0])}. `;
        } else if (triggerCount <= 3) {
            analysis += `The main factors include ${primaryTriggers.map(t => this.getTriggerName(t)).join(', ')}. `;
        } else {
            analysis += `Multiple factors are at play, with the primary ones being ${primaryTriggers.map(t => this.getTriggerName(t)).join(', ')}. `;
        }
        
        // Add specific insights based on triggers
        if (triggers.includes('loneliness')) {
            analysis += "Social connection appears to be a significant concern, which is one of the most common contributors to depression. ";
        }
        if (triggers.includes('work')) {
            analysis += "Work-related stress can significantly impact mental health and overall life satisfaction. ";
        }
        if (triggers.includes('financial')) {
            analysis += "Financial stress is a major source of anxiety and can contribute to feelings of hopelessness. ";
        }
        if (triggers.includes('relationships')) {
            analysis += "Relationship difficulties can deeply affect emotional well-being and self-worth. ";
        }
        
        analysis += "Understanding these contributing factors is the first step toward developing an effective treatment and coping strategy.";
        
        return analysis;
    }

    getPersonalizedRecommendations(triggers) {
        const recommendations = [];
        
        // General recommendations
        recommendations.push({
            icon: 'fa-user-md',
            title: 'Professional Support',
            description: 'Consider reaching out to a mental health professional who can provide personalized treatment based on your specific triggers and circumstances.'
        });
        
        // Trigger-specific recommendations
        if (triggers.includes('loneliness')) {
            recommendations.push({
                icon: 'fa-users',
                title: 'Build Social Connections',
                description: 'Start small - join a club, volunteer, or reach out to old friends. Even brief social interactions can help reduce feelings of isolation.'
            });
        }
        
        if (triggers.includes('work')) {
            recommendations.push({
                icon: 'fa-briefcase',
                title: 'Work-Life Balance',
                description: 'Set clear boundaries between work and personal time. Consider discussing workload with your supervisor or exploring stress management techniques.'
            });
        }
        
        if (triggers.includes('financial')) {
            recommendations.push({
                icon: 'fa-piggy-bank',
                title: 'Financial Planning',
                description: 'Meet with a financial advisor or counselor. Many communities offer free financial planning resources and debt counseling services.'
            });
        }
        
        if (triggers.includes('relationships')) {
            recommendations.push({
                icon: 'fa-heart',
                title: 'Relationship Support',
                description: 'Consider couples counseling or individual therapy to address relationship patterns. Communication skills training can be very helpful.'
            });
        }
        
        if (triggers.includes('health')) {
            recommendations.push({
                icon: 'fa-medkit',
                title: 'Health Management',
                description: 'Work with your healthcare provider to manage chronic conditions. Mental health and physical health are closely connected.'
            });
        }
        
        if (triggers.includes('grief')) {
            recommendations.push({
                icon: 'fa-hands-helping',
                title: 'Grief Support',
                description: 'Consider joining a grief support group or working with a therapist who specializes in bereavement counseling.'
            });
        }
        
        // Self-care recommendations
        recommendations.push({
            icon: 'fa-spa',
            title: 'Self-Care Routine',
            description: 'Develop a daily routine that includes physical activity, healthy eating, adequate sleep, and activities you enjoy.'
        });
        
        recommendations.push({
            icon: 'fa-book',
            title: 'Mindfulness & Stress Management',
            description: 'Practice mindfulness, meditation, or deep breathing exercises. These techniques can help manage stress and improve emotional regulation.'
        });
        
        return recommendations;
    }

    getTriggerIcon(trigger) {
        const icons = {
            loneliness: 'fa-users',
            work: 'fa-briefcase',
            financial: 'fa-dollar-sign',
            relationships: 'fa-heart',
            health: 'fa-medkit',
            family: 'fa-home',
            academic: 'fa-graduation-cap',
            grief: 'fa-hands-helping',
            trauma: 'fa-shield-alt',
            other: 'fa-question-circle'
        };
        return icons[trigger] || 'fa-question-circle';
    }

    getTriggerName(trigger) {
        const names = {
            loneliness: 'Social Isolation',
            work: 'Work Stress',
            financial: 'Financial Stress',
            relationships: 'Relationship Issues',
            health: 'Health Concerns',
            family: 'Family Problems',
            academic: 'Academic Pressure',
            grief: 'Grief & Loss',
            trauma: 'Past Trauma',
            other: 'Other Factors'
        };
        return names[trigger] || 'Unknown';
    }

    showFinalConclusion() {
        // Remove any existing conclusion sections
        const existingConclusion = document.querySelector('.comprehensive-conclusion');
        if (existingConclusion) {
            existingConclusion.remove();
        }
        
        const existingFollowUp = document.querySelector('.follow-up-section');
        if (existingFollowUp) {
            existingFollowUp.remove();
        }
        
        const existingTrigger = document.querySelector('.trigger-assessment');
        if (existingTrigger) {
            existingTrigger.remove();
        }
        
        // Show final conclusion message
        const recommendationsContainer = document.getElementById('recommendations');
        
        const finalSection = document.createElement('div');
        finalSection.className = 'final-conclusion';
        finalSection.style.cssText = `
            margin-top: 2rem;
            padding: 2rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-color);
            text-align: center;
        `;
        
        finalSection.innerHTML = `
            <div style="width: 60px; height: 60px; background: var(--primary-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                <i class="fas fa-check" style="color: white; font-size: 1.5rem;"></i>
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-primary);">Assessment Complete</h3>
            <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.5rem;">
                Thank you for taking the time to complete this mental health assessment. Remember that this is just one tool in understanding your mental health, and professional guidance is always recommended for comprehensive care.
            </p>
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: var(--radius-lg); padding: 1rem; margin-bottom: 1.5rem;">
                <p style="color: #92400e; font-size: 0.875rem; margin: 0;">
                    <i class="fas fa-info-circle" style="margin-right: 0.5rem;"></i>
                    <strong>Important:</strong> If you're experiencing severe symptoms or having thoughts of self-harm, please seek immediate professional help or contact emergency services.
                </p>
            </div>
        `;
        
        recommendationsContainer.appendChild(finalSection);
    }

    generatePDFReport() {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Get current assessment data
            const scoreData = this.calculateScore();
            const severity = this.getSeverityLevel(scoreData.percentage);
            const currentDate = new Date().toLocaleDateString();
            
            // Set up document
            doc.setFont('helvetica');
            
            // Header
            doc.setFontSize(20);
            doc.setTextColor(37, 99, 235); // Primary blue
            doc.text('Mental Health Assessment Report', 20, 30);
            
            doc.setFontSize(12);
            doc.setTextColor(100, 116, 139); // Secondary gray
            doc.text(`Assessment Date: ${currentDate}`, 20, 45);
            doc.text('Generated by Mental Health Assessment Tool - Canada', 20, 55);
            
            // Add line separator
            doc.setDrawColor(226, 232, 240);
            doc.line(20, 65, 190, 65);
            
            // Assessment Results Section
            doc.setFontSize(16);
            doc.setTextColor(30, 41, 59); // Primary text
            doc.text('Assessment Results', 20, 80);
            
            // Overall Score
            doc.setFontSize(12);
            doc.text(`Overall Assessment Score: ${scoreData.score}/${scoreData.maxScore} (${scoreData.percentage}%)`, 20, 95);
            doc.text(`Severity Level: ${severity.level}`, 20, 105);
            doc.text(`Description: ${this.getSeverityDescription(severity.level)}`, 20, 115);
            
            // PHQ-9 Score
            doc.text(`Depression Symptoms (PHQ-9): ${scoreData.mainScore}/27`, 20, 130);
            doc.text(`Depression Description: ${this.getDepressionDescription(scoreData.mainScore, 27)}`, 20, 140);
            
            // Cause-specific scores if available
            if (this.causeSelected && scoreData.causeScore > 0) {
                const causeMaxScore = this.getCauseMaxScore(this.causeSelected);
                doc.text(`${this.getCauseTitle(this.causeSelected)}: ${scoreData.causeScore}/${causeMaxScore}`, 20, 155);
                doc.text(`Description: ${this.getCauseDescription(this.causeSelected, scoreData.causeScore, causeMaxScore)}`, 20, 165);
            }
            
            // Add page break
            doc.addPage();
            
            // Detailed Analysis Section
            doc.setFontSize(16);
            doc.text('Detailed Analysis', 20, 30);
            
            doc.setFontSize(12);
            doc.text('This assessment is based on the Patient Health Questionnaire-9 (PHQ-9),', 20, 45);
            doc.text('a clinically validated tool for depression screening used in Canadian', 20, 55);
            doc.text('healthcare settings and recognized by Health Canada.', 20, 65);
            
            doc.text('Key Findings:', 20, 75);
            doc.text(`• Overall mental health score: ${scoreData.percentage}%`, 25, 90);
            doc.text(`• Severity classification: ${severity.level}`, 25, 100);
            doc.text(`• Primary depression symptoms score: ${scoreData.mainScore}/27`, 25, 110);
            
            if (this.causeSelected) {
                doc.text(`• Identified contributing factors: ${this.getCauseTitle(this.causeSelected)}`, 25, 125);
            }
            
            // Recommendations Section
            doc.setFontSize(16);
            doc.text('Recommendations', 20, 150);
            
            doc.setFontSize(12);
            const recommendations = this.getRecommendations(scoreData, severity);
            let yPos = 165;
            
            recommendations.forEach((rec, index) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 30;
                }
                doc.text(`${index + 1}. ${rec.title}`, 20, yPos);
                doc.setFontSize(10);
                const splitText = doc.splitTextToSize(rec.description, 170);
                doc.text(splitText, 25, yPos + 8);
                yPos += 8 + (splitText.length * 5) + 5;
                doc.setFontSize(12);
            });
            
            // Add page break
            doc.addPage();
            
            // Important Disclaimers
            doc.setFontSize(16);
            doc.text('Important Disclaimers', 20, 30);
            
            doc.setFontSize(10);
            doc.text('• This assessment is for informational purposes only and should not replace', 20, 50);
            doc.text('  professional medical advice, diagnosis, or treatment.', 20, 60);
            doc.text('• If you are experiencing severe symptoms or having thoughts of self-harm,', 20, 75);
            doc.text('  please seek immediate professional help or contact emergency services.', 20, 85);
            doc.text('• This report should be shared with your healthcare provider for proper', 20, 100);
            doc.text('  evaluation and treatment planning.', 20, 110);
            doc.text('• Mental health conditions are treatable, and help is available.', 20, 125);
            
            // Crisis Resources
            doc.setFontSize(14);
            doc.text('Crisis Resources', 20, 150);
            
            doc.setFontSize(10);
            doc.text('Crisis Services Canada: 1-833-456-4566', 20, 165);
            doc.text('Text: 45645 (4:00 PM - 12:00 AM ET)', 20, 175);
            doc.text('Kids Help Phone: 1-800-668-6868', 20, 185);
            doc.text('Emergency Services: 911 (Canada)', 20, 195);
            doc.text('Hope for Wellness: 1-855-242-3310 (Indigenous)', 20, 205);
            
            // Footer
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text('Generated by Mental Health Assessment Tool - Canada', 20, 280);
            doc.text('This report is confidential and should be kept secure.', 20, 285);
            doc.text('For Canadian healthcare providers and patients.', 20, 290);
            
            // Save the PDF
            const fileName = `Mental_Health_Assessment_${currentDate.replace(/\//g, '-')}.pdf`;
            doc.save(fileName);
            
            // Show success message
            this.showNotification('PDF report generated successfully!', 'success');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showNotification('Error generating PDF report. Please try again.', 'error');
        }
    }

    shareWithProvider() {
        try {
            const scoreData = this.calculateScore();
            const severity = this.getSeverityLevel(scoreData.percentage);
            const currentDate = new Date().toLocaleDateString();
            
            // Create provider-specific report
            const providerReport = this.createProviderReport(scoreData, severity, currentDate);
            
            // Create a temporary text area to copy the report
            const textArea = document.createElement('textarea');
            textArea.value = providerReport;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showNotification('Provider report copied to clipboard! You can now paste it into an email or document.', 'success');
            } catch (err) {
                // Fallback: show the report in a modal
                this.showProviderReportModal(providerReport);
            }
            
            document.body.removeChild(textArea);
            
        } catch (error) {
            console.error('Error sharing with provider:', error);
            this.showNotification('Error creating provider report. Please try again.', 'error');
        }
    }

    shareWithFamily() {
        try {
            const scoreData = this.calculateScore();
            const severity = this.getSeverityLevel(scoreData.percentage);
            const currentDate = new Date().toLocaleDateString();
            
            // Create family-friendly report
            const familyReport = this.createFamilyReport(scoreData, severity, currentDate);
            
            // Create a temporary text area to copy the report
            const textArea = document.createElement('textarea');
            textArea.value = familyReport;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showNotification('Family report copied to clipboard! You can now share it with your support network.', 'success');
            } catch (err) {
                // Fallback: show the report in a modal
                this.showFamilyReportModal(familyReport);
            }
            
            document.body.removeChild(textArea);
            
        } catch (error) {
            console.error('Error sharing with family:', error);
            this.showNotification('Error creating family report. Please try again.', 'error');
        }
    }

    createProviderReport(scoreData, severity, currentDate) {
        return `MENTAL HEALTH ASSESSMENT REPORT - CANADIAN HEALTHCARE PROVIDER

Assessment Date: ${currentDate}
Assessment Tool: PHQ-9 Based Depression Screening (Health Canada Recognized)

CLINICAL RESULTS:
- Overall Assessment Score: ${scoreData.score}/${scoreData.maxScore} (${scoreData.percentage}%)
- Severity Level: ${severity.level}
- PHQ-9 Depression Score: ${scoreData.mainScore}/27
- Depression Severity: ${this.getDepressionDescription(scoreData.mainScore, 27)}

${this.causeSelected ? `IDENTIFIED CONTRIBUTING FACTORS:
- Primary Factor: ${this.getCauseTitle(this.causeSelected)}
- Factor Score: ${scoreData.causeScore}/${this.getCauseMaxScore(this.causeSelected)}
- Description: ${this.getCauseDescription(this.causeSelected, scoreData.causeScore, this.getCauseMaxScore(this.causeSelected))}

` : ''}CLINICAL RECOMMENDATIONS:
${this.getRecommendations(scoreData, severity).map((rec, index) => `${index + 1}. ${rec.title}: ${rec.description}`).join('\n')}

ASSESSMENT NOTES:
- This assessment is based on the Patient Health Questionnaire-9 (PHQ-9)
- PHQ-9 is a clinically validated tool for depression screening
- Recognized by Health Canada and used in Canadian healthcare settings
- Scores should be interpreted in clinical context
- Consider follow-up assessment and clinical evaluation
- Patient may benefit from professional mental health evaluation
- Consider referral to Canadian Mental Health Association (CMHA) resources
- Provincial mental health services may be available through local health authorities

IMPORTANT: This is a screening tool and should not replace clinical assessment.
If patient reports suicidal ideation or severe symptoms, immediate evaluation is recommended.

Crisis Resources:
- Crisis Services Canada: 1-833-456-4566
- Text: 45645 (4:00 PM - 12:00 AM ET)
- Kids Help Phone: 1-800-668-6868
- Emergency Services: 911 (Canada)
- Hope for Wellness: 1-855-242-3310 (Indigenous)

Generated by Mental Health Assessment Tool - Canada
Confidential - For Canadian Healthcare Provider Use Only`;
    }

    createFamilyReport(scoreData, severity, currentDate) {
        return `MENTAL HEALTH UPDATE - FAMILY & FRIENDS

Date: ${currentDate}

Hi [Family/Friends],

I wanted to share an update about my mental health. I recently completed a professional mental health assessment, and I'd like to share the results with you so you can better understand how to support me.

ASSESSMENT RESULTS:
- Overall Mental Health Score: ${scoreData.percentage}%
- Current Level: ${severity.level}
- Assessment Description: ${this.getSeverityDescription(severity.level)}

WHAT THIS MEANS:
${this.getFamilyFriendlyExplanation(severity.level)}

HOW YOU CAN HELP:
${this.getFamilySupportSuggestions(severity.level)}

IMPORTANT NOTES:
- This assessment is just one tool in understanding mental health
- I'm sharing this to help you understand my current state
- Your support means a lot to me
- If you have concerns, please encourage me to seek professional help

RESOURCES FOR SUPPORT:
- Crisis Services Canada: 1-833-456-4566
- Text: 45645 (4:00 PM - 12:00 AM ET)
- Kids Help Phone: 1-800-668-6868
- Canadian Mental Health Association: cmha.ca
- Wellness Together Canada: wellnesstogether.ca

Thank you for being part of my support network. Your understanding and support are invaluable.

With love,
[Your Name]

---
This report was generated using a clinically-based mental health assessment tool.
For immediate crisis support, please contact emergency services at 911 (Canada).`;
    }

    getFamilyFriendlyExplanation(severityLevel) {
        const explanations = {
            'Minimal': 'I am doing well overall, but I wanted to share this assessment to keep you informed about my mental health journey.',
            'Mild': 'I am experiencing some mild concerns that I am managing. Your support and understanding are helpful as I work through these challenges.',
            'Moderate': 'I am going through a moderate period of difficulty. Your support and encouragement are very important to me right now.',
            'Severe': 'I am experiencing significant challenges with my mental health. Your support is crucial, and I may need professional help.',
            'Extreme': 'I am going through a very difficult time with my mental health. Your support is essential, and I need professional help immediately.'
        };
        return explanations[severityLevel] || 'I wanted to share this assessment to keep you informed about my mental health.';
    }

    getFamilySupportSuggestions(severityLevel) {
        const suggestions = {
            'Minimal': '- Continue to be a good listener\n- Encourage healthy activities\n- Check in regularly\n- Celebrate positive moments',
            'Mild': '- Be patient and understanding\n- Encourage self-care activities\n- Offer to help with daily tasks\n- Suggest professional support if needed',
            'Moderate': '- Provide emotional support\n- Help with practical tasks\n- Encourage professional help\n- Be available for conversations',
            'Severe': '- Encourage immediate professional help\n- Provide constant support\n- Help with crisis planning\n- Stay connected and check in frequently',
            'Extreme': '- Urge immediate professional intervention\n- Provide 24/7 support if possible\n- Help access emergency services\n- Do not leave alone if suicidal'
        };
        return suggestions[severityLevel] || '- Be supportive and understanding\n- Encourage professional help\n- Stay connected and available';
    }

    showProviderReportModal(report) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: var(--radius-lg); padding: 2rem; max-width: 600px; max-height: 80vh; overflow-y: auto; margin: 1rem;">
                <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Provider Report</h3>
                <pre style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); font-size: 0.875rem; line-height: 1.5; white-space: pre-wrap; margin-bottom: 1rem;">${report}</pre>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="this.closest('.modal').remove()" class="btn btn-secondary">Close</button>
                    <button onclick="navigator.clipboard.writeText('${report.replace(/'/g, "\\'")}').then(() => this.closest('.modal').remove())" class="btn btn-primary">Copy to Clipboard</button>
                </div>
            </div>
        `;
        
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    showFamilyReportModal(report) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: var(--radius-lg); padding: 2rem; max-width: 600px; max-height: 80vh; overflow-y: auto; margin: 1rem;">
                <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Family Report</h3>
                <pre style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); font-size: 0.875rem; line-height: 1.5; white-space: pre-wrap; margin-bottom: 1rem;">${report}</pre>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="this.closest('.modal').remove()" class="btn btn-secondary">Close</button>
                    <button onclick="navigator.clipboard.writeText('${report.replace(/'/g, "\\'")}').then(() => this.closest('.modal').remove())" class="btn btn-primary">Copy to Clipboard</button>
                </div>
            </div>
        `;
        
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            color: white;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getDepressionDescription(score, maxScore = 27) {
        const percentage = (score / maxScore) * 100;
        if (percentage <= 20) return 'Minimal depression symptoms. You\'re doing well!';
        if (percentage <= 40) return 'Mild depression symptoms. Consider self-care strategies.';
        if (percentage <= 60) return 'Moderate depression symptoms. Professional help may be beneficial.';
        if (percentage <= 80) return 'Moderately severe depression symptoms. Professional help is recommended.';
        return 'Severe depression symptoms. Please seek professional help immediately.';
    }

    getCauseTitle(cause) {
        const titles = {
            loneliness: 'Social Isolation',
            work: 'Work-Related Stress',
            financial: 'Financial Stress',
            relationships: 'Relationship Issues',
            health: 'Health Concerns'
        };
        return titles[cause] || 'Additional Factors';
    }

    getCauseMaxScore(cause) {
        const maxScores = {
            loneliness: 9,
            work: 9,
            financial: 6,
            relationships: 6,
            health: 6
        };
        return maxScores[cause] || 6;
    }

    getCauseDescription(cause, score, maxScore) {
        const percentage = (score / maxScore) * 100;
        const descriptions = {
            loneliness: percentage <= 33 ? 'Good social connections' : percentage <= 66 ? 'Some social challenges' : 'Significant social isolation',
            work: percentage <= 33 ? 'Work satisfaction is good' : percentage <= 66 ? 'Some work stress' : 'High work-related stress',
            financial: percentage <= 33 ? 'Financial situation is stable' : percentage <= 66 ? 'Some financial concerns' : 'Significant financial stress',
            relationships: percentage <= 33 ? 'Healthy relationships' : percentage <= 66 ? 'Some relationship challenges' : 'Significant relationship issues',
            health: percentage <= 33 ? 'Health is well managed' : percentage <= 66 ? 'Some health concerns' : 'Significant health challenges'
        };
        return descriptions[cause] || 'Additional factors identified';
    }

    getRecommendations(scoreData, severity) {
        const recommendations = [];
        
        // General recommendations based on severity
        if (severity.level === 'Minimal') {
            recommendations.push({
                icon: 'fa-heart',
                title: 'Maintain Your Well-being',
                description: 'Continue your current healthy habits. Regular exercise, good sleep, and social connections are key to maintaining mental health.'
            });
        } else if (severity.level === 'Mild') {
            recommendations.push({
                icon: 'fa-seedling',
                title: 'Self-Care Strategies',
                description: 'Consider implementing self-care routines like regular exercise, meditation, and maintaining social connections.'
            });
        } else if (severity.level === 'Moderate') {
            recommendations.push({
                icon: 'fa-user-md',
                title: 'Consider Professional Help',
                description: 'Your symptoms suggest that professional support could be beneficial. Consider speaking with a therapist or counselor.'
            });
        } else {
            recommendations.push({
                icon: 'fa-phone',
                title: 'Seek Immediate Support',
                description: 'Please consider reaching out to a mental health professional or crisis helpline. You don\'t have to face this alone.'
            });
        }
        
        // Cause-specific recommendations
        if (this.causeSelected === 'loneliness') {
            recommendations.push({
                icon: 'fa-users',
                title: 'Build Social Connections',
                description: 'Consider joining clubs, volunteering, or reaching out to old friends. Even small social interactions can help.'
            });
        } else if (this.causeSelected === 'work') {
            recommendations.push({
                icon: 'fa-briefcase',
                title: 'Work-Life Balance',
                description: 'Set boundaries between work and personal time. Consider discussing workload with your supervisor or exploring stress management techniques.'
            });
        } else if (this.causeSelected === 'financial') {
            recommendations.push({
                icon: 'fa-piggy-bank',
                title: 'Financial Planning',
                description: 'Consider meeting with a financial advisor or counselor. Many communities offer free financial planning resources.'
            });
        }
        
        // Crisis resources
        if (severity.level === 'Severe' || severity.level === 'Extreme') {
            recommendations.push({
                icon: 'fa-phone-alt',
                title: 'Crisis Resources',
                description: 'If you\'re having thoughts of self-harm, please contact the National Suicide Prevention Lifeline at 988 or your local emergency services.'
            });
        }
        
        return recommendations;
    }

    restartQuiz() {
        this.currentQuestionIndex = 0;
        this.answers = {};
        this.currentPath = 'main';
        this.causeSelected = null;
        this.initializeQuestionFlow(); // Reset the question flow
        
        document.getElementById('resultsScreen').classList.add('hidden');
        document.getElementById('welcomeScreen').classList.remove('hidden');
    }
}

// Initialize quiz when page loads
let quiz;

document.addEventListener('DOMContentLoaded', function() {
    quiz = new DepressionQuiz();
});

// Global functions for HTML onclick events
function startQuiz() {
    quiz.startQuiz();
}

function nextQuestion() {
    quiz.nextQuestion();
}

function previousQuestion() {
    quiz.previousQuestion();
}

function restartQuiz() {
    quiz.restartQuiz();
}

function startTriggerAssessment() {
    quiz.startTriggerAssessment();
}

function generateComprehensiveConclusion() {
    quiz.generateComprehensiveConclusion();
}

function showFinalConclusion() {
    quiz.showFinalConclusion();
}

function generatePDFReport() {
    quiz.generatePDFReport();
}

function shareWithProvider() {
    quiz.shareWithProvider();
}

function shareWithFamily() {
    quiz.shareWithFamily();
}

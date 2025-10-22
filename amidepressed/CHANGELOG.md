# Changelog - Depression Assessment Quiz

## Version 1.2 - Fixed Severity Description Issue

### Bug Fixes
- **Fixed Severity Description**: Resolved issue where "You're doing well!" was showing for all severity levels, including "Extreme"
- **Dynamic Severity Messages**: Severity descriptions now properly reflect the actual assessment results
- **Improved Score Calculations**: Fixed depression description calculations to use percentages instead of raw scores

### Technical Changes
- **Added `getSeverityDescription()` Method**: Dynamic severity descriptions based on actual results
- **Updated `getDepressionDescription()` Method**: Now uses percentage-based calculations instead of raw PHQ-9 scores
- **Enhanced `getCauseDescription()` Method**: Cause-specific descriptions now use percentage-based thresholds
- **Proper Score Display**: All descriptions now accurately reflect the calculated severity levels

### Severity Descriptions
- **Minimal (0-20%)**: "You're doing well! Keep up the good work."
- **Mild (21-40%)**: "Some concerns detected. Consider self-care strategies."
- **Moderate (41-60%)**: "Moderate symptoms present. Professional help may be beneficial."
- **Severe (61-80%)**: "Significant symptoms detected. Professional help is recommended."
- **Extreme (81-100%)**: "Severe symptoms present. Please seek immediate professional help."

## Version 1.1 - Fixed Question Repetition Issue

### Bug Fixes
- **Fixed Question Repetition**: Resolved issue where cause-specific questions (loneliness, work, financial, etc.) were repeating multiple times
- **Improved Question Flow Logic**: Restructured the quiz to use a dynamic question array that properly manages the flow
- **Added Duplicate Prevention**: Added checks to prevent the same cause-specific questions from being added multiple times

### Technical Changes
- **Separated Question Arrays**: 
  - `allQuestions`: Contains all possible questions
  - `currentQuestions`: Dynamic array of questions to be shown in current session
- **Improved Cause Selection Logic**: Cause-specific questions are now added only once when the user proceeds from the cause identification question
- **Better State Management**: Quiz now properly tracks which questions have been added to avoid duplicates

### How It Works Now
1. **Initial Load**: Quiz starts with only main depression assessment questions (11 questions)
2. **Cause Identification**: User selects potential causes (multiple selection allowed)
3. **Dynamic Addition**: When user clicks "Next" on cause identification, the first selected cause's questions are added to the flow
4. **No Duplicates**: System prevents adding the same cause questions multiple times
5. **Clean Flow**: Questions appear in logical order without repetition

### Question Flow
- **Main Questions (11)**: Core depression assessment based on PHQ-9
- **Cause Identification (1)**: Multi-select question about potential causes
- **Cause-Specific Questions (3-4)**: Additional questions based on selected cause
- **Total**: 15-16 questions depending on cause selection

### Testing
- Verified that loneliness questions no longer repeat
- Confirmed that other cause-specific questions work correctly
- Tested quiz restart functionality
- Validated scoring system works with new question flow

## Version 1.0 - Initial Release

### Features
- Clinical depression assessment based on PHQ-9
- Dynamic cause identification and follow-up questions
- Comprehensive scoring system
- Personalized recommendations
- Responsive design with dark mode support
- Privacy-focused (no data collection)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function InstructionsScreen() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleProceed = () => {
    if (agreed) {
      navigate('/exam');
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col p-4 sm:p-6 overflow-hidden font-sans">
      <div className="max-w-4xl mx-auto w-full bg-white border border-gray-300 shadow-sm rounded-md flex flex-col h-full">
        {/* Header */}
        <div className="bg-app-primary text-white px-6 py-4 rounded-t-md shrink-0">
          <h1 className="text-xl font-bold text-center">General Instructions</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 text-sm text-gray-800 space-y-4">
          <p className="font-semibold text-lg text-center mb-4">Please read the instructions carefully</p>

          <div className="space-y-4">
            <h3 className="font-bold underline">General Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>The total duration of the examination is <strong>200 minutes</strong>.</li>
              <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination.</li>
              <li>When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li>
              <li>The Question Palette displayed on the right side of screen will show the status of each question using the following symbols:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li><strong>White</strong>: You have not visited the question yet.</li>
                  <li><strong>Red</strong>: You have not answered the question.</li>
                  <li><strong>Green</strong>: You have answered the question.</li>
                  <li><strong>Purple</strong>: You have NOT answered the question, but have marked the question for review.</li>
                  <li><strong>Purple with Green tick</strong>: The question(s) "Answered and Marked for Review" will be considered for evaluation.</li>
                </ul>
              </li>
            </ol>

            <h3 className="font-bold underline mt-6">Navigating to a Question:</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>To answer a question, do the following:
                <ul className="list-[lower-alpha] list-inside ml-6 mt-2 space-y-1">
                  <li>Click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Note that using this option does NOT save your answer to the current question.</li>
                  <li>Click on <strong>Save & Next</strong> to save your answer for the current question and then go to the next question.</li>
                  <li>Click on <strong>Mark for Review & Next</strong> to save your answer for the current question, mark it for review, and then go to the next question.</li>
                </ul>
              </li>
            </ol>

            <h3 className="font-bold underline mt-6">Answering a Question:</h3>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Procedure for answering a multiple choice type question:
                <ul className="list-[lower-alpha] list-inside ml-6 mt-2 space-y-1">
                  <li>To select your answer, click on the button of one of the options.</li>
                  <li>To deselect your chosen answer, click on the button of the chosen option again or click on the <strong>Clear Response</strong> button.</li>
                  <li>To change your chosen answer, click on the button of another option.</li>
                  <li>To save your answer, you MUST click on the <strong>Save & Next</strong> button.</li>
                  <li>To mark the question for review, click on the <strong>Mark for Review & Next</strong> button.</li>
                </ul>
              </li>
            </ol>
          </div>
        </div>

        {/* Footer / Acknowledgement */}
        <div className="bg-gray-100 px-6 py-3 border-t border-gray-300 rounded-b-md shrink-0">
          <label className="flex items-start space-x-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="mt-0.5 w-4 h-4 text-app-primary border-gray-300 rounded focus:ring-app-primary" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="text-xs text-gray-700 leading-tight">
              I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth devices etc. /any prohibited material with me into the Examination Hall. I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from future Tests / Examinations.
            </span>
          </label>
          
          <div className="mt-3 flex justify-center">
            <Button 
              variant="primary" 
              size="md" 
              disabled={!agreed} 
              onClick={handleProceed}
              className="px-10 py-2 font-semibold"
            >
              PROCEED
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

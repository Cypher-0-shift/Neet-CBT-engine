import type { Question } from '@shared/types';
import { OptionList } from './OptionList';

interface QuestionViewerProps {
  question: Question;
}

export function QuestionViewer({ question }: QuestionViewerProps) {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-white">
      <div className="flex mb-6 border-b border-gray-100 pb-4">
        <div className="mr-4 text-xl font-bold text-gray-400">
          Q{question.questionNumber}.
        </div>
        <div className="flex-1">
          <div 
            className="text-lg text-gray-900 whitespace-pre-wrap leading-relaxed prose prose-app max-w-none"
            dangerouslySetInnerHTML={{ __html: question.questionText }}
          />
          
          {question.questionImagePath && (
            <div className="mt-4 max-w-full">
              <img 
                src={`neet-image://${question.testId}/${question.questionImagePath}`} 
                alt="Question Figure" 
                className="max-h-80 object-contain border border-gray-200 rounded"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          {question.additionalImages?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4">
              {question.additionalImages.map((imgPath, idx) => (
                <img 
                  key={idx}
                  src={`neet-image://${question.testId}/${imgPath}`} 
                  alt={`Question Figure ${idx + 2}`} 
                  className="max-h-60 object-contain border border-gray-200 rounded"
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pl-10">
        <OptionList question={question} />
      </div>
    </div>
  );
}

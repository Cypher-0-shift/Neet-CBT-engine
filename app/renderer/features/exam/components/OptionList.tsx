import { useQuestion } from '../hooks/useQuestion';
import type { Question } from '@shared/types';

interface OptionListProps {
  question: Question;
}

export function OptionList({ question }: OptionListProps) {
  const { selectedOptionId, selectOption } = useQuestion(question);

  return (
    <div className="space-y-4">
      {question.options.map((option) => {
        const isSelected = selectedOptionId === option.id;
        
        return (
          <div
            key={option.id}
            onClick={() => selectOption(option.id)}
            className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              isSelected
                ? 'border-app-primary bg-blue-50/30'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="mr-4 flex shrink-0 items-center justify-center pt-0.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isSelected
                    ? 'border-app-primary'
                    : 'border-gray-300'
                }`}
              >
                {isSelected && <div className="w-2.5 h-2.5 bg-app-primary rounded-full" />}
              </div>
            </div>
            
            <div className="flex-1">
              <span className="font-bold text-gray-700 mr-2 shrink-0">
                ({option.optionLabel})
              </span>
              <div 
                className="text-gray-900 text-lg prose prose-app max-w-none inline-block"
                dangerouslySetInnerHTML={{ __html: option.optionText }}
              />
              
              {option.optionImagePath && (
                <div className="mt-3">
                  <img 
                    src={`neet-image://${question.testId}/${option.optionImagePath}`} 
                    alt={`Option ${option.optionLabel}`} 
                    className="max-h-40 object-contain border border-gray-100 rounded"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

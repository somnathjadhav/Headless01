import React, { useState, useEffect } from 'react';

export default function SimpleCaptcha({ onVerify, error }) {
  const [question, setQuestion] = useState('Loading...');
  const [answer, setAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Generate a simple math question
  const generateQuestion = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    let questionText = '';
    let correctAnswer = 0;
    
    if (operation === '+') {
      questionText = `${num1} + ${num2}`;
      correctAnswer = num1 + num2;
    } else {
      // Ensure positive result for subtraction
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      questionText = `${larger} - ${smaller}`;
      correctAnswer = larger - smaller;
    }
    
    setQuestion(questionText);
    setAnswer(correctAnswer.toString());
    setUserAnswer('');
    setIsVerified(false);
  };

  useEffect(() => {
    setIsClient(true);
    generateQuestion();
  }, []);

  const handleAnswerChange = (e) => {
    const value = e.target.value;
    setUserAnswer(value);
    
    if (value === answer) {
      setIsVerified(true);
      onVerify(true);
    } else {
      setIsVerified(false);
      onVerify(false);
    }
  };

  const handleRefresh = () => {
    generateQuestion();
    onVerify(false);
  };

  if (!isClient) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Security Check *
        </label>
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Loading security check...</span>
            </div>
            <input
              type="number"
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 text-sm bg-gray-50"
              placeholder="Please wait..."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Security Check *
      </label>
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">What is {question}?</span>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh question"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <input
            type="number"
            value={userAnswer}
            onChange={handleAnswerChange}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
              error ? 'border-red-300' : isVerified ? 'border-green-300' : 'border-gray-300'
            }`}
            placeholder="Enter your answer"
          />
        </div>
        {isVerified && (
          <div className="text-green-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

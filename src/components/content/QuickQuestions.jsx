import React, { useState, useEffect } from 'react';

const QuickQuestions = ({ setChatVisible, setChatInput, addChatMessage, newsDetails, activeHeadline, theme }) => {
  const [questionSet, setQuestionSet] = useState(0);
  
  // Determine if dark mode
  const isDarkMode = theme && (
    theme === 'dark' || 
    (typeof theme === 'object' && theme.backgroundColor === '#000')
  );
  
  // Rotate questions when the news changes
  useEffect(() => {
    if (newsDetails?.results?.[0]?.id) {
      // Change the question set based on the news ID to provide variety
      const newsId = newsDetails.results[0].id;
      const newsIdSum = newsId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      setQuestionSet(newsIdSum % 3); // 3 different sets of questions
    }
  }, [newsDetails]);
  
  const headline = newsDetails?.results?.[0]?.newsobj?.headline || 
                  newsDetails?.results?.[0]?.headline || 
                  activeHeadline;
  
  const handleQuestionClick = (question) => {
    setChatVisible(true);
    setChatInput(question);
    setTimeout(() => {
      addChatMessage(question, true);
    }, 100);
  };
  
  // Define multiple sets of questions for variety
  const questionSets = [
    [
      {
        text: "How does Wan 2.1's performance compare to Sora or Veo 2?",
      },
      {
        text: "Why did Alibaba opt for open-source with Wan 2.1 now?",
      },
      {
        text: "Who gains most from Wan 2.1 being freely available?",
      }
    ],
    [
      {
        text: "What are the technical limitations of Wan 2.1?",
      },
      {
        text: "How will this affect the AI video generation market?",
      },
      {
        text: "What's Alibaba's strategy behind this release?",
      }
    ],
    [
      {
        text: "How does Wan 2.1 handle copyright concerns?",
      },
      {
        text: "What computing resources does Wan 2.1 require?",
      },
      {
        text: "How does this compare to other Chinese AI models?",
      }
    ]
  ];
  
  // Get the current set of questions based on the questionSet state
  const currentQuestions = questionSets[questionSet];

  return (
    <div className="grid grid-cols-3 gap-2 mb-5">
      {currentQuestions.map((question, index) => (
        <div
          key={index}
          className={`py-4 px-3 ${isDarkMode ? 'bg-black' : 'bg-white'} rounded-xl border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'} cursor-pointer flex items-center justify-center text-center h-full transition-all duration-200 hover:bg-opacity-90`}
          onClick={() => handleQuestionClick(question.text)}
        >
          {question.text}
        </div>
      ))}
    </div>
  );
};

export default QuickQuestions;
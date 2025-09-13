import React from 'react';

const LoadingSpinner: React.FC = () => (
  <svg className="animate-spin h-12 w-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface LoadingScreenProps {
    isGeneratingImage?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isGeneratingImage = false }) => {
    const imageGenMessage = "Forging a new world for your adventure...";
    const storyMessages = [
        "The storyteller ponders your fate...",
        "Weaving the threads of destiny...",
        "Consulting the ancient scrolls...",
        "The cosmos aligns for your next move...",
        "Generating your reality...",
    ];
    const [message, setMessage] = React.useState(
        isGeneratingImage ? imageGenMessage : storyMessages[0]
    );

    React.useEffect(() => {
        if (isGeneratingImage) {
            setMessage(imageGenMessage);
            return; // No interval needed for the static message
        }
        
        // Start cycling through story messages
        setMessage(storyMessages[Math.floor(Math.random() * storyMessages.length)]);
        const intervalId = setInterval(() => {
            setMessage(storyMessages[Math.floor(Math.random() * storyMessages.length)]);
        }, 2000);

        return () => clearInterval(intervalId);
    }, [isGeneratingImage]);


    return (
        <div className="text-center flex flex-col items-center justify-center p-8">
            <LoadingSpinner />
            <p className="text-xl text-gray-300 mt-6 italic">{message}</p>
        </div>
    );
}


export default LoadingScreen;
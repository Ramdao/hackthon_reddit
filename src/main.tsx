import { Devvit, useState } from "@devvit/public-api";

Devvit.configure({
  redditAPI: true, // Enable Reddit API
});

// List of image questions with correct and wrong answers
const questions = [
  {
    image: "https://i.redd.it/1b0t4xk5q5xb1.jpg", // Golden Gate Bridge
    correct: "Golden Gate Bridge",
    wrong: ["Brooklyn Bridge", "London Bridge", "Sydney Harbour Bridge"],
  },
  {
    image: "https://i.redd.it/1b0t4xk5q5xb1.jpg", // Eiffel Tower
    correct: "Eiffel Tower",
    wrong: ["Leaning Tower of Pisa", "Empire State Building", "Big Ben"],
  },
  {
    image: "https://i.redd.it/1b0t4xk5q5xb1.jpg", // Mona Lisa
    correct: "Mona Lisa",
    wrong: ["The Starry Night", "The Scream", "Girl with a Pearl Earring"],
  },
  {
    image: "https://i.redd.it/1b0t4xk5q5xb1.jpg", // Statue of Liberty
    correct: "Statue of Liberty",
    wrong: ["Christ the Redeemer", "The Thinker", "David"],
  },
];

Devvit.addCustomPostType({
  name: "Image Quiz Game",
  height: "tall", // Using tall height to better accommodate images
  render: (context) => {
    const [score, setScore] = useState(0);
    const [questionIndex, setQuestionIndex] = useState<number>(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);

    const postId = context?.postId;
    const reddit = context?.reddit;

    // Function to start the game
    const startGame = () => {
      setScore(0);
      setGameStarted(true);
      setGameEnded(false);
      setQuestionIndex(0);
      loadNewQuestion(0);
    };

    // Load a new question
    const loadNewQuestion = (index: number) => {
      if (index >= questions.length) {
        endGame();
        return;
      }

      const selectedQuestion = questions[index];
      const shuffledAnswers = [...selectedQuestion.wrong, selectedQuestion.correct].sort(() => Math.random() - 0.5);

      setQuestionIndex(index);
      setAnswers(shuffledAnswers);
    };

    // Handle answer selection
    const handleAnswerClick = (selectedAnswer: string) => {
      if (gameEnded) return;

      const correctAnswer = questions[questionIndex].correct;

      if (selectedAnswer === correctAnswer) {
        setScore((prevScore) => prevScore + 1);
      }

      loadNewQuestion(questionIndex + 1);
    };

    // End the game
    const endGame = () => {
      setGameEnded(true);
    };

    // Post the score to the Reddit comments
    const postScoreToComments = async () => {
      if (!postId || !reddit) {
        console.error("Error: Missing postId or Reddit API");
        return;
      }

      const commentText = `I finished the Image Quiz Game with ${score} correct answers out of ${questions.length}! 🎉`;

      try {
        await reddit.submitComment({
          id: postId,
          text: commentText,
        });
        console.log("Score posted successfully!");
      } catch (error) {
        console.error("Error posting score to comments:", error);
      }
    };

    return (
      <vstack height="100%" width="100%" gap="medium" alignment="center middle">
        {!gameStarted ? (
          <>
            <text size="xxlarge" weight="bold">Image Quiz Game</text>
            <text size="medium">Identify what's shown in each image</text>
            <button appearance="primary" onPress={startGame}>
              Start Game
            </button>
          </>
        ) : gameEnded ? (
          <>
            <text size="xxlarge" weight="bold">Game Over! 🎉</text>
            <text size="xlarge">Your Score: {score}/{questions.length}</text>
            <vstack gap="small">
              <button appearance="primary" onPress={postScoreToComments}>
                Post My Score
              </button>
              <button appearance="primary" onPress={startGame}>
                Play Again
              </button>
            </vstack>
          </>
        ) : (
          <>
            <image 
              url={questions[questionIndex].image} 
              imageWidth={300} 
              imageHeight={300} 
              resizeMode="cover" 
              description="Quiz image"
            />
            <text size="medium">What is this?</text>
            <vstack gap="small" width="100%" alignment="center middle">
              {answers.map((answer, index) => (
                <button 
                  key={`${answer}-${index}`} 
                  appearance="primary" 
                  onPress={() => handleAnswerClick(answer)}
                  size="large"
                  width="80%"
                >
                  {answer}
                </button>
              ))}
            </vstack>
          </>
        )}
      </vstack>
    );
  },
});

export default Devvit;
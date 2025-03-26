import { Devvit, useState } from "@devvit/public-api";

Devvit.configure({
  redditAPI: true, // Enable Reddit API
});

// List of random questions with correct and wrong answers
const questions = [
  {
    question: "What is the capital of France?",
    correct: "Paris",
    wrong: ["London", "Berlin", "Madrid"],
  },
  {
    question: "Which planet is known as the Red Planet?",
    correct: "Mars",
    wrong: ["Venus", "Jupiter", "Saturn"],
  },
  {
    question: "Who wrote 'To Kill a Mockingbird'?",
    correct: "Harper Lee",
    wrong: ["Mark Twain", "J.K. Rowling", "Ernest Hemingway"],
  },
  {
    question: "What is 5 + 3?",
    correct: "8",
    wrong: ["6", "9", "12"],
  },
];

Devvit.addCustomPostType({
  name: "Speed Quiz Game",
  height: "regular",
  render: (_context) => {
    const [score, setScore] = useState(0);
    const [questionIndex, setQuestionIndex] = useState<number>(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);

    const postId = _context?.postId;
    const reddit = _context?.reddit;

    console.log("Devvit Context:", _context); // Debugging line

    if (!postId) {
      console.error("Error: postId is undefined. Make sure this is running on a post.");
    }

    if (!reddit) {
      console.error("Error: Reddit API is not available. Check Devvit configuration.");
    }

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
      if (!postId) {
        console.error("Error: postId is undefined.");
        return;
      }

      if (!reddit) {
        console.error("Error: Reddit API is not available.");
        return;
      }

      const commentText = `I finished the Speed Quiz Game with ${score} correct answers! 🎉`;

      try {
        await reddit.submitComment({
          id: postId, // Correct property
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
          <button appearance="primary" onPress={startGame}>
            Start Game
          </button>
        ) : gameEnded ? (
          <>
            <text size="large">Game Over! 🎉</text>
            <text size="medium">Total Correct Answers: {score}</text>
            <button appearance="primary" onPress={postScoreToComments}>
              Post My Score
            </button>
            <button appearance="primary" onPress={startGame}>
              Play Again
            </button>
          </>
        ) : (
          <>
            <text size="large">{questions[questionIndex].question}</text>
            <hstack gap="small" alignment="center">
              {answers.map((answer, index) => (
                <button key={`${answer}-${index}`} appearance="primary" onPress={() => handleAnswerClick(answer)}>
                  {answer}
                </button>
              ))}
            </hstack>
          </>
        )}
      </vstack>
    );
  },
});

export default Devvit;

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

      <h1 className="text-6xl font-bold">mnd.app</h1>

      <p className="mt-6 text-xl text-gray-400 text-center max-w-xl">
        Your AI study partner. Upload your notes and instantly get
        simple explanations, summaries, quizzes, and flashcards.
      </p>

      <div className="mt-10 flex gap-4">
        <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200">
          Start Studying
        </button>

        <button className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-black">
          Learn More
        </button>
      </div>

    </main>
  );
}
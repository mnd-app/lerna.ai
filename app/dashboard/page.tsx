export default function Dashboard() {
  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-gray-900 p-6 rounded-xl">
          <h2 className="text-2xl font-semibold">Upload Notes</h2>
          <p className="text-gray-400 mt-2">
            Upload PDFs or text notes to start studying with AI.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <h2 className="text-2xl font-semibold">Quick Summary ⚡</h2>
          <p className="text-gray-400 mt-2">
            Get the most important concepts for fast exam revision.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <h2 className="text-2xl font-semibold">Deep Explanation 🧠</h2>
          <p className="text-gray-400 mt-2">
            Learn topics with detailed explanations and examples.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl">
          <h2 className="text-2xl font-semibold">Practice Quiz</h2>
          <p className="text-gray-400 mt-2">
            Generate AI quizzes from your notes.
          </p>
        </div>

      </div>

    </main>
  );
}
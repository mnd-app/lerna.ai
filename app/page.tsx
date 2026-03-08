export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="text-5xl font-bold">mnd.app</h1>
      <p className="mt-4 text-xl text-gray-400">
        Your AI-powered study platform
      </p>

      <button className="mt-8 rounded-xl bg-white px-6 py-3 text-black font-semibold hover:bg-gray-200">
        Get Started
      </button>
    </main>
  );
}
export default function SupportPage() {
  return (
    <main className="min-h-[calc(100vh-56px)] px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="ui-panel rounded-3xl p-6 md:p-8">
          <h1 className="text-3xl font-bold">Support</h1>
          <p className="mt-3" style={{ color: "var(--app-muted)" }}>
            Need help using lerna.ai? Reach out and we will help you quickly.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <p>Email: support@lerna.ai</p>
            <p>Response time: usually within 24 hours</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function FarmersDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Debridger Dashboard</h1>
        <form action="/api/logout" method="post">
          <button
            type="submit"
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Logout
          </button>
        </form>
      </header>

      <main className="p-8">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm p-10">
          <p className="text-3xl font-light text-gray-900 mb-2">
            Welcome back 👋
          </p>
          <p className="text-gray-600">
            This is your protected dashboard shell.<br />
            Session validated by middleware on every request.
          </p>
          <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-700">
            ✅ PWA installed on Android Chrome → refresh still works<br />
            ✅ No stale session after install
          </div>
        </div>
      </main>
    </div>
  );
}
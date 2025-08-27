export default function Dashboard() {
    const cards = [
      { label: "Total Forms", value: "24", delta: "+12%" },
      { label: "Active Users", value: "1,284", delta: "+8%" },
      { label: "Data Records", value: "45.2K", delta: "+23%" },
      { label: "Response Rate", value: "94.2%", delta: "+2%" },
    ];
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border p-4 dark:bg-slate-900 dark:border-slate-800">
              <div className="text-sm text-slate-500">{c.label}</div>
              <div className="text-2xl font-semibold mt-1">{c.value}</div>
              <div className="text-xs text-emerald-600 mt-1">{c.delta} from last month</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
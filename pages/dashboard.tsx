import { useState } from "react";
import Papa from "papaparse";
import { Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

const STATUS_ORDER = ["Delay", "To Do", "In Progress", "Done"];
const STATUS_COLOR: Record<string, string> = {
  Delay: "bg-amber-100 border-amber-300",
  "To Do": "bg-gray-100 border-gray-300",
  "In Progress": "bg-blue-100 border-blue-300",
  Done: "bg-green-100 border-green-300",
};

export default function Dashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => setRows(res.data as any[]),
    });
  };

  const filtered = rows.filter((r) => {
    const hay = `${r["Issue key"]} ${r["Summary"]} ${r["Custom field (Owner - AUTOI)"] || ""} ${r["Assignee"] || ""}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  const grouped: Record<string, any[]> = {};
  filtered.forEach((r) => {
    let owner = r["Custom field (Owner - AUTOI)"];
    if (!owner || owner.trim() === "") {
      owner = r["Assignee"] || "Unassigned";
    }
    if (!grouped[owner]) grouped[owner] = [];
    grouped[owner].push(r);
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Active Sprint – Owner Swimlanes</h1>
      <p className="text-gray-600">Grouped by “Custom field (Owner - AUTOI)”, fallback to Assignee.</p>

      <div className="flex gap-4 items-center">
        <label>
          <span className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer">Upload CSV</span>
          <input type="file" accept=".csv" className="hidden" onChange={handleCSV} />
        </label>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by key, summary, owner, or assignee…"
            className="border rounded pl-8 pr-3 py-2 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-gray-500">No data loaded. Upload a Jira CSV to see swimlanes.</p>
      )}

      <div className="space-y-8">
        {Object.entries(grouped).map(([owner, issues]) => (
          <Card key={owner}>
            <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold">{owner}</h2>
              <span className="text-sm text-gray-500">{issues.length} issues</span>
            </div>

            <div className="grid md:grid-cols-4 gap-4 p-4">
              {STATUS_ORDER.map((status) => {
                const filteredIssues = issues.filter((i) => (i["Status"] || "To Do") === status);
                return (
                  <div key={status} className="border rounded bg-gray-50">
                    <div className="px-2 py-1 text-xs font-semibold border-b bg-gray-100">{status}</div>
                    <div className="p-2 space-y-2 max-h-72 overflow-auto">
                      {filteredIssues.length === 0 && (
                        <div className="text-xs text-gray-400 italic">No items</div>
                      )}
                      {filteredIssues.map((issue) => (
                        <div key={issue["Issue key"]} className={`p-2 rounded border ${STATUS_COLOR[status]}`}>
                          <div className="font-semibold text-sm">{issue["Issue key"]}</div>
                          <div className="text-xs text-gray-700">{issue["Summary"]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

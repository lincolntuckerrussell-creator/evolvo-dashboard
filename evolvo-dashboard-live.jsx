import { useState, useEffect } from "react";

const SUPABASE_URL = "https://pqhdedderhyhyitivsce.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxaGRlZGRlcmh5aHlpdGl2c2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NTY4MTIsImV4cCI6MjA5MDAzMjgxMn0.0Dql5f-ZT2FCBSwSbdQwvkkCGJJbmkRdQYjh3XemMCc";

async function query(table, params = "") {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${table}`);
  return res.json();
}

const SERVICE_LABELS = {
  social: "📱 Social Media",
  email: "✉️ Email",
  content: "✍️ Content",
  seo: "🔍 SEO",
  ads: "🎯 Paid Ads",
  websitecopy: "📝 Website Copy",
};

const TABLE_HEADERS = {
  social: ["Post", "Platform", "Reach", "Engagement", "Date"],
  seo: ["Keyword", "Position", "Monthly Searches", "Change"],
  email: ["Campaign", "Sent", "Open Rate", "Click Rate", "Date"],
  ads: ["Campaign", "Platform", "Impressions", "CTR", "CPC", "Status"],
  content: ["Article", "Views", "Avg Time", "Published"],
  websitecopy: ["Page", "Status", "Revisions", "Approved"],
};

const TABLE_TITLES = {
  social: "Top Performing Posts",
  seo: "Top Ranking Keywords",
  email: "Campaign Performance",
  ads: "Active Ad Campaigns",
  content: "Published Content This Month",
  websitecopy: "Pages Delivered",
};

function BarChart({ data }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data) || 1;
  const weeks = ["Wk1", "Wk2", "Wk3", "Wk4", "Wk5"].slice(0, data.length);
  const W = 400, H = 140, pad = 30, bw = 32;
  const step = (W - pad * 2) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 140 }}>
      <line x1={pad} y1={H - 20} x2={W - pad} y2={H - 20} stroke="#c8c2b6" strokeWidth={1} />
      {data.map((v, i) => {
        const bh = Math.max(2, Math.round((v / max) * (H - 40)));
        const x = pad + i * step + (step - bw) / 2;
        const y = H - bh - 20;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx={4} fill="#0f0e0d" />
            <text x={x + bw / 2} y={H - 5} textAnchor="middle" fontSize={10} fill="#7a7670" fontFamily="DM Sans, sans-serif">{weeks[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const weeks = ["Wk1", "Wk2", "Wk3", "Wk4", "Wk5"].slice(0, data.length);
  const W = 240, H = 140, pad = 28;
  const step = (W - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => ({
    x: pad + i * step,
    y: pad + (1 - (v - min) / range) * (H - pad * 2),
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = linePath + ` L${pts[pts.length - 1].x},${H - pad} L${pts[0].x},${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 140 }}>
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#c8c2b6" strokeWidth={1} />
      <path d={areaPath} fill="rgba(15,14,13,0.07)" />
      <path d={linePath} fill="none" stroke="#0f0e0d" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#0f0e0d" />
          <text x={p.x} y={H - 6} textAnchor="middle" fontSize={9} fill="#7a7670" fontFamily="DM Sans, sans-serif">{weeks[i]}</text>
        </g>
      ))}
    </svg>
  );
}

function Badge({ status }) {
  const s = (status || "").toLowerCase();
  const map = {
    delivered: { bg: "#d8f3dc", color: "#2d6a4f", label: "✓ Delivered" },
    progress: { bg: "#fff3cd", color: "#7a5800", label: "In Progress" },
    scheduled: { bg: "#e8e2d6", color: "#52504c", label: "Scheduled" },
    active: { bg: "#e8e2d6", color: "#52504c", label: "Active" },
    complete: { bg: "#d8f3dc", color: "#2d6a4f", label: "✓ Complete" },
  };
  const st = map[s] || map.scheduled;
  return (
    <span style={{ background: st.bg, color: st.color, padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700, display: "inline-block" }}>
      {st.label}
    </span>
  );
}

function MetricCard({ label, value, change, dir, sub }) {
  const colors = {
    up: { bg: "#d8f3dc", color: "#2d6a4f" },
    down: { bg: "#ffe5e5", color: "#c1121f" },
    neutral: { bg: "#fff3cd", color: "#7a5800" },
  };
  const c = colors[dir] || colors.neutral;
  const arrow = dir === "up" ? "↑" : dir === "down" ? "↓" : "—";
  return (
    <div style={{ background: "white", border: "1px solid #c8c2b6", borderRadius: 12, padding: "1rem" }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#52504c", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "Syne, sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <span style={{ background: c.bg, color: c.color, padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600, display: "inline-block" }}>{arrow} {change}</span>
      <div style={{ fontSize: 11, color: "#52504c", marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function buildMetrics(svc, metricsData) {
  if (!metricsData) return [];
  if (svc === "social") return [
    { label: "Total Reach", value: metricsData.total_reach?.toLocaleString() || "—", change: "this month", dir: "up", sub: "total reach" },
    { label: "Engagements", value: metricsData.engagements?.toLocaleString() || "—", change: "likes, comments, shares", dir: "up", sub: "total engagements" },
    { label: "Follower Growth", value: `+${metricsData.follower_growth || 0}`, change: "new followers", dir: "up", sub: "this month" },
    { label: "Top Post Reach", value: metricsData.top_post_reach?.toLocaleString() || "—", change: metricsData.top_post_label || "", dir: "neutral", sub: "best performing post" },
  ];
  if (svc === "seo") return [
    { label: "Organic Sessions", value: metricsData.organic_sessions?.toLocaleString() || "—", change: "from Google", dir: "up", sub: "this month" },
    { label: "Keywords Ranking", value: metricsData.keywords_ranking || "—", change: "in top 10", dir: "up", sub: "positions" },
    { label: "Avg. Position", value: metricsData.avg_position || "—", change: "lower is better", dir: "up", sub: "Google average" },
    { label: "Top Keyword", value: `#${metricsData.top_keyword_position || "—"}`, change: metricsData.top_keyword || "", dir: "neutral", sub: "Google position" },
  ];
  if (svc === "email") return [
    { label: "Emails Sent", value: metricsData.emails_sent?.toLocaleString() || "—", change: `${metricsData.campaigns_count || 0} campaigns`, dir: "neutral", sub: "this month" },
    { label: "Open Rate", value: `${metricsData.open_rate || 0}%`, change: "industry avg: 21%", dir: "up", sub: "above average" },
    { label: "Click Rate", value: `${metricsData.click_rate || 0}%`, change: "industry avg: 2.6%", dir: "up", sub: "above average" },
    { label: "Unsubscribes", value: metricsData.unsubscribes || "0", change: "this month", dir: "up", sub: "very low churn" },
  ];
  if (svc === "ads") return [
    { label: "Impressions", value: metricsData.impressions?.toLocaleString() || "—", change: "this month", dir: "up", sub: "total impressions" },
    { label: "Clicks", value: metricsData.clicks?.toLocaleString() || "—", change: "link clicks", dir: "up", sub: "this month" },
    { label: "Click-Through Rate", value: `${metricsData.ctr || 0}%`, change: "industry avg: 1.2%", dir: "up", sub: "above average" },
    { label: "Cost Per Click", value: `$${metricsData.cpc || 0}`, change: "this month", dir: "neutral", sub: "avg CPC" },
  ];
  if (svc === "content") return [
    { label: "Blog Sessions", value: metricsData.blog_sessions?.toLocaleString() || "—", change: "from content", dir: "up", sub: "this month" },
    { label: "Avg Read Time", value: metricsData.avg_read_time || "—", change: "per article", dir: "up", sub: "engagement" },
    { label: "Articles Published", value: metricsData.articles_published || "—", change: "on schedule", dir: "neutral", sub: "this month" },
    { label: "Top Article Views", value: metricsData.top_article_views?.toLocaleString() || "—", change: metricsData.top_article_title || "", dir: "neutral", sub: "best article" },
  ];
  if (svc === "websitecopy") return [
    { label: "Pages Delivered", value: metricsData.pages_delivered || "—", change: "on schedule", dir: "neutral", sub: "all pages" },
    { label: "Revision Rounds", value: metricsData.revision_rounds || "—", change: "avg is 2-3", dir: "up", sub: "efficient" },
    { label: "Client Rating", value: metricsData.client_rating || "—", change: "client feedback", dir: "up", sub: "satisfaction" },
    { label: "Status", value: metricsData.status || "—", change: "current status", dir: "up", sub: "" },
  ];
  return [];
}

function buildChartData(svc, metricsData) {
  if (!metricsData) return { cd: [], c2d: [], cl: "", c2l: "" };
  if (svc === "social") return {
    cl: "Weekly Reach", cd: [metricsData.week1, metricsData.week2, metricsData.week3, metricsData.week4, metricsData.week5].filter(Boolean),
    c2l: "Engagement", c2d: [metricsData.eng_week1, metricsData.eng_week2, metricsData.eng_week3, metricsData.eng_week4, metricsData.eng_week5].filter(Boolean),
  };
  if (svc === "seo") return {
    cl: "Organic Sessions", cd: [metricsData.week1, metricsData.week2, metricsData.week3, metricsData.week4, metricsData.week5].filter(Boolean),
    c2l: "Keywords in Top 10", c2d: [metricsData.kw_week1, metricsData.kw_week2, metricsData.kw_week3, metricsData.kw_week4, metricsData.kw_week5].filter(Boolean),
  };
  if (svc === "email") return {
    cl: "Open Rate %", cd: [metricsData.week1_open, metricsData.week2_open, metricsData.week3_open, metricsData.week4_open, metricsData.week5_open].filter(Boolean),
    c2l: "Click Rate %", c2d: [metricsData.week1_click, metricsData.week2_click, metricsData.week3_click, metricsData.week4_click, metricsData.week5_click].filter(Boolean),
  };
  if (svc === "ads") return {
    cl: "Weekly Impressions", cd: [metricsData.week1_imp, metricsData.week2_imp, metricsData.week3_imp, metricsData.week4_imp, metricsData.week5_imp].filter(Boolean),
    c2l: "Weekly Clicks", c2d: [metricsData.week1_clicks, metricsData.week2_clicks, metricsData.week3_clicks, metricsData.week4_clicks, metricsData.week5_clicks].filter(Boolean),
  };
  if (svc === "content") return {
    cl: "Monthly Blog Sessions", cd: [metricsData.week1, metricsData.week2, metricsData.week3, metricsData.week4, metricsData.week5].filter(Boolean),
    c2l: "Avg Read Time (min)", c2d: [metricsData.time_week1, metricsData.time_week2, metricsData.time_week3, metricsData.time_week4, metricsData.time_week5].filter(Boolean),
  };
  return { cd: [], c2d: [], cl: "", c2l: "" };
}

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(null);
  const [svcId, setSvcId] = useState("social");
  const [period, setPeriod] = useState("30");
  const [metricsData, setMetricsData] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [perfRows, setPerfRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [svcLoading, setSvcLoading] = useState(false);

  // Load clients on mount
  useEffect(() => {
    query("clients", "?select=*&order=name")
      .then(data => {
        setClients(data);
        if (data.length > 0) {
          setClientId(data[0].id);
          setSvcId(data[0].services[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load service data when client or service changes
  useEffect(() => {
    if (!clientId || !svcId) return;
    setSvcLoading(true);

    const metricTable = `metrics_${svcId}`;
    const periodFilter = `?client_id=eq.${clientId}&order=period_start.desc&limit=1`;
    const delFilter = `?client_id=eq.${clientId}&service=eq.${svcId}&order=created_at`;
    const taskFilter = `?client_id=eq.${clientId}&service=eq.${svcId}&order=created_at`;
    const perfFilter = `?client_id=eq.${clientId}&service=eq.${svcId}&order=sort_order`;

    Promise.all([
      svcId !== "websitecopy" ? query(metricTable, periodFilter).catch(() => []) : query("metrics_websitecopy", periodFilter).catch(() => []),
      query("deliverables", delFilter).catch(() => []),
      query("upcoming_tasks", taskFilter).catch(() => []),
      query("performance_rows", perfFilter).catch(() => []),
    ]).then(([metrics, dels, tks, perf]) => {
      setMetricsData(metrics[0] || null);
      setDeliverables(dels);
      setTasks(tks);
      setPerfRows(perf);
      setSvcLoading(false);
    });
  }, [clientId, svcId]);

  function selectClient(id, services) {
    setClientId(id);
    setSvcId(services[0]);
  }

  const client = clients.find(c => c.id === clientId);
  const metrics = buildMetrics(svcId, metricsData);
  const { cd, c2d, cl, c2l } = buildChartData(svcId, metricsData);
  const allServices = ["social", "email", "content", "seo", "ads", "websitecopy"];

  const tableRows = perfRows.map(r => [r.col1, r.col2, r.col3, r.col4, r.col5, r.col6].filter(Boolean));

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0ebe0", fontFamily: "DM Sans, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>EVOLVO.</div>
        <div style={{ color: "#52504c", fontSize: 14 }}>Loading dashboard...</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "DM Sans, sans-serif", background: "#f0ebe0", color: "#0f0e0d", fontSize: 14 }}>

      {/* SIDEBAR */}
      <aside style={{ width: 220, background: "#0f0e0d", display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 18, color: "#f0ebe0", letterSpacing: "-0.02em" }}>EVOLVO.</div>
          <div style={{ fontSize: 9, letterSpacing: "0.14em", color: "rgba(240,235,224,0.35)", textTransform: "uppercase", marginTop: 2 }}>DIGITAL</div>
        </div>
        <div style={{ padding: "1rem 0.75rem 0.5rem" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(240,235,224,0.3)", marginBottom: 8, padding: "0 0.25rem" }}>Clients</div>
          {clients.map(cl => (
            <div key={cl.id} onClick={() => selectClient(cl.id, cl.services)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.55rem 0.65rem", borderRadius: 8, cursor: "pointer", marginBottom: 2, background: clientId === cl.id ? "rgba(255,255,255,0.13)" : "transparent" }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: "rgba(240,235,224,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "rgba(240,235,224,0.75)", flexShrink: 0, fontFamily: "Syne, sans-serif" }}>{cl.initials}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(240,235,224,0.82)" }}>{cl.name}</div>
                <div style={{ fontSize: 10, color: "rgba(240,235,224,0.32)", marginTop: 1 }}>{cl.services.join(" · ")}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto", padding: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {["⚙ Settings", "📄 All Reports"].map(l => (
            <div key={l} style={{ padding: "0.45rem 0.65rem", borderRadius: 8, fontSize: 12, color: "rgba(240,235,224,0.42)", cursor: "pointer" }}>{l}</div>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* TOPBAR */}
        <div style={{ background: "rgba(240,235,224,0.97)", borderBottom: "1px solid #c8c2b6", padding: "0.75rem 1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>{client?.name || "Loading..."}</div>
            <div style={{ fontSize: 11, color: "#52504c", marginTop: 2 }}>Live data from Supabase · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select value={period} onChange={e => setPeriod(e.target.value)}
              style={{ background: "#e8e2d6", border: "1px solid #c8c2b6", borderRadius: 7, padding: "0.35rem 0.65rem", fontFamily: "DM Sans, sans-serif", fontSize: 12, color: "#0f0e0d", cursor: "pointer", outline: "none" }}>
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button style={{ background: "#0f0e0d", color: "#f0ebe0", border: "none", padding: "0.4rem 0.85rem", borderRadius: 7, fontFamily: "Syne, sans-serif", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>↓ Export Report</button>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ padding: "1.5rem 1.75rem", flex: 1 }}>

          {/* SERVICE TABS */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {allServices.map(s => {
              const on = client?.services?.includes(s);
              const sel = s === svcId && on;
              return (
                <button key={s} onClick={() => on && setSvcId(s)}
                  style={{ padding: "0.35rem 0.8rem", borderRadius: 100, fontSize: 12, fontWeight: 600, border: `1.5px solid ${sel ? "#0f0e0d" : "#c8c2b6"}`, background: sel ? "#0f0e0d" : "transparent", color: sel ? "#f0ebe0" : on ? "#52504c" : "#c8c2b6", cursor: on ? "pointer" : "not-allowed", opacity: on ? 1 : 0.3, fontFamily: "DM Sans, sans-serif" }}>
                  {SERVICE_LABELS[s]}
                </button>
              );
            })}
          </div>

          {svcLoading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#52504c" }}>Loading data...</div>
          ) : !metricsData ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: 14, border: "2px dashed #c8c2b6" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No data yet for this service</div>
              <div style={{ color: "#52504c", fontSize: 13 }}>Add metrics in your Supabase dashboard to see them here.</div>
            </div>
          ) : (
            <>
              {/* METRICS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                {metrics.map((m, i) => <MetricCard key={i} {...m} />)}
              </div>

              {/* CHARTS */}
              {cd.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "white", border: "1px solid #c8c2b6", borderRadius: 12, padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 700 }}>{cl} — Last {period} Days</div>
                      <div style={{ fontSize: 11, color: "#52504c" }}>Weekly</div>
                    </div>
                    <BarChart data={cd} />
                  </div>
                  <div style={{ background: "white", border: "1px solid #c8c2b6", borderRadius: 12, padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 700 }}>{c2l}</div>
                      <div style={{ fontSize: 11, color: "#52504c" }}>Trend</div>
                    </div>
                    <LineChart data={c2d} />
                  </div>
                </div>
              )}

              {/* TABLE */}
              {tableRows.length > 0 && (
                <div style={{ background: "white", border: "1px solid #c8c2b6", borderRadius: 12, padding: "1rem", marginBottom: 16 }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{TABLE_TITLES[svcId]}</div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>{(TABLE_HEADERS[svcId] || []).map((h, i) => <th key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#52504c", padding: "6px 10px", textAlign: "left", borderBottom: "1px solid #c8c2b6" }}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => <td key={j} style={{ padding: "9px 10px", fontSize: 12, borderBottom: i < tableRows.length - 1 ? "1px solid rgba(200,194,182,0.3)" : "none", color: "#1a1917" }}>{cell}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* BOTTOM ROW */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "white", border: "1px solid #c8c2b6", borderRadius: 12, padding: "1rem" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Deliverables This Month</div>
                  {deliverables.length === 0 ? <div style={{ fontSize: 12, color: "#52504c" }}>No deliverables added yet.</div> :
                    deliverables.map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < deliverables.length - 1 ? "1px solid rgba(200,194,182,0.25)" : "none" }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#1a1917" }}>{d.name}</span>
                        <Badge status={d.status} />
                      </div>
                    ))
                  }
                </div>
                <div style={{ background: "white", border: "1px solid #c8c2b6", borderRadius: 12, padding: "1rem" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Coming Up Next</div>
                  {tasks.length === 0 ? <div style={{ fontSize: 12, color: "#52504c" }}>No upcoming tasks added yet.</div> :
                    tasks.map((t, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < tasks.length - 1 ? "1px solid rgba(200,194,182,0.25)" : "none" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0f0e0d", flexShrink: 0, marginTop: 5 }} />
                        <div>
                          <div style={{ fontSize: 12, color: "#1a1917" }}>{t.task}</div>
                          <div style={{ fontSize: 11, color: "#52504c", marginTop: 2 }}>{t.due_date}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

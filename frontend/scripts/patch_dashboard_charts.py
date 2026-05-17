from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src/components/PastPlanDashboard.tsx"
t = p.read_text(encoding="utf-8")

effect = """  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === `Escape`) onClose();
    };
    window.addEventListener(`keydown`, onKeyDown);
    return () => window.removeEventListener(`keydown`, onKeyDown);
  }, [onClose]);

"""

if "useEffect(() => {" not in t:
    t = t.replace("  return (", effect + "  return (", 1)

outer_old = '    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-sm">'
outer_new = """    <motionlessOverlay />"""
outer_new = """    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/45 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >"""
t = t.replace(outer_old, outer_new, 1)

inner_old = '      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl flex flex-col">'
inner_new = """      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-border bg-card shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-dashboard-title"
      >"""
t = t.replace(inner_old, inner_new, 1)

t = t.replace(
    '<h2 className="text-xl sm:text-2xl font-bold font-serif">',
    '<h2 id="plan-dashboard-title" className="text-xl sm:text-2xl font-bold font-serif">',
    1,
)

t = t.replace('fill="hsl(var(--primary))"', 'fill="#2563eb"')
t = t.replace('fill="hsl(var(--muted))"', 'fill="#e2e8f0"')

pie_old = """                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>"""

pie_new = """                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="46%"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={3}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: `1px solid #e8eef8`,
                        boxShadow: `0 4px 16px rgba(26, 60, 110, 0.08)`,
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>"""
t = t.replace(pie_old, pie_new)

bar_old = """                  <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="done" stackId="a" fill="#2563eb" name="Done" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="remaining" stackId="a" fill="#e2e8f0" name="Remaining" radius={[0, 0, 4, 4]} />
                  </BarChart>"""

bar_new = """                  <BarChart data={barData} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8eef8" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: `#6b7a99` }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: `#6b7a99` }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: `1px solid #e8eef8`,
                        boxShadow: `0 4px 16px rgba(26, 60, 110, 0.08)`,
                      }}
                    />
                    <Bar dataKey="done" stackId="a" fill="#2563eb" name="Done" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="remaining" stackId="a" fill="#e2e8f0" name="Remaining" radius={[0, 0, 6, 6]} />
                  </BarChart>"""
t = t.replace(bar_old, bar_new)

pie_wrap_old = """              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">"""
pie_wrap_new = """              <div className="relative h-56">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{overall.percent}%</div>
                    <motionlessOverlay />"""
pie_wrap_new = pie_wrap_new.replace("<motionlessOverlay />", '<div className="text-[10px] uppercase tracking-wide text-muted-foreground">complete</div>\n                  </div>\n                </div>\n                <ResponsiveContainer width="100%" height="100%">')
t = t.replace(pie_wrap_old, pie_wrap_new, 1)

p.write_text(t, encoding="utf-8")
print("patched ok")

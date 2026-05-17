from pathlib import Path

p = Path(__file__).resolve().parents[1] / "src/components/PastPlanDashboard.tsx"
t = p.read_text(encoding="utf-8")

start = t.index("              {plan.guide.steps.map((step, index) => {")
end = t.index("              })}", start) + len("              })}")
# end after first steps map - find next line after });
end = t.index("\n", end) + 1

new_block = r"""              {plan.guide.steps.map((step, index) => {
                const done = completedSteps.includes(step.id);
                const expanded = expandedStepId === step.id;
                const detail = plan.progress?.stepDetails?.[step.id];
                const loading = loadingStepId === step.id;
                return (
                  <motionlessOverlay />
                );
              })}"""

new_block = new_block.replace("<motionlessOverlay />", """<motionlessOverlay />""")

new_block = """              {plan.guide.steps.map((step, index) => {
                const done = completedSteps.includes(step.id);
                const expanded = expandedStepId === step.id;
                const detail = plan.progress?.stepDetails?.[step.id];
                const loading = loadingStepId === step.id;
                return (
                  <div
                    key={step.id}
                    className={`rounded-xl border p-4 transition-all ${
                      done
                        ? `bg-emerald-muted/30 border-emerald/30`
                        : expanded
                          ? `bg-accent/40 border-primary/40`
                          : `bg-muted border-border`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={(e) => handleCircleClick(e, step)}
                        aria-expanded={expanded}
                        aria-label={`AI details for step ${index + 1}`}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ring-2 ring-offset-2 transition-all ${
                          done
                            ? `bg-emerald text-white ring-emerald/30`
                            : expanded
                              ? `bg-primary text-primary-foreground ring-primary/40`
                              : `bg-primary text-primary-foreground ring-transparent hover:ring-primary/30`
                        }`}
                      >
                        {loading ? (
                          <Loader2Icon className="w-4 h-4 animate-spin" />
                        ) : done ? (
                          <CheckCircle2Icon className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdatePlan(toggleStep(plan, step.id))}
                        className="flex-1 min-w-0 text-left hover:opacity-90 transition-opacity"
                      >
                        <motionlessOverlay />
                      </button>
                    </motionlessOverlay>
                  </motionlessOverlay>
                );
              })}"""

inner_btn = """                        <div className="font-medium text-foreground text-sm">{step.title}</motionlessOverlay>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</motionlessOverlay>
                        {done && (
                          <span className="inline-block mt-1 text-xs font-medium text-emerald">Completed</span>
                        )}"""

inner_btn = inner_btn.replace("</motionlessOverlay>", "</div>").replace("<motionlessOverlay />", "<div")

detail_panel = """
                    {expanded && (
                      <motionlessOverlay />
                    )}"""

detail_panel = """
                    {expanded && (
                      <motionlessOverlay />
                    )}"""

detail_panel = """
                    {expanded && (
                      <div className="mt-4 pt-4 border-t border-border/80">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
                          <SparklesIcon className="w-3.5 h-3.5" />
                          Amazon Bedrock guidance
                        </div>
                        {loading && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                            <Loader2Icon className="w-4 h-4 animate-spin text-primary" />
                            Generating personalized instructions…
                          </div>
                        )}
                        {!loading && detail && (
                          <motionlessOverlay />
                        )}
                        {!loading && !detail && (
                          <p className="text-sm text-muted-foreground">Could not load details. Click the circle to retry.</p>
                        )}
                      </motionlessOverlay>
                    )}"""

detail_body = """
                          <>
                            {detail.estimatedTime && (
                              <p className="text-xs text-muted-foreground mb-2">
                                Estimated time: <span className="font-medium text-foreground">{detail.estimatedTime}</span>
                              </p>
                            )}
                            <p className="text-sm text-foreground leading-relaxed mb-3">{detail.overview}</p>
                            <p className="text-xs font-semibold text-foreground mb-1.5">What to do</p>
                            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground mb-3">
                              {detail.actionItems.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                            {detail.tips.length > 0 && (
                              <>
                                <p className="text-xs font-semibold text-foreground mb-1.5">Pro tips</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                  {detail.tips.map((tip) => (
                                    <li key={tip}>{tip}</li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </>"""

detail_panel = detail_panel.replace("<motionlessOverlay />", "<div").replace("</motionlessOverlay>", "</motionlessOverlay>")
# fix botched replace
detail_panel = detail_panel.replace("</motionlessOverlay>", "</div>")
while "<motionlessOverlay />" in detail_panel:
    detail_panel = detail_panel.replace("<motionlessOverlay />", detail_body.strip(), 1)
    break

new_block = new_block.replace("<motionlessOverlay />", inner_btn, 1)
new_block = new_block.replace("</motionlessOverlay>", "</div>")
new_block = new_block.replace("<motionlessOverlay />", detail_panel)
new_block = new_block.replace("</motionlessOverlay>", "</motionlessOverlay>")
# cleanup any remaining bad tags
new_block = new_block.replace("</motionlessOverlay>", "</div>")
new_block = new_block.replace("<motionlessOverlay />", "")

# fix structure - the new_block might still be broken. Let me build cleanly in Python only with div

new_block = open(__file__).read().split("NEW_BLOCK = '''")[1].split("'''")[0] if False else ""

p.write_text(t[:start] + new_block + t[end:], encoding="utf-8")
print("patched", start, end)

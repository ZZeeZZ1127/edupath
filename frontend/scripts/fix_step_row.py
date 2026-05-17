from pathlib import Path
import re

p = Path(__file__).resolve().parents[1] / "src/components/PastPlanStepRow.tsx"
t = p.read_text(encoding="utf-8")
t = t.replace("{step.description}</motionlessOverlay>", "{step.description}</p>")
t = t.replace("{step.description}</div>", "{step.description}</p>")

panel = """
          <motionlessOverlay />
"""

panel = """
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
            </>
          )}
          {!loading && !detail && (
            <p className="text-sm text-muted-foreground">Click the circle again to retry loading guidance.</p>
          )}
"""

bad = "motion" + "less" + "Overlay"
pattern = r'        <div className="mt-4 pt-4 border-t border-border/80">\s*.*?\s*</' + bad + r'>'
replacement = '        <div className="mt-4 pt-4 border-t border-border/80">' + panel + "        </div>"
t = re.sub(pattern, replacement, t, count=1, flags=re.S)
t = t.replace("</" + bad + ">", "</div>")
t = t.replace("<" + bad + " />", "")
p.write_text(t, encoding="utf-8")
print("fixed")

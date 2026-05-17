$path = Join-Path $PSScriptRoot "..\src\components\PastPlanDashboard.tsx"
$c = [IO.File]::ReadAllText($path)
$bad = -join @("motion", "less", "Overlay")

$inner = @"
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
                Plan dashboard
              </p>
              <h2 className="text-xl sm:text-2xl font-bold font-serif">{plan.track.title}</h2>
              <p className="text-sm text-white/75 mt-1 line-clamp-2">{plan.guide.overview}</p>
              <p className="text-xs text-white/50 mt-2">
                Estimated: {plan.guide.estimatedDuration}
              </p>
            </motionlessOverlay>
"@

$inner = $inner.Replace("</motionlessOverlay>", "</div>")

$c = $c.Replace("<$bad />", $inner)
$c = $c.Replace("</$bad>", "</div>")

$body = @"
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-muted border border-border text-center">
              <div className="text-3xl font-bold text-primary">{overall.percent}%</div>
              <div className="text-xs text-muted-foreground mt-1">Overall progress</div>
            </div>
            <div className="p-4 rounded-2xl bg-muted border border-border text-center">
              <div className="text-2xl font-bold text-foreground">{steps.completed}/{steps.total}</div>
              <motionlessOverlay />
            </div>
            <div className="p-4 rounded-2xl bg-muted border border-border text-center">
              <div className="text-2xl font-bold text-foreground">{milestones.completed}/{milestones.total}</div>
              <div className="text-xs text-muted-foreground mt-1">Milestones</div>
            </div>
          </div>
        </div>
"@

$body = $body.Replace("<motionlessOverlay />", '<motionlessOverlay />')
$body = $body.Replace("<motionlessOverlay />", '<div className="text-xs text-muted-foreground mt-1">Steps complete</motionlessOverlay>')
$body = $body.Replace("</motionlessOverlay>", "</div>")

$marker = "        </div>`r`n      </div>`r`n    </div>"
$insert = "        </motionlessOverlay>`n$body`n      </motionlessOverlay>"
# normalize line endings
$c = $c -replace "`r`n", "`n"
$marker = "        </div>`n      </motionlessOverlay>`n    </motionlessOverlay>"
$insert = "        </motionlessOverlay>`n$body`n      </motionlessOverlay>"

Write-Host "Use manual write"

import Jakarta1DashboardV2 from "@/components/jakarta1-dashboard-v2";
import Jakarta1DailyFocus from "@/components/jakarta1-daily-focus";
import Jakarta1TargetFocus from "@/components/jakarta1-target-focus";
import Jakarta1WeeklyM238 from "@/components/jakarta1-weekly-m238";
import Jakarta1Soh from "@/components/jakarta1-soh-v2";
import Jakarta1SohUpdateTrigger from "@/components/jakarta1-soh-update-trigger";
import Jakarta1IncentiveAudit from "@/components/jakarta1-incentive-audit";
import Jakarta1YoYDevice from "@/components/jakarta1-yoy-device";
import Jakarta1YoYShortcut from "@/components/jakarta1-yoy-shortcut";

export default function Home(){
  return <><Jakarta1DashboardV2/><Jakarta1DailyFocus/><Jakarta1TargetFocus/><Jakarta1WeeklyM238/><Jakarta1Soh/><Jakarta1SohUpdateTrigger/><Jakarta1IncentiveAudit/><Jakarta1YoYDevice/><Jakarta1YoYShortcut/><script src="/jakarta1-enhancer.js" defer /></>;
}

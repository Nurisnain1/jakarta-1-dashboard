import Jakarta1DashboardV2 from "@/components/jakarta1-dashboard-v2";
import Jakarta1DailyFocus from "@/components/jakarta1-daily-focus";
import Jakarta1TargetFocus from "@/components/jakarta1-target-focus";
import Jakarta1WeeklyM238 from "@/components/jakarta1-weekly-m238";
import Jakarta1Soh from "@/components/jakarta1-soh-v2";
import Jakarta1SohUpdateTrigger from "@/components/jakarta1-soh-update-trigger";
import Jakarta1IncentiveAudit from "@/components/jakarta1-incentive-audit";
import Jakarta1YoYDevice from "@/components/jakarta1-yoy-device";
import Jakarta1YoYShortcut from "@/components/jakarta1-yoy-shortcut";
import Jakarta1LobDevicePerformance from "@/components/jakarta1-lob-device-performance";

export default function Home(){
  return <><Jakarta1DashboardV2/><Jakarta1LobDevicePerformance/><Jakarta1DailyFocus/><Jakarta1TargetFocus/><Jakarta1WeeklyM238/><Jakarta1Soh/><Jakarta1SohUpdateTrigger/><Jakarta1IncentiveAudit/><Jakarta1YoYDevice/><Jakarta1YoYShortcut/><script src="/jakarta1-enhancer.js?v=20260917-1" defer /><script src="/jakarta1-area-fix.js?v=20260917-0345" defer /><script src="/jakarta1-ytd-fix.js?v=20260917-1" defer /><script src="/jakarta1-responsive.js" defer /></>;
}

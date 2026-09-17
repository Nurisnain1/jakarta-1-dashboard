import Jakarta1DashboardV2 from "@/components/jakarta1-dashboard-v2";
import Jakarta1DailyFocus from "@/components/jakarta1-daily-focus";
import Jakarta1TargetFocus from "@/components/jakarta1-target-focus";
import Jakarta1WeeklyM238 from "@/components/jakarta1-weekly-m238";
import Jakarta1Soh from "@/components/jakarta1-soh-v2";
import Jakarta1SohUpdateTrigger from "@/components/jakarta1-soh-update-trigger";
import Jakarta1IncentiveAudit from "@/components/jakarta1-incentive-audit";
import Jakarta1LobDevicePerformance from "@/components/jakarta1-lob-device-performance";
import Jakarta1YoYStoreFilter from "@/components/jakarta1-yoy-store-filter";
import Jakarta1PromoSource from "@/components/jakarta1-promo-source";

export default function Home(){
  return <><Jakarta1DashboardV2/><Jakarta1LobDevicePerformance/><Jakarta1YoYStoreFilter/><Jakarta1DailyFocus/><Jakarta1TargetFocus/><Jakarta1WeeklyM238/><Jakarta1Soh/><Jakarta1SohUpdateTrigger/><Jakarta1IncentiveAudit/><Jakarta1PromoSource/><script src="/jakarta1-enhancer.js?v=20260917-1" defer /><script src="/jakarta1-staff-performance-fix.js?v=20260917-2" defer /><script src="/jakarta1-target-secondary.js?v=20260917-1" defer /><script src="/jakarta1-area-fix.js?v=20260917-0345" defer /><script src="/jakarta1-ytd-fix.js?v=20260917-1" defer /><script src="/jakarta1-responsive.js" defer /></>;
}

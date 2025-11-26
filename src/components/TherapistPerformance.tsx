import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, TrendingUp } from "lucide-react";

interface TherapistPerformanceProps {
  averageResponseTime?: number;
  completionRate?: number;
  reviewCount?: number;
  onlineStatus?: boolean;
  className?: string;
}

export default function TherapistPerformance({
  averageResponseTime = 0,
  completionRate = 0,
  reviewCount = 0,
  onlineStatus = false,
  className = "",
}: TherapistPerformanceProps) {
  const getResponseTimeLabel = (hours: number) => {
    if (hours === 0) return "New";
    if (hours < 1) return "< 1h";
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 75) return "text-blue-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Online Status */}
      {onlineStatus && (
        <Badge variant="outline" className="border-green-500 text-green-600">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse" />
          Online
        </Badge>
      )}

      {/* Response Time */}
      {averageResponseTime >= 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="text-xs">
            {getResponseTimeLabel(averageResponseTime)} reply
          </span>
        </Badge>
      )}

      {/* Completion Rate */}
      {completionRate > 0 && (
        <Badge
          variant="outline"
          className={`flex items-center gap-1 ${getCompletionRateColor(
            completionRate
          )}`}
        >
          <CheckCircle className="h-3 w-3" />
          <span className="text-xs">
            {Math.round(completionRate)}% complete
          </span>
        </Badge>
      )}

      {/* Review Count */}
      {reviewCount > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span className="text-xs">{reviewCount} reviews</span>
        </Badge>
      )}
    </div>
  );
}

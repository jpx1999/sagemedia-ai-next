import React from "react";
import {
  Users,
  Eye,
  Search,
  TrendingUp,
  X,
  Activity,
  CreditCard,
  UserCheck,
  Zap,
} from "lucide-react";

const DashboardStats = ({
  dashboardData,
  activeFilter,
  onStatClick,
  onClearFilter,
}) => {
  // Calculate totals and metrics from the new data structure
  const totalSignups = dashboardData?.summary?.totalUsers || 0;
  const activeUsers = dashboardData?.summary?.activeUsers || 0;
  const totalSearchesToday = dashboardData?.summary?.searchesToday || 0;
  const totalSearchesOverall = dashboardData?.summary?.totalSearches || 0;
  const totalSearches7Days = dashboardData?.summary?.searches7Days || 0;

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color,
    gradient,
    onClick,
    isActive,
    clickable = false,
  }) => (
    <div
      className={`bg-gradient-to-br ${gradient} p-6 rounded-xl border border-gray-700/50 backdrop-blur transition-all duration-200 ${
        clickable ? "cursor-pointer hover:scale-105 hover:shadow-lg" : ""
      } ${
        isActive
          ? `ring-2 ring-${color}-500/50 shadow-lg shadow-${color}-500/25`
          : ""
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 bg-${color}-500/20 rounded-xl flex items-center justify-center ${
              isActive ? `bg-${color}-500/30` : ""
            }`}
          >
            <Icon className={`w-6 h-6 text-${color}-400`} />
          </div>
          <div>
            <p className="text-gray-300 text-sm font-medium">{title}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
            )}
            {clickable && (
              <p className="text-gray-500 text-xs mt-1">Click to filter</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const PlanCard = ({ plan, count, color, isActive, onClick }) => (
    <div
      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
        isActive
          ? `bg-${color}-500/20 border-${color}-500/50 shadow-lg shadow-${color}-500/25`
          : "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 hover:border-gray-600/50"
      }`}
      onClick={onClick}
    >
      <div className="text-center">
        <div
          className={`w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center ${
            isActive ? `bg-${color}-500/30` : "bg-gray-700"
          }`}
        >
          {plan === "ent" && (
            <CreditCard
              className={`w-5 h-5 ${
                isActive ? `text-${color}-400` : "text-gray-400"
              }`}
            />
          )}
          {plan === "pro" && (
            <Zap
              className={`w-5 h-5 ${
                isActive ? `text-${color}-400` : "text-gray-400"
              }`}
            />
          )}
          {plan === "free" && (
            <UserCheck
              className={`w-5 h-5 ${
                isActive ? `text-${color}-400` : "text-gray-400"
              }`}
            />
          )}
        </div>
        <p
          className={`text-xs font-medium mb-1 uppercase tracking-wide ${
            isActive ? `text-${color}-400` : "text-gray-400"
          }`}
        >
          {plan === "ent"
            ? "Enterprise"
            : plan === "pro"
            ? "Professional"
            : "Free"}
        </p>
        <p
          className={`text-xl font-bold ${
            isActive ? "text-white" : "text-gray-300"
          }`}
        >
          {count || 0}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 mb-5">
      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={totalSignups?.toLocaleString() || "0"}
          color="blue"
          gradient="from-gray-800/80 to-gray-900/80"
          clickable={true}
          isActive={
            activeFilter?.type === "stat" &&
            activeFilter?.value === "totalUsers"
          }
          onClick={() => onStatClick("stat", "totalUsers")}
        />
        <StatCard
          icon={Eye}
          title="Active Users"
          value={activeUsers?.toLocaleString() || "0"}
          subtitle={`${
            totalSignups > 0
              ? Math.round((activeUsers / totalSignups) * 100)
              : 0
          }% of total`}
          color="green"
          gradient="from-gray-800/80 to-gray-900/80"
          clickable={true}
          isActive={
            activeFilter?.type === "stat" &&
            activeFilter?.value === "activeUsers"
          }
          onClick={() => onStatClick("stat", "activeUsers")}
        />
        <StatCard
          icon={Search}
          title="Searches Today"
          value={totalSearchesToday?.toLocaleString() || "0"}
          color="purple"
          gradient="from-gray-800/80 to-gray-900/80"
          clickable={true}
          isActive={
            activeFilter?.type === "stat" &&
            activeFilter?.value === "searchesToday"
          }
          onClick={() => onStatClick("stat", "searchesToday")}
        />
        <StatCard
          icon={TrendingUp}
          title="7-Day Searches"
          value={totalSearches7Days?.toLocaleString() || "0"}
          color="orange"
          gradient="from-gray-800/80 to-gray-900/80"
          clickable={true}
          isActive={
            activeFilter?.type === "stat" &&
            activeFilter?.value === "searches7Days"
          }
          onClick={() => onStatClick("stat", "searches7Days")}
        />
        <StatCard
          icon={Activity}
          title="Total Searches"
          value={totalSearchesOverall?.toLocaleString() || "0"}
          color="indigo"
          gradient="from-gray-800/80 to-gray-900/80"
          clickable={true}
          isActive={
            activeFilter?.type === "stat" &&
            activeFilter?.value === "totalSearches"
          }
          onClick={() => onStatClick("stat", "totalSearches")}
        />
      </div>

      {/* Plan Distribution & Metrics */}
      <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl p-6 hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Plan Distribution
            </h3>
            <p className="text-gray-400 text-sm">
              Click on a plan to filter users
            </p>
          </div>
          {activeFilter && (
            <button
              onClick={onClearFilter}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Plan Cards */}
          <PlanCard
            plan="ent"
            count={dashboardData?.plans?.ent}
            color="purple"
            isActive={
              activeFilter?.type === "plan" && activeFilter?.value === "ent"
            }
            onClick={() => onStatClick("plan", "ent")}
          />
          <PlanCard
            plan="pro"
            count={dashboardData?.plans?.pro}
            color="blue"
            isActive={
              activeFilter?.type === "plan" && activeFilter?.value === "pro"
            }
            onClick={() => onStatClick("plan", "pro")}
          />
          <PlanCard
            plan="free"
            count={dashboardData?.plans?.free}
            color="green"
            isActive={
              activeFilter?.type === "plan" && activeFilter?.value === "free"
            }
            onClick={() => onStatClick("plan", "free")}
          />

          {/* Average Usage Card */}
          <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-xs font-medium mb-1 uppercase tracking-wide text-orange-400">
                Average Usage
              </p>
              <p className="text-xl font-bold text-gray-300">
                {totalSignups > 0 && totalSearchesOverall > 0
                  ? Math.round(totalSearchesOverall / totalSignups)
                  : 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">searches per user</p>
            </div>
          </div>
        </div>

        {/* Active Filter Display */}
        {activeFilter && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-blue-400 font-medium text-sm">
                  Active Filter
                </p>
                <p className="text-gray-300 text-sm">
                  {activeFilter.type === "plan"
                    ? `Showing ${
                        activeFilter.value.charAt(0).toUpperCase() +
                        activeFilter.value.slice(1)
                      } plan users`
                    : activeFilter.type === "stat"
                    ? `Showing users filtered by ${activeFilter.value
                        .replace(/([A-Z])/g, " $1")
                        .toLowerCase()}`
                    : activeFilter.type === "source"
                    ? `Showing users from ${
                        activeFilter.value.charAt(0).toUpperCase() +
                        activeFilter.value.slice(1)
                      }`
                    : "Showing filtered users"}
                  {" • "}
                  <span className="text-blue-400 font-medium">
                    {dashboardData?.users?.length || 0} results found
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardStats;

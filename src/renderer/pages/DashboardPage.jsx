import {
  Users,
  UserCog,
  FolderKanban,
  CircleCheck,
  Clock,
  TriangleAlert,
  Boxes,
  SquarePlay,
  OctagonAlert,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  TrendingUp,
  DollarSign,
  ClipboardCheck,
  Layers,
  GraduationCap,
  UserPlus,
  BookOpen,
  FileText,
  Receipt,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function DashboardPage({ user }) {
  const today = new Date();

  const dateText = today.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const stats = [
    {
      label: 'Total Clients',
      value: '0',
      icon: Users,
      iconColor: 'text-[#0a2552]',
      iconBackground: 'bg-[#0a2552]/10',
      clickable: true,
    },
    {
      label: 'Team Members',
      value: '0',
      icon: UserCog,
      iconColor: 'text-[#d4a017]',
      iconBackground: 'bg-[#d4a017]/10',
      clickable: true,
    },
    {
      label: 'Active Projects',
      value: '0',
      icon: FolderKanban,
      iconColor: 'text-teal-700',
      iconBackground: 'bg-teal-700/10',
      clickable: true,
    },
    {
      label: 'Completed Projects',
      value: '0',
      icon: CircleCheck,
      iconColor: 'text-green-600',
      iconBackground: 'bg-green-600/10',
      clickable: false,
    },
    {
      label: 'Pending Projects',
      value: '0',
      icon: Clock,
      iconColor: 'text-[#d4a017]',
      iconBackground: 'bg-[#d4a017]/10',
      clickable: false,
    },
    {
      label: 'Delayed Projects',
      value: '0',
      icon: TriangleAlert,
      iconColor: 'text-red-600',
      iconBackground: 'bg-red-600/10',
      clickable: false,
    },
    {
      label: 'Demo Software',
      value: '0',
      icon: Boxes,
      iconColor: 'text-purple-600',
      iconBackground: 'bg-purple-600/10',
      clickable: true,
    },
    {
      label: 'Active Trials',
      value: '0',
      icon: SquarePlay,
      iconColor: 'text-cyan-600',
      iconBackground: 'bg-cyan-600/10',
      clickable: true,
    },
    {
      label: 'Trials Ending Today',
      value: '0',
      icon: OctagonAlert,
      iconColor: 'text-red-600',
      iconBackground: 'bg-red-600/10',
      clickable: false,
    },
     {
      label: 'Students',
      value: '0',
      icon: GraduationCap,
  iconColor: 'text-indigo-600',
  iconBackground: 'bg-indigo-600/10',
      clickable: false,
    },
        {
      label: 'Pending Fees',
      value: '0',
      icon: Clock,
      iconColor: 'text-[#d4a017]',
      iconBackground: 'bg-[#d4a017]/10',
      clickable: false,
    },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 0, expenses: 0 },
    { month: 'Feb', revenue: 0, expenses: 0 },
    { month: 'Mar', revenue: 0, expenses: 0 },
    { month: 'Apr', revenue: 0, expenses: 0 },
    { month: 'May', revenue: 0, expenses: 0 },
    { month: 'Jun', revenue: 0, expenses: 0 },
    { month: 'Jul', revenue: 0, expenses: 0 },
    { month: 'Aug', revenue: 0, expenses: 0 },
    { month: 'Sep', revenue: 0, expenses: 0 },
    { month: 'Oct', revenue: 0, expenses: 0 },
    { month: 'Nov', revenue: 0, expenses: 0 },
    { month: 'Dec', revenue: 0, expenses: 0 },
  ];

  const projectStatusData = [
    {
      name: 'Completed',
      value: 0,
      color: '#16a34a',
    },
    {
      name: 'Active',
      value: 0,
      color: '#0a2552',
    },
    {
      name: 'Pending',
      value: 0,
      color: '#d4a017',
    },
    {
      name: 'Delayed',
      value: 0,
      color: '#dc2626',
    },
  ];

  const profitData = [
    { month: 'Jan', profit: 0 },
    { month: 'Feb', profit: 0 },
    { month: 'Mar', profit: 0 },
    { month: 'Apr', profit: 0 },
    { month: 'May', profit: 0 },
    { month: 'Jun', profit: 0 },
    { month: 'Jul', profit: 0 },
    { month: 'Aug', profit: 0 },
    { month: 'Sep', profit: 0 },
    { month: 'Oct', profit: 0 },
    { month: 'Nov', profit: 0 },
    { month: 'Dec', profit: 0 },
  ];

  const quickActions = [
    {
      label: 'Add Client',
      icon: Users,
      iconColor: 'text-[#0a2552]',
      iconBackground: 'bg-[#0a2552]/10',
    },
    {
      label: 'Add Team Member',
      icon: UserCog,
      iconColor: 'text-[#d4a017]',
      iconBackground: 'bg-[#d4a017]/10',
    },
    {
      label: 'Add Project',
      icon: FolderKanban,
      iconColor: 'text-teal-700',
      iconBackground: 'bg-teal-700/10',
    },
    {
      label: 'Add Demo Software',
      icon: Boxes,
      iconColor: 'text-purple-600',
      iconBackground: 'bg-purple-600/10',
    },
    {
      label: 'Create Trial',
      icon: SquarePlay,
      iconColor: 'text-cyan-600',
      iconBackground: 'bg-cyan-600/10',
    },
    {
      label: 'Record Payment',
      icon: DollarSign,
      iconColor: 'text-green-600',
      iconBackground: 'bg-green-600/10',
    },
  ];

  return (
    <div className="min-h-full bg-slate-50 px-3 py-5 sm:px-5 sm:py-6 lg:px-6">
      {/* Page Header */}
      <div className="no-print mb-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Dashboard
          </h1>

          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
            Welcome back • {dateText}
          </p>
        </div>
      </div>

      {/* Overview */}
      <section>
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Overview
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <button
                key={stat.label}
                type="button"
                disabled={!stat.clickable}
                className={[
                  'group flex min-h-[96px] w-full min-w-0',
                  'rounded-xl border border-slate-200/80',
                  'bg-white p-4 text-left',
                  'shadow-[0_2px_8px_rgba(15,23,42,0.04)]',
                  'transition-all duration-200',
                  stat.clickable
                    ? [
                        'cursor-pointer',
                        'hover:-translate-y-0.5',
                        'hover:border-slate-300',
                        'hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]',
                        'active:translate-y-0',
                      ].join(' ')
                    : 'cursor-default',
                ].join(' ')}
              >
                <div className="flex w-full min-w-0 items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      {stat.label}
                    </p>

                    <p className="mt-1.5 truncate text-xl font-extrabold leading-none tracking-tight text-slate-900">
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center',
                      'rounded-lg',
                      stat.iconBackground,
                      stat.iconColor,
                      'transition-transform duration-200',
                      stat.clickable ? 'group-hover:scale-105' : '',
                    ].join(' ')}
                  >
                    <Icon size={17} strokeWidth={2} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Financial Overview */}
      <section className="mt-7">
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Financial Overview
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-h-[100px] rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
            <ArrowUpRight size={17} strokeWidth={2} className="mb-2 text-green-600" />
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Received
            </p>
            <p className="mt-1.5 text-lg font-extrabold leading-none text-green-600">
              Rs. 0
            </p>
          </div>

          <div className="min-h-[100px] rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
            <ArrowDownLeft size={17} strokeWidth={2} className="mb-2 text-amber-500" />
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Pending Receivable
            </p>
            <p className="mt-1.5 text-lg font-extrabold leading-none text-amber-500">
              Rs. 0
            </p>
          </div>

          <div className="min-h-[100px] rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
            <Wallet size={17} strokeWidth={2} className="mb-2 text-red-600" />
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              Team Payable
            </p>
            <p className="mt-1.5 text-lg font-extrabold leading-none text-red-600">
              Rs. 0
            </p>
          </div>

          <div className="min-h-[100px] rounded-xl bg-gradient-to-br from-[#0a2552] to-[#1a3d73] p-4 text-white shadow-[0_4px_12px_rgba(10,37,82,0.15)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(10,37,82,0.20)]">
            <TrendingUp size={17} strokeWidth={2} className="mb-2 text-white/90" />
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/75">
              Estimated Profit
            </p>
            <p className="mt-1.5 text-lg font-extrabold leading-none text-white">
              Rs. 0
            </p>
          </div>
        </div>
      </section>

     

      {/* Revenue and Project Status */}
      <section className="mt-7">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* Monthly Revenue vs Expenses */}
          <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Monthly Revenue vs Expenses
            </h3>

            <div className="h-[220px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0a2552" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0a2552" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4a017" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d4a017" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      value === 0 ? '0K' : `${value / 1000}K`
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      fontSize: '11px',
                    }}
                    formatter={(value) => [
                      `Rs. ${Number(value).toLocaleString()}`,
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#0a2552"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    fillOpacity={0.6}
                  />

                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#d4a017"
                    strokeWidth={2}
                    fill="url(#expensesGradient)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-center justify-center gap-5 text-[10px] font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#0a2552]" />
                Revenue
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#d4a017]" />
                Expenses
              </div>
            </div>
          </div>

          {/* Project Status */}
          <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Project Status
            </h3>

            <div className="h-[200px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {projectStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2">
              {projectStatusData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2 text-[10px]"
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />

                    <span className="truncate font-medium text-slate-500">
                      {item.name}
                    </span>
                  </div>

                  <span className="font-bold text-slate-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Profit + Quick Actions */}
      <section className="mt-3">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* Monthly Profit */}
          <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Monthly Profit
            </h3>

            <div className="h-[200px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={profitData}
                  margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      value === 0 ? '0K' : `${value / 1000}K`
                    }
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      fontSize: '11px',
                    }}
                    formatter={(value) => [
                      `Rs. ${Number(value).toLocaleString()}`,
                      'Profit',
                    ]}
                  />

                  <Bar
                    dataKey="profit"
                    name="Profit"
                    fill="#d4a017"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.label}
                    type="button"
                    className="
                      group flex min-h-[78px]
                      flex-col items-center justify-center
                      gap-2 rounded-lg
                      border border-slate-200
                      bg-slate-50/60
                      px-2 py-3
                      text-center
                      transition-all duration-200
                      hover:-translate-y-0.5
                      hover:border-slate-300
                      hover:bg-white
                      hover:shadow-[0_6px_16px_rgba(15,23,42,0.07)]
                      active:translate-y-0
                    "
                  >
                    <div
                      className={[
                        'flex h-9 w-9 items-center justify-center rounded-lg',
                        action.iconBackground,
                        action.iconColor,
                        'transition-transform duration-200',
                        'group-hover:scale-105',
                      ].join(' ')}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </div>

                    <span className="leading-tight text-[10px] font-semibold text-slate-600 group-hover:text-slate-900">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
      </section>
      {/* Attention Required */}
<section className="mt-7">
  <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
    Attention Required
  </h2>

  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <button
      type="button"
      className="group rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
    >
      <TriangleAlert
        size={17}
        strokeWidth={2}
        className="mb-2 text-red-600"
      />
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
        Overdue Tasks
      </p>
      <p className="mt-1.5 text-lg font-extrabold text-slate-900">
        0
      </p>
    </button>

    <button
      type="button"
      className="group rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
    >
      <TriangleAlert
        size={17}
        strokeWidth={2}
        className="mb-2 text-amber-500"
      />
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
        Delayed Projects
      </p>
      <p className="mt-1.5 text-lg font-extrabold text-slate-900">
        0
      </p>
    </button>

    <button
      type="button"
      className="group rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
    >
      <Wallet
        size={17}
        strokeWidth={2}
        className="mb-2 text-amber-500"
      />
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
        Pending Fees
      </p>
      <p className="mt-1.5 text-lg font-extrabold text-slate-900">
        Rs. 0
      </p>
    </button>

    <button
      type="button"
      className="group rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
    >
      <Receipt
        size={17}
        strokeWidth={2}
        className="mb-2 text-red-600"
      />
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
        Overdue Invoices
      </p>
      <p className="mt-1.5 text-lg font-extrabold text-slate-900">
        0
      </p>
    </button>
  </div>
</section>
{/* Recent Activity */}
<section className="mt-7 pb-4">
  <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
    Recent Activity
  </h2>

  <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
    <div className="flex min-h-[140px] items-center justify-center px-4 py-8">
      <div className="text-center">
        <Clock
          size={22}
          strokeWidth={1.8}
          className="mx-auto text-slate-300"
        />

        <p className="mt-3 text-sm font-semibold text-slate-600">
          No recent activity yet
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Business activity will appear here as actions are recorded.
        </p>
      </div>
    </div>
  </div>
</section>
    </div>
  );
}

export default DashboardPage;
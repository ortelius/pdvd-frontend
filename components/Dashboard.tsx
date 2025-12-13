'use client'

import React, { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts'

import { 
  graphqlQuery, 
  GET_DASHBOARD_VULNERABILITY_TREND,
  GET_MTTR_ANALYSIS
} from '@/lib/graphql'
import { 
  GetVulnerabilityTrendResponse, 
  VulnerabilityTrend,
  GetMTTRAnalysisResponse,
  MTTRAnalysis 
} from '@/lib/types'

// --- Icons ---
import ScheduleIcon from '@mui/icons-material/Schedule'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import BugReportIcon from '@mui/icons-material/BugReport'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import RouterIcon from '@mui/icons-material/Router'

// --- Constants ---
const COLORS = {
  CRITICAL: '#dc2626', // Red
  HIGH: '#f97316',     // Orange
  MEDIUM: '#eab308',   // Yellow
  LOW: '#3b82f6',      // Blue
  NONE: '#9ca3af'      // Gray
}

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const [trendData, setTrendData] = useState<VulnerabilityTrend[]>([])
  const [loadingTrend, setLoadingTrend] = useState(true)
  
  const [mttrData, setMttrData] = useState<MTTRAnalysis | null>(null)
  const [loadingMttr, setLoadingMttr] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 1. Fetch MTTR & Core Metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoadingMttr(true)
        const response = await graphqlQuery<GetMTTRAnalysisResponse>(
          GET_MTTR_ANALYSIS, 
          { days: 180 }
        )
        setMttrData(response.dashboardMTTR)
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err)
        setError('Failed to load dashboard metrics')
      } finally {
        setLoadingMttr(false)
      }
    }
    fetchMetrics()
  }, [])

  // 2. Fetch Trend Data
  useEffect(() => {
    const fetchTrend = async () => {
      try {
        setLoadingTrend(true)
        const response = await graphqlQuery<GetVulnerabilityTrendResponse>(
          GET_DASHBOARD_VULNERABILITY_TREND,
          { days: 180 }
        )
        setTrendData(response.dashboardVulnerabilityTrend)
      } catch (err) {
        console.error('Error fetching trend:', err)
      } finally {
        setLoadingTrend(false)
      }
    }
    fetchTrend()
  }, [])

  // Helper for date formatting
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch { return dateStr }
  }

  // --- Components for Sections ---

  const ExecutiveCard = ({ title, value, subValue, icon: Icon, colorClass, tooltip }: any) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={colorClass} />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
      </div>
      {tooltip && (
        <div className="mt-auto pt-3 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
          {tooltip}
        </div>
      )}
    </div>
  )

  if (loadingMttr) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Dashboard Metrics...</p>
        </div>
      </div>
    )
  }

  if (error || !mttrData) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg inline-block">
          <h3 className="font-bold">Error Loading Dashboard</h3>
          <p>{error || 'No data available'}</p>
        </div>
      </div>
    )
  }

  const { executive_summary, by_severity, endpoint_impact } = mttrData

  const volumeChartData = by_severity.map(s => ({
    name: s.severity,
    New: s.new_detected,
    Fixed: s.remediated
  }))

  return (
    <div className="flex h-full relative">
      <div className="flex-1 p-6 bg-gray-50 min-h-screen space-y-8 font-sans overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mission-Critical Vulnerability Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold border border-blue-200">Rolling 180 Days</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-semibold border border-green-200">Endpoint Focused</span>
              
              {/* SLA Criteria Badge with Popover */}
              <div className="relative group">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-semibold border border-purple-200 cursor-help flex items-center gap-1">
                  <span>SLA Policy</span>
                  <span className="w-1 h-1 rounded-full bg-purple-400"></span>
                  <span className="font-normal opacity-80">Crit 15d • High 30d</span>
                </span>
                
                {/* Popover */}
                <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-gray-200 shadow-xl rounded-lg p-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                    <ScheduleIcon fontSize="small" className="text-purple-600" />
                    <h4 className="font-bold text-gray-900 text-sm">SLA Remediation Targets</h4>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-y-2 text-xs">
                    <div className="col-span-1 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Severity</div>
                    <div className="col-span-1 text-right font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Standard</div>
                    <div className="col-span-1 text-right font-semibold text-gray-400 uppercase tracking-wider text-[10px]">High Risk</div>

                    <div className="col-span-1 font-bold text-gray-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span> Critical
                    </div>
                    <div className="col-span-1 text-right text-gray-600">15 days</div>
                    <div className="col-span-1 text-right font-bold text-red-600">7 days</div>

                    <div className="col-span-1 font-bold text-gray-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span> High
                    </div>
                    <div className="col-span-1 text-right text-gray-600">30 days</div>
                    <div className="col-span-1 text-right font-bold text-orange-600">15 days</div>

                    <div className="col-span-1 font-medium text-gray-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Medium
                    </div>
                    <div className="col-span-1 text-right text-gray-600">90 days</div>
                    <div className="col-span-1 text-right text-gray-600">90 days</div>

                    <div className="col-span-1 font-medium text-gray-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> Low
                    </div>
                    <div className="col-span-1 text-right text-gray-600">180 days</div>
                    <div className="col-span-1 text-right text-gray-600">180 days</div>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400 italic">
                    Clock starts at first detection on a deployed endpoint.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Section G: Executive Summary Block --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <ExecutiveCard 
            title="Total New CVEs" 
            value={executive_summary.total_new_cves}
            subValue="in period"
            icon={BugReportIcon}
            colorClass="text-red-600"
            tooltip={
              <span>
                Total vulnerabilities detected within the rolling 180-day window.<br/>
                <strong>Calculation:</strong> Σ CVEs where <em>Detected Date</em> is within last 180 days.
              </span>
            }
          />
          <ExecutiveCard 
            title="Post-Deploy CVEs" 
            value={executive_summary.post_deployment_cves}
            subValue="active open"
            icon={RouterIcon}
            colorClass="text-orange-600"
            tooltip={
              <span>
                Currently open vulnerabilities affecting deployed endpoints.<br/>
                <strong>Calculation:</strong> Σ Open CVEs where <em>Disclosure Date</em> &gt; <em>Deployment Date</em>.
              </span>
            }
          />
          <ExecutiveCard 
            title="MTTR (All)" 
            value={`${executive_summary.mttr_all.toFixed(1)}d`}
            subValue="avg remediation"
            icon={ScheduleIcon}
            colorClass="text-blue-600"
            tooltip={
              <span>
                Mean Time To Remediate for all endpoint CVEs fixed in the last 180 days.<br/>
                <strong>Calculation:</strong> Σ(<em>Fix Date</em> - <em>Detect Date</em>) / Total Fixed CVEs.
              </span>
            }
          />
          <ExecutiveCard 
            title="MTTR (Post-Deploy)" 
            value={`${executive_summary.mttr_post_deployment.toFixed(1)}d`}
            subValue="mission critical"
            icon={AccessTimeIcon}
            colorClass="text-indigo-600"
            tooltip={
              <span>
                Mean Time To Remediate for Post-Deployment CVEs only.<br/>
                <strong>Calculation:</strong> Σ(<em>Fix Date</em> - <em>Detect Date</em>) / Total Fixed Post-Deploy CVEs.
              </span>
            }
          />
          <ExecutiveCard 
            title="% Open &gt; SLA" 
            value={`${executive_summary.open_cves_beyond_sla_pct.toFixed(1)}%`}
            subValue="compliance risk"
            icon={WarningAmberIcon}
            colorClass="text-yellow-600"
            tooltip={
              <span>
                Percentage of open CVEs exceeding their severity-based SLA.<br/>
                <strong>Calculation:</strong> (Count of Open CVEs &gt; SLA Days / Total Open CVEs) * 100.
              </span>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- Section A & B & C: Detailed Metrics Table --- */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Severity Breakdown & SLA Compliance</h2>
              <span className="text-xs text-gray-500">NIST SP 800-218 PP-6</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Severity</th>
                    <th className="px-6 py-3 text-center" title="Mean Time To Remediate (180d)">MTTR (Days)</th>
                    <th className="px-6 py-3 text-center" title="MTTR for Post-Deployment Issues">MTTR (Post)</th>
                    <th className="px-6 py-3 text-center" title="% Fixed Within SLA">% Fixed in SLA</th>
                    <th className="px-6 py-3 text-center" title="Mean Open Age">Mean Age</th>
                    <th className="px-6 py-3 text-center" title="Oldest Open Vulnerability">Oldest</th>
                    <th className="px-6 py-3 text-center text-red-600" title="% Open Vulnerabilities Beyond SLA">% &gt; SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {by_severity.map((row) => (
                    <tr key={row.severity} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[row.severity as keyof typeof COLORS] || COLORS.NONE }}></span>
                        {row.severity}
                      </td>
                      <td className="px-6 py-4 text-center">{row.mttr.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center font-medium text-gray-900">{row.mttr_post_deployment.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.fixed_within_sla_pct >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {row.fixed_within_sla_pct.toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">{row.mean_open_age.toFixed(1)}d</td>
                      <td className="px-6 py-4 text-center text-gray-500">{row.oldest_open_days.toFixed(0)}d</td>
                      <td className="px-6 py-4 text-center font-bold text-red-600">
                        {row.open_beyond_sla_pct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Section D: Volume & Flow (Backlog Delta) --- */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-gray-900">Volume & Flow</h2>
              <span className="text-xs text-gray-400">NIST SP 800-53 SI-2</span>
            </div>
            
            <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div>
                <p className="text-sm text-blue-800 font-bold">Backlog Delta</p>
                <p className="text-xs text-blue-600">New - Fixed</p>
              </div>
              <div className={`text-3xl font-bold ${executive_summary.backlog_delta > 0 ? 'text-red-600' : 'text-green-600'} flex items-center`}>
                {executive_summary.backlog_delta > 0 ? <TrendingUpIcon className="mr-1"/> : <TrendingDownIcon className="mr-1"/>}
                {Math.abs(executive_summary.backlog_delta)}
              </div>
            </div>

            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  <Bar dataKey="New" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Fixed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- Section F: Trend Chart --- */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Vulnerability Trend (180 Days)</h2>
              <span className="text-xs text-gray-400">NIST SP 800-137 Continuous Monitoring</span>
            </div>
            <div className="h-72">
              {loadingTrend ? (
                <div className="flex items-center justify-center h-full text-gray-400">Loading trend...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.CRITICAL} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={COLORS.CRITICAL} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      tick={{ fontSize: 12, fill: '#6b7280' }} 
                      axisLine={false} 
                      tickLine={false} 
                      minTickGap={30}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(l) => new Date(l).toLocaleDateString()}
                    />
                    <Area type="monotone" dataKey="low" stackId="1" stroke={COLORS.LOW} fill={COLORS.LOW} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="medium" stackId="1" stroke={COLORS.MEDIUM} fill={COLORS.MEDIUM} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="high" stackId="1" stroke={COLORS.HIGH} fill={COLORS.HIGH} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="critical" stackId="1" stroke={COLORS.CRITICAL} fill="url(#colorCritical)" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* --- Section E: Endpoint Impact --- */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Endpoint Impact</h2>
              <p className="text-xs text-gray-500 mt-1">Post-deployment CVE distribution by endpoint type</p>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="relative w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={endpoint_impact.post_deployment_cves_by_type as any}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="type"
                    >
                      {endpoint_impact.post_deployment_cves_by_type.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-900">{endpoint_impact.affected_endpoints_count}</span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Affected</span>
                </div>
              </div>
              
              <div className="w-full mt-4 space-y-2">
                {endpoint_impact.post_deployment_cves_by_type.map((item, index) => (
                  <div key={item.type} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                      <span className="capitalize text-gray-700">{item.type.replace('_', ' ')}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}